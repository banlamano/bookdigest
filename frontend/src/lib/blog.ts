import { blogPosts } from '@/content/blog';

export interface BlogPost {
  slug: string;
  date: string; // ISO yyyy-mm-dd
  author: string;
  category: string;
  categoryDe: string;
  readMinutes: number;
  title: string;
  titleDe: string;
  excerpt: string;
  excerptDe: string;
  keywords: string[];
  keywordsDe: string[];
  contentEn: string;
  contentDe: string; // empty string → page falls back to English content
}

/** Listing metadata only — keeps post bodies out of the client bundle. */
export type BlogPostMeta = Omit<BlogPost, 'contentEn' | 'contentDe'>;

export function getAllPosts(): BlogPost[] {
  return [...(blogPosts as BlogPost[])].sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllPostMeta(): BlogPostMeta[] {
  return getAllPosts().map(({ contentEn, contentDe, ...meta }) => meta);
}

export function getPost(slug: string): BlogPost | undefined {
  return (blogPosts as BlogPost[]).find((p) => p.slug === slug);
}
