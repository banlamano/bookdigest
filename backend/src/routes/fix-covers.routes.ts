import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

type GoogleVolume = {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
  };
};

function normalizeCoverUrl(url: string) {
  return url.replace('http:', 'https:').replace('&zoom=1', '&zoom=2');
}

async function isUrlReachable(url: string): Promise<boolean> {
  try {
    // Some hosts don't like HEAD; try HEAD then GET (small range) fallback.
    await axios.head(url, { timeout: 8000, maxRedirects: 5, validateStatus: () => true });
    return true;
  } catch {
    try {
      await axios.get(url, {
        timeout: 8000,
        maxRedirects: 5,
        responseType: 'stream',
        validateStatus: () => true,
      });
      return true;
    } catch {
      return false;
    }
  }
}

async function fetchBestCoverFromGoogleBooks(title: string, author: string | null, maxResults = 5): Promise<string | null> {
  const q = [title, author].filter(Boolean).join(' ');
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=${maxResults}`;

  const resp = await axios.get<{ items?: GoogleVolume[] }>(url, { timeout: 8000 });
  const items = resp.data.items || [];

  // Prefer larger sizes if present.
  const candidates: string[] = [];
  for (const item of items) {
    const links = item.volumeInfo?.imageLinks;
    if (!links) continue;
    const ordered = [links.extraLarge, links.large, links.medium, links.thumbnail, links.small, links.smallThumbnail]
      .filter(Boolean) as string[];
    for (const u of ordered) candidates.push(normalizeCoverUrl(u));
  }

  // Deduplicate
  const uniq = [...new Set(candidates)];
  for (const u of uniq) {
    const ok = await isUrlReachable(u);
    if (ok) return u;
  }
  return null;
}

router.post('/fix-covers', async (req, res) => {
  const { bookIds, replaceAiCovers = true } = req.body as { bookIds: string[]; replaceAiCovers?: boolean };

  if (!Array.isArray(bookIds) || bookIds.length === 0) {
    return res.status(400).json({ status: 'error', message: 'bookIds must be a non-empty array' });
  }

  let updated = 0;
  const results: Array<{ id: string; status: 'updated' | 'skipped' | 'failed'; coverImage?: string | null; reason?: string }> = [];

  for (const id of bookIds) {
    try {
      const book = await prisma.book.findUnique({ where: { id }, select: { id: true, title: true, author: true, coverImage: true } });
      if (!book) {
        results.push({ id, status: 'failed', reason: 'not_found' });
        continue;
      }

      const hasCover = !!book.coverImage && book.coverImage !== 'null' && book.coverImage !== '';
      const isAiCover = hasCover && book.coverImage.includes('/ai-covers/');

      if (hasCover && !isAiCover) {
        // It has a cover already; still might be broken, but we can't detect reliably here.
        // We'll attempt replacement anyway for the caller-provided IDs.
      } else if (isAiCover && !replaceAiCovers) {
        results.push({ id, status: 'skipped', coverImage: book.coverImage, reason: 'ai_cover_kept' });
        continue;
      }

      const best = await fetchBestCoverFromGoogleBooks(book.title, book.author, 5);
      if (!best) {
        results.push({ id, status: 'failed', coverImage: book.coverImage, reason: 'no_google_cover' });
        continue;
      }

      await prisma.book.update({ where: { id }, data: { coverImage: best } });
      updated++;
      results.push({ id, status: 'updated', coverImage: best });

      // tiny delay to be polite
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      results.push({ id, status: 'failed', reason: e instanceof Error ? e.message : 'unknown_error' });
    }
  }

  return res.json({ status: 'success', stats: { processed: bookIds.length, updated, failed: results.filter((r) => r.status === 'failed').length }, results });
});

export default router;
