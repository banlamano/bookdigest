import { Router } from 'express';
import { prisma } from '../lib/prisma';
import axios from 'axios';

const router = Router();

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
    const head = await axios.head(url, {
      timeout: 8000,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    const ct = (head.headers['content-type'] || '') as string;
    // We only accept actual images.
    if (head.status >= 200 && head.status < 300 && ct.toLowerCase().startsWith('image/')) {
      return true;
    }

    // Some hosts return 204 or text/html for hotlink-protected resources.
    return false;
  } catch {
    // Fallback: attempt a GET and check headers
    try {
      const get = await axios.get(url, {
        timeout: 8000,
        maxRedirects: 5,
        responseType: 'stream',
        validateStatus: () => true,
      });
      const ct = (get.headers['content-type'] || '') as string;
      return get.status >= 200 && get.status < 300 && ct.toLowerCase().startsWith('image/');
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
  const { bookIds, replaceAiCovers = true, fallbackToAiCover = true } = req.body as { bookIds: string[]; replaceAiCovers?: boolean; fallbackToAiCover?: boolean };

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

      if (best) {
        await prisma.book.update({ where: { id }, data: { coverImage: best } });
        updated++;
        results.push({ id, status: 'updated', coverImage: best });
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }

      if (fallbackToAiCover) {
        const aiPath = `/ai-covers/${book.id}.svg`;
        await prisma.book.update({ where: { id }, data: { coverImage: aiPath } });
        updated++;
        results.push({ id, status: 'updated', coverImage: aiPath, reason: 'fallback_ai_cover' });
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }

      results.push({ id, status: 'failed', coverImage: book.coverImage, reason: 'no_valid_cover_found' });

      // tiny delay to be polite
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      results.push({ id, status: 'failed', reason: e instanceof Error ? e.message : 'unknown_error' });
    }
  }

  return res.json({ status: 'success', stats: { processed: bookIds.length, updated, failed: results.filter((r) => r.status === 'failed').length }, results });
});

export default router;
