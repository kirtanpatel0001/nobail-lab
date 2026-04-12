import { supabase } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import type { PostCard } from '@/types/blog';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Research & Insights — Nobil Laboratories',
  description: 'Latest research publications, clinical trial updates, and scientific innovations from Nobil Laboratories.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogPage() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[BlogPage] Supabase error:', error.message);
  }

  const posts: PostCard[] = Array.isArray(data) ? data : [];

  return <BlogClient posts={posts} />;
}