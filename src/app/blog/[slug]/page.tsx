import { supabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import ReadingProgress from './ReadingProgress';
import GlobalImage from '@/components/GlobalImage';
import type { Post } from '@/types/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmt(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function fmtShort(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function splitContent(html: string): { top: string; bottom: string; didSplit: boolean } {
  const parts = html.split('</p>').filter(Boolean);
  if (parts.length >= 4) {
    const mid = Math.ceil(parts.length / 2);
    return {
      top: parts.slice(0, mid).join('</p>') + '</p>',
      bottom: parts.slice(mid).join('</p>'),
      didSplit: true,
    };
  }
  return { top: html, bottom: '', didSplit: false };
}

// ─── metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase
    .from('posts')
    .select('title, excerpt, cover_url, thumbnail_url')
    .eq('slug', decodeURIComponent(slug))
    .limit(1);

  const post = data?.[0];
  if (!post) return { title: 'Article Not Found' };
  const ogImage = post.thumbnail_url ?? post.cover_url;

  return {
    title: `${post.title} — Nobil Laboratories`,
    description: post.excerpt ?? '',
    openGraph: {
      title: post.title,
      description: post.excerpt ?? '',
      images: ogImage ? [ogImage] : [],
    },
  };
}

// ─── page ────────────────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: postsData, error: postError } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*), tags:post_tags(tag:tags(*))')
    .eq('slug', decodedSlug)
    .limit(1);

  if (postError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', background: '#F4F8FA' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ color: '#1A2E38', marginBottom: 8 }}>Database Error</h1>
          <p style={{ color: '#6B8A99', marginBottom: 24 }}>{postError.message}</p>
          <Link href="/blog" style={{ color: '#5BA3C4', textDecoration: 'none', fontWeight: 600 }}>← Back to Research</Link>
        </div>
      </div>
    );
  }

  const post = postsData?.[0] as Post | undefined;
  if (!post) notFound();

  const { data: allPostsData } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)')
    .eq('status', 'published')
    .neq('slug', decodedSlug)
    .order('created_at', { ascending: false });

  const allPosts = allPostsData ?? [];
  const related = [
    ...allPosts.filter(p => p.category?.slug === post.category?.slug),
    ...allPosts.filter(p => p.category?.slug !== post.category?.slug),
  ].slice(0, 3);

  const isProduct = post.category?.name?.toLowerCase().includes('formulation') ?? false;
  const hasThumbnail = !!post.thumbnail_url;
  const { top: topContent, bottom: bottomContent, didSplit } = post.content
    ? splitContent(post.content)
    : { top: '', bottom: '', didSplit: false };

  const tags: { id: string; name: string }[] = Array.isArray(post.tags)
    ? post.tags.map((t: any) => t.tag ?? t).filter(Boolean)
    : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap');

        :root {
          --ink:      #0F1E26;
          --ink2:     #1A2E38;
          --ink3:     #2C4A5C;
          --muted:    #5A7A8A;
          --light:    #8FAEBB;
          --pale:     #B8CDD6;
          --line:     #D8E6EC;
          --line-lt:  #ECF3F7;
          --bg:       #F5F8FA;
          --white:    #FFFFFF;
          --accent:   #2C4A5C;
          --accent2:  #4A90A8;
          --accent-lt:#E8F3F8;
          --gold:     #B8960C;
          --ff-serif: 'Cormorant Garamond', Georgia, serif;
          --ff-sans:  'DM Sans', 'Helvetica Neue', sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); }
        .art { font-family: var(--ff-sans); color: var(--ink2); }

        /* hero */
        .hero {
          position: relative; width: 100%; min-height: 92vh;
          display: flex; flex-direction: column; justify-content: flex-end;
          overflow: hidden; background: var(--ink);
        }
        .hero-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; opacity: .45;
          animation: heroZoom 8s ease forwards;
        }
        @keyframes heroZoom { from { transform: scale(1.04); } to { transform: scale(1); } }
        .hero-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 0%, rgba(15,30,38,.3) 40%, rgba(15,30,38,.88) 75%, rgba(15,30,38,.98) 100%);
        }
        .hero-content {
          position: relative; z-index: 2;
          max-width: 1100px; margin: 0 auto;
          padding: 0 3rem 5rem; width: 100%;
        }
        .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 2rem; flex-wrap: wrap; }
        .hero-cat-pill {
          font-family: var(--ff-sans); font-size: 10px; font-weight: 700;
          letter-spacing: .18em; text-transform: uppercase;
          padding: 6px 16px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,.25);
          color: rgba(255,255,255,.9); background: rgba(255,255,255,.1);
          backdrop-filter: blur(8px);
        }
        .hero-rule { width: 28px; height: 1px; background: rgba(255,255,255,.25); }
        .hero-meta-txt { font-size: 12px; font-weight: 500; color: rgba(255,255,255,.5); letter-spacing: .04em; }
        .hero-title {
          font-family: var(--ff-serif);
          font-size: clamp(36px, 6vw, 72px); font-weight: 600;
          color: #fff; line-height: 1.05; letter-spacing: -.02em;
          max-width: 860px; margin-bottom: 1.75rem;
        }
        .hero-excerpt {
          font-size: clamp(15px, 1.5vw, 19px); color: rgba(255,255,255,.6);
          line-height: 1.75; font-weight: 300; max-width: 640px;
          margin-bottom: 3rem;
        }
        .hero-author {
          display: inline-flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14);
          backdrop-filter: blur(12px); border-radius: 100px;
          padding: 10px 22px 10px 10px;
        }
        .hero-ava {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--accent2); display: flex; align-items: center;
          justify-content: center; font-family: var(--ff-serif);
          font-size: 18px; font-weight: 600; color: #fff; flex-shrink: 0;
        }
        .hero-author-name { font-size: 14px; font-weight: 600; color: #fff; }
        .hero-author-role { font-size: 11.5px; color: rgba(255,255,255,.45); margin-top: 1px; }

        /* stats bar */
        .stats-bar { background: var(--white); border-bottom: 1px solid var(--line); }
        .stats-bar-inner {
          max-width: 1100px; margin: 0 auto; padding: 0 3rem;
          display: flex; align-items: stretch;
        }
        .stat-item {
          display: flex; align-items: center; gap: 10px;
          padding: 1.1rem 2rem; border-right: 1px solid var(--line);
          font-size: 12.5px; font-weight: 500; color: var(--muted);
        }
        .stat-item:first-child { padding-left: 0; }
        .stat-item:last-child { border-right: none; margin-left: auto; }
        .stat-item svg { color: var(--accent2); opacity: .8; flex-shrink: 0; }
        .stat-val { font-weight: 700; color: var(--ink2); }

        /* breadcrumb */
        .bc {
          max-width: 1100px; margin: 0 auto; padding: 1.5rem 3rem .5rem;
          display: flex; align-items: center; gap: 8px;
          font-size: 11.5px; font-weight: 500; color: var(--pale); flex-wrap: wrap;
        }
        .bc a { color: var(--muted); text-decoration: none; transition: color .15s; }
        .bc a:hover { color: var(--accent2); }
        .bc-sep { color: var(--line); }
        .bc-cur { color: var(--ink2); font-weight: 600; max-width: 340px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* layout */
        .layout {
          max-width: 1100px; margin: 0 auto;
          padding: 3.5rem 3rem 6rem;
          display: grid; grid-template-columns: 1fr 300px;
          gap: 5rem; align-items: start;
        }

        /* prose */
        .prose { font-size: 17px; line-height: 1.95; color: var(--ink3); font-weight: 300; }
        .prose h2 {
          font-family: var(--ff-serif); font-size: 32px; font-weight: 600;
          color: var(--ink); margin: 3.5rem 0 1.25rem; line-height: 1.2;
          letter-spacing: -.02em; padding-top: 1rem; border-top: 1px solid var(--line);
        }
        .prose h3 { font-size: 19px; font-weight: 600; color: var(--ink2); margin: 2.5rem 0 1rem; }
        .prose p { margin: 0 0 1.6rem; }
        .prose p:first-child::first-letter {
          font-family: var(--ff-serif); font-size: 82px; font-weight: 700;
          float: left; line-height: .78; margin: .08em .12em 0 0; color: var(--accent2);
        }
        .prose a { color: var(--accent2); text-decoration: underline; text-underline-offset: 3px; font-weight: 500; }
        .prose a:hover { color: var(--accent); }
        .prose strong { font-weight: 600; color: var(--ink2); }
        .prose em { font-style: italic; font-family: var(--ff-serif); font-size: 1.05em; }
        .prose ul, .prose ol { padding-left: 1.5rem; margin: 0 0 1.6rem; }
        .prose li { margin-bottom: .6rem; line-height: 1.85; }
        .prose blockquote {
          margin: 3rem -1.5rem; padding: 2.5rem 3rem;
          background: var(--ink2); border-radius: 4px; position: relative;
        }
        .prose blockquote::before {
          content: '"'; font-family: var(--ff-serif); font-size: 120px; line-height: .6;
          color: rgba(255,255,255,.08); position: absolute; top: 1.5rem; left: 1.5rem;
        }
        .prose blockquote p {
          font-family: var(--ff-serif); font-size: 22px; font-style: italic;
          color: rgba(255,255,255,.88); line-height: 1.6; margin: 0; position: relative; z-index: 1;
        }
        .prose blockquote p::first-letter { all: unset; }
        .prose img { width: 100%; display: block; margin: 3rem 0; border-radius: 6px; border: 1px solid var(--line); }

        /* mid image */
        .mid-img-wrap {
          margin: 3.5rem 0; border-radius: 8px; overflow: hidden;
          border: 1px solid var(--line); background: var(--white);
          box-shadow: 0 4px 32px rgba(15,30,38,.07);
        }
        .mid-img-label {
          font-size: 12px; font-weight: 500; color: var(--pale);
          font-style: italic; padding: .75rem 1rem;
          border-top: 1px solid var(--line); background: var(--bg);
          text-align: center; letter-spacing: .02em;
        }

        /* tags */
        .tags-section { margin-top: 4rem; padding-top: 2.5rem; border-top: 1px solid var(--line); }
        .tags-label { font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }
        .tags-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag { font-size: 12px; font-weight: 500; color: var(--muted); background: var(--white); border: 1px solid var(--line); padding: 6px 16px; border-radius: 100px; transition: all .2s; text-decoration: none; display: inline-block; }
        .tag:hover { background: var(--accent-lt); color: var(--accent2); border-color: var(--accent2); }

        /* sidebar */
        .sidebar { display: flex; flex-direction: column; gap: 1.75rem; position: sticky; top: 2.5rem; }
        .sb-card { background: var(--white); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
        .sb-head { padding: .9rem 1.25rem; background: var(--ink2); font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.65); }
        .sb-body { padding: 1.25rem; }
        .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line-lt); font-size: 13px; }
        .info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .info-k { color: var(--muted); font-weight: 500; }
        .info-v { font-weight: 600; color: var(--ink2); text-align: right; }
        .rel-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line-lt); text-decoration: none; transition: opacity .2s; align-items: flex-start; }
        .rel-item:last-child { border-bottom: none; padding-bottom: 0; }
        .rel-item:hover { opacity: .7; }
        .rel-thumb { width: 64px; height: 64px; border-radius: 6px; overflow: hidden; flex-shrink: 0; border: 1px solid var(--line); background: var(--bg); }
        .rel-title { font-size: 13px; font-weight: 600; color: var(--ink2); line-height: 1.4; margin-bottom: 5px; }
        .rel-meta { font-size: 11px; color: var(--pale); font-weight: 500; }
        .share-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .share-btn { display: flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 8px; border: 1px solid var(--line); border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--ink3); background: var(--bg); cursor: pointer; transition: all .2s; font-family: inherit; }
        .share-btn:hover { background: var(--accent-lt); border-color: var(--accent2); color: var(--accent2); }
        .share-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* keep reading */
        .keep-reading { background: var(--ink); padding: 5rem 3rem 6rem; }
        .kr-inner { max-width: 1100px; margin: 0 auto; }
        .kr-label { font-size: 10.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--accent2); margin-bottom: 1rem; }
        .kr-title { font-family: var(--ff-serif); font-size: clamp(28px, 3vw, 42px); font-weight: 600; color: #fff; letter-spacing: -.02em; line-height: 1.1; margin-bottom: 3rem; }
        .kr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .kr-card { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; overflow: hidden; text-decoration: none; transition: background .25s, transform .25s, border-color .25s; display: flex; flex-direction: column; }
        .kr-card:hover { background: rgba(255,255,255,.09); transform: translateY(-4px); border-color: rgba(255,255,255,.2); }
        .kr-card-body { padding: 1.4rem; flex: 1; display: flex; flex-direction: column; }
        .kr-card-cat { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 10px; }
        .kr-card-title { font-family: var(--ff-serif); font-size: 19px; font-weight: 600; color: rgba(255,255,255,.88); line-height: 1.35; margin-bottom: 14px; flex: 1; }
        .kr-card-meta { font-size: 11.5px; color: rgba(255,255,255,.3); font-weight: 500; }
        .kr-card-arrow { margin-top: 14px; display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent2); transition: gap .15s; }
        .kr-card:hover .kr-card-arrow { gap: 9px; }

        /* responsive */
        @media (max-width: 1024px) {
          .layout { grid-template-columns: 1fr; gap: 3rem; padding: 2.5rem 2rem 4rem; }
          .sidebar { position: static; }
          .kr-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-content, .stats-bar-inner, .bc, .keep-reading { padding-left: 2rem; padding-right: 2rem; }
          .keep-reading { padding-top: 4rem; padding-bottom: 5rem; }
        }
        @media (max-width: 640px) {
          .hero { min-height: 80vh; }
          .hero-content { padding: 0 1.25rem 3.5rem; }
          .hero-title { font-size: 30px; }
          .hero-excerpt { display: none; }
          .stats-bar-inner { flex-wrap: wrap; padding: 0 1.25rem; }
          .stat-item { padding: .85rem .75rem; border-right: none; border-bottom: 1px solid var(--line); flex: 1; min-width: 130px; }
          .stat-item:last-child { border-bottom: none; margin-left: 0; }
          .bc { padding-left: 1.25rem; }
          .layout { padding: 2rem 1.25rem 3rem; }
          .prose blockquote { margin: 2rem 0; padding: 1.75rem 1.5rem; }
          .kr-grid { grid-template-columns: 1fr; }
          .keep-reading { padding: 3rem 1.25rem 4rem; }
        }
      `}</style>

      <ReadingProgress />

      <article className="art">

        {/* ── HERO ── */}
        <div className="hero">
          {post.cover_url && (
            <img
              src={post.cover_url}
              alt={post.title}
              className="hero-img"

            />
          )}
          <div className="hero-gradient" />
          <div className="hero-content">
            <div className="hero-eyebrow">
              {post.category && (
                <span className="hero-cat-pill" style={{ borderColor: `${post.category.color}55`, color: post.category.color ?? 'rgba(255,255,255,.9)' }}>
                  {post.category.name}
                </span>
              )}
              <div className="hero-rule" />
              <span className="hero-meta-txt">{fmt(post.published_at)}</span>
              <div className="hero-rule" />
              <span className="hero-meta-txt">{post.read_time} min read</span>
            </div>

            <h1 className="hero-title">{post.title}</h1>

            {post.excerpt && <p className="hero-excerpt">{post.excerpt}</p>}

            {post.author && (
              <div className="hero-author">
                <div className="hero-ava">{post.author.name[0]}</div>
                <div>
                  <div className="hero-author-name">{post.author.name}</div>
                  <div className="hero-author-role">{post.author.role ?? 'Contributor'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div className="stats-bar">
          <div className="stats-bar-inner">
            <div className="stat-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span><span className="stat-val">{post.read_time}</span> min read</span>
            </div>
            <div className="stat-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Published <span className="stat-val">{fmtShort(post.published_at)}</span></span>
            </div>
            {post.category && (
              <div className="stat-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <span style={{ color: post.category.color ?? 'var(--accent2)', fontWeight: 700 }}>{post.category.name}</span>
              </div>
            )}
            {post.author && (
              <div className="stat-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <span><span className="stat-val">{post.author.name}</span></span>
              </div>
            )}
          </div>
        </div>

        {/* ── BREADCRUMB ── */}
        <nav className="bc">
          <Link href="/">Home</Link>
          <span className="bc-sep">/</span>
          <Link href="/blog">Research &amp; Updates</Link>
          <span className="bc-sep">/</span>
          {post.category && (
            <>
              <Link href="/blog">{post.category.name}</Link>
              <span className="bc-sep">/</span>
            </>
          )}
          <span className="bc-cur">{post.title}</span>
        </nav>

        {/* ── BODY ── */}
        <div className="layout">
          <main>
            {topContent && (
              <div className="prose" dangerouslySetInnerHTML={{ __html: topContent }} />
            )}

            {hasThumbnail && (
              <div className="mid-img-wrap">
                <GlobalImage
                  src={post.thumbnail_url!}
                  alt={`${post.title} — detail`}
                  mode="contain"
                  aspectRatio="16/9"
                />
                <div className="mid-img-label">Nobil Laboratories — Research Illustration</div>
              </div>
            )}

            {didSplit && bottomContent && (
              <div className="prose" dangerouslySetInnerHTML={{ __html: bottomContent }} />
            )}

            {tags.length > 0 && (
              <div className="tags-section">
                <div className="tags-label">Related Topics</div>
                <div className="tags-list">
                  {tags.map(t => (
                    <span key={t.id} className="tag">{t.name}</span>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ── SIDEBAR ── */}
          <aside className="sidebar">
            <div className="sb-card">
              <div className="sb-head">Publication Info</div>
              <div className="sb-body">
                <div className="info-row"><span className="info-k">Published</span><span className="info-v">{fmtShort(post.published_at)}</span></div>
                <div className="info-row"><span className="info-k">Read Time</span><span className="info-v">{post.read_time} min</span></div>
                <div className="info-row"><span className="info-k">Division</span><span className="info-v" style={{ color: post.category?.color ?? 'var(--accent2)' }}>{post.category?.name ?? '—'}</span></div>
                {post.author && (
                  <div className="info-row"><span className="info-k">Author</span><span className="info-v">{post.author.name}</span></div>
                )}
              </div>
            </div>

            {related.length > 0 && (
              <div className="sb-card">
                <div className="sb-head">Related Research</div>
                <div className="sb-body">
                  {related.map(p => (
                    <Link key={p.id} href={`/blog/${p.slug}`} className="rel-item">
                      <div className="rel-thumb">
                        <GlobalImage src={p.thumbnail_url ?? p.cover_url} alt={p.title} mode="contain" aspectRatio="1/1" />
                      </div>
                      <div>
                        <div className="rel-title">{p.title}</div>
                        <div className="rel-meta">{fmtShort(p.published_at)} · {p.read_time} min</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="sb-card">
              <div className="sb-head">Share Article</div>
              <div className="sb-body">
                <div className="share-grid">
                  <button className="share-btn"><span className="share-dot" style={{ background: '#1D9BF0' }} />Twitter</button>
                  <button className="share-btn"><span className="share-dot" style={{ background: '#0A66C2' }} />LinkedIn</button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── KEEP READING ── */}
        {related.length > 0 && (
          <div className="keep-reading">
            <div className="kr-inner">
              <div className="kr-label">Continue Exploring</div>
              <h2 className="kr-title">More from Nobil Laboratories</h2>
              <div className="kr-grid">
                {related.map(p => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="kr-card">
                    <GlobalImage
                      src={p.thumbnail_url ?? p.cover_url}
                      alt={p.title}
                      mode={p.category?.name?.toLowerCase().includes('formulation') ? 'contain' : 'cover'}
                      aspectRatio="16/10"
                    />
                    <div className="kr-card-body">
                      {p.category && (
                        <div className="kr-card-cat" style={{ color: p.category.color ?? 'var(--accent2)' }}>
                          {p.category.name}
                        </div>
                      )}
                      <div className="kr-card-title">{p.title}</div>
                      <div className="kr-card-meta">{fmtShort(p.published_at)} · {p.read_time} min read</div>
                      <span className="kr-card-arrow">
                        Read
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

      </article>
    </>
  );
}