import { Metadata } from 'next';
import { getAllPostMeta } from '@/lib/blog';
import BlogList from './BlogList';

export const metadata: Metadata = {
  title: 'Blog — Book Insights & Reading Tips',
  description:
    'Curated book lists, reading strategies, and insights from 900+ book summaries on BookDigest.',
};

export default function BlogPage() {
  return <BlogList posts={getAllPostMeta()} />;
}
