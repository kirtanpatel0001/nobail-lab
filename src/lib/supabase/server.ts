// ── Server-side Supabase client ───────────────────────────────
// Uses the ANON key + RLS for public reads.
// For admin mutations use the service_role key (NEVER expose to browser).

import { createClient } from '@supabase/supabase-js'
import type { PostCard, Post } from '@/types/blog'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Public client — RLS applied, only published posts visible
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

// ── QUERIES ──────────────────────────────────────────────────

export async function getAllPosts(): Promise<PostCard[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, cover_url, thumbnail_url,
      read_time, featured, published_at,
      author:authors ( name, avatar_url ),
      category:categories ( name, slug, color )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) { console.error('[Blog] getAllPosts:', error.message); return [] }
  return (data ?? []) as unknown as PostCard[]
}

export async function getFeaturedPosts(): Promise<PostCard[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, cover_url, thumbnail_url,
      read_time, featured, published_at,
      author:authors ( name, avatar_url ),
      category:categories ( name, slug, color )
    `)
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(3)

  if (error) { console.error('[Blog] getFeaturedPosts:', error.message); return [] }
  return (data ?? []) as unknown as PostCard[]
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`*, author:authors (*), category:categories (*), tags:post_tags ( tag:tags (*) )`)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) { if (error.code !== 'PGRST116') console.error('[Blog] getPostBySlug:', error.message); return null }
  return { ...data, tags: (data.tags ?? []).map((pt: { tag: unknown }) => pt.tag) } as Post
}

export async function getAllSlugs(): Promise<string[]> {
  const { data } = await supabase.from('posts').select('slug').eq('status', 'published')
  return (data ?? []).map((p: { slug: string }) => p.slug)
}