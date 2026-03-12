import { supabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import ReadingProgress from './ReadingProgress';
import GlobalImage from '@/components/GlobalImage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  
  const { data: posts } = await supabase
    .from('posts')
    .select('title, excerpt, cover_url, thumbnail_url')
    .eq('slug', slug)
    .limit(1);

  const post = posts?.[0];

  if (!post) return { title: 'Article Not Found' };
  
  return {
    title: `${post.title} — Nobil Laboratories`,
    description: post.excerpt ?? '',
    openGraph: { 
      title: post.title, 
      description: post.excerpt ?? '', 
      images: post.thumbnail_url || post.cover_url ? [post.thumbnail_url || post.cover_url] : [] 
    },
  };
}

function fmt(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function BlogPostPage({ params }: any) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  
  const { data: postsData, error: postError } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)')
    .eq('slug', slug)
    .limit(1);

  const post = postsData?.[0];

  if (postError) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: 'red', marginBottom: '10px' }}>Database Error</h1>
        <p style={{ color: '#555' }}>{postError.message}</p>
        <Link href="/blog" style={{ display: 'inline-block', marginTop: '20px', color: 'blue', textDecoration: 'underline' }}>← Back to Blog</Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ marginBottom: '10px' }}>Article Not Found</h1>
        <p style={{ color: '#555' }}>We looked for a post with the URL slug: <strong style={{ color: 'black' }}>"{slug}"</strong></p>
        <Link href="/blog" style={{ display: 'inline-block', marginTop: '20px', color: 'blue', textDecoration: 'underline' }}>← Back to Blog</Link>
      </div>
    );
  }

  const { data: allPostsData } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const allPosts = allPostsData || [];
  const isProduct = post.category?.name?.toLowerCase().includes('formulation') || false;

  const related = [
    ...allPosts.filter(p => p.slug !== slug && p.category?.slug === post.category?.slug),
    ...allPosts.filter(p => p.slug !== slug && p.category?.slug !== post.category?.slug),
  ].slice(0, 3);

  // --- SMART CONTENT SPLITTING LOGIC ---
  let topContent = post.content || "";
  let bottomContent = "";
  let showMidImage = false;

  if (post.thumbnail_url && post.content) {
    const splitToken = "</p>";
    const parts = post.content.split(splitToken);
    
    // If the article has more than 2 paragraphs, split it in half
    if (parts.length > 2) {
      const mid = Math.floor(parts.length / 2);
      topContent = parts.slice(0, mid).join(splitToken) + splitToken;
      bottomContent = parts.slice(mid).join(splitToken);
      showMidImage = true;
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');

        :root {
          --c-bg: #F4F8FA; --c-white: #FFFFFF; --c-ink: #1A2E38; --c-ink2: #2C4A5C;
          --c-muted: #6B8A99; --c-light: #A8BEC8; --c-line: #DDE6EA; --c-line-lt: #EBF3F7;
          --c-accent: #2C4A5C; --c-accent2: #5BA3C4; --c-accent-lt: #EBF3F7; --c-tag: #FFFFFF;
          --ff-serif: 'Playfair Display', Georgia, serif;
          --ff-sans: 'DM Sans', 'Helvetica Neue', sans-serif;
          --ff-mono: 'Courier New', monospace;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .rn-wrap { background: var(--c-bg); min-height: 100vh; font-family: var(--ff-sans); color: var(--c-ink); }

        .rn-breadcrumb { max-width: 1240px; margin: 0 auto; padding: 1.5rem 2rem; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: var(--c-light); font-family: var(--ff-sans); }
        .rn-bc-link { color: var(--c-muted); text-decoration: none; transition: color .15s; }
        .rn-bc-link:hover { color: var(--c-accent2); }
        .rn-bc-sep { color: var(--c-line); }
        .rn-bc-cur { color: var(--c-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px; font-weight: 600; }

        .rn-hero { max-width: 1240px; margin: 0 auto; padding: 1rem 2rem 2.5rem; }
        .rn-hero-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .rn-category-badge { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; font-family: var(--ff-sans); padding: 5px 14px; border-radius: 100px; background: var(--c-accent-lt); color: var(--c-accent2); box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .rn-meta-dot { color: var(--c-line); font-size: 16px; }
        .rn-meta-txt { font-size: 13px; font-weight: 500; color: var(--c-muted); }

        .rn-hero-title { font-family: var(--ff-serif); font-size: clamp(32px, 5vw, 56px); font-weight: 800; color: var(--c-ink); line-height: 1.1; letter-spacing: -.03em; margin-bottom: 1.5rem; max-width: 900px; }
        .rn-hero-excerpt { font-size: 18px; color: var(--c-muted); line-height: 1.8; font-weight: 300; max-width: 760px; margin-bottom: 2rem; font-family: var(--ff-sans); }

        .rn-author-row { display: flex; align-items: center; gap: 14px; padding: 1.5rem 0; border-top: 1px solid var(--c-line); border-bottom: 1px solid var(--c-line); flex-wrap: wrap; background: var(--c-white); padding: 1.25rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .rn-author-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--c-accent); display: flex; align-items: center; justify-content: center; font-family: var(--ff-serif); font-size: 18px; font-weight: 600; color: #fff; flex-shrink: 0; }
        .rn-author-name { font-size: 15px; font-weight: 700; color: var(--c-ink); letter-spacing: -.01em; }
        .rn-author-role { font-size: 12.5px; color: var(--c-light); margin-top: 2px; }
        .rn-author-stats { margin-left: auto; display: flex; align-items: center; gap: 2rem; }
        .rn-author-stat { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: var(--c-muted); }
        .rn-author-stat svg { opacity: .6; color: var(--c-accent2); }

        .rn-cover { max-width: 1240px; margin: 0 auto; padding: 0 2rem 3rem; }
        .main-cover-override { border-radius: 12px; box-shadow: 0 12px 40px rgba(44,74,92,0.08); border: 1px solid var(--c-line); }
        .rn-cover-caption { font-size: 12.5px; color: var(--c-light); font-style: italic; font-family: var(--ff-serif); margin-top: 1rem; text-align: center; }

        .rn-layout { max-width: 1240px; margin: 0 auto; padding: 0 2rem 5rem; display: grid; grid-template-columns: 1fr 320px; gap: 4rem; }

        .rn-prose { font-size: 17.5px; line-height: 1.9; color: var(--c-ink2); font-family: var(--ff-sans); font-weight: 300; }
        .rn-prose h2 { font-family: var(--ff-sans); font-size: 24px; font-weight: 700; color: var(--c-ink); margin: 3rem 0 1.25rem; line-height: 1.3; letter-spacing: -.02em; }
        .rn-prose h3 { font-family: var(--ff-sans); font-size: 19px; font-weight: 600; color: var(--c-ink); margin: 2.5rem 0 1rem; }
        .rn-prose p { margin: 0 0 1.5rem; }
        .rn-prose p:first-child::first-letter { font-family: var(--ff-serif); font-size: 72px; font-weight: 800; float: left; line-height: .8; margin: .1em .15em 0 0; color: var(--c-accent2); }
        .rn-prose a { color: var(--c-accent2); text-decoration: underline; text-underline-offset: 4px; font-weight: 500; }
        .rn-prose a:hover { color: var(--c-accent); }
        .rn-prose strong { font-weight: 700; color: var(--c-ink); }
        .rn-prose em { font-style: italic; }
        .rn-prose ul, .rn-prose ol { padding-left: 1.5rem; margin: 0 0 1.5rem; }
        .rn-prose li { margin-bottom: .5rem; line-height: 1.85; padding-left: 0.5rem; }
        .rn-prose blockquote { margin: 2.5rem 0; padding: 2rem; border-left: 4px solid var(--c-accent2); background: var(--c-white); font-family: var(--ff-serif); font-size: 20px; font-style: italic; color: var(--c-accent); line-height: 1.7; border-radius: 0 8px 8px 0; box-shadow: 0 4px 24px rgba(44,74,92,0.04); border-top: 1px solid var(--c-line-lt); border-right: 1px solid var(--c-line-lt); border-bottom: 1px solid var(--c-line-lt); }
        .rn-prose img { width: 100%; display: block; margin: 3rem 0; border-radius: 8px; border: 1px solid var(--c-line); box-shadow: 0 8px 24px rgba(0,0,0,0.04); }

        .thumbnail-override { border-radius: 8px; border: 1px solid var(--c-line); box-shadow: 0 8px 32px rgba(0,0,0,0.04); margin: 3rem 0; width: 100%; background: var(--c-white); }

        .rn-tags { margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid var(--c-line); }
        .rn-tags-label { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--c-ink); margin-bottom: 12px; }
        .rn-tags-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .rn-tag { font-size: 12.5px; font-weight: 500; color: var(--c-muted); background: var(--c-white); border: 1px solid var(--c-line); padding: 6px 16px; border-radius: 100px; transition: all .2s; }
        .rn-tag:hover { background: var(--c-accent-lt); color: var(--c-accent2); border-color: var(--c-accent2); }

        .rn-sidebar { display: flex; flex-direction: column; gap: 2rem; position: sticky; top: 2rem; }
        .rn-sb-card { background: var(--c-white); border: 1px solid var(--c-line); border-radius: 8px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .rn-sb-title { font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--c-ink); margin-bottom: 1.25rem; padding-bottom: .75rem; border-bottom: 2px solid var(--c-ink); font-family: var(--ff-sans); }

        .rn-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--c-line-lt); font-size: 13.5px; }
        .rn-detail-row:last-child { border-bottom: none; padding-bottom: 0; }
        .rn-detail-k { color: var(--c-muted); font-weight: 500; }
        .rn-detail-v { font-weight: 600; color: var(--c-ink); text-align: right; }

        .rn-related-item { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--c-line-lt); text-decoration: none; transition: opacity .2s; align-items: center; }
        .rn-related-item:last-child { border-bottom: none; padding-bottom: 0; }
        .rn-related-item:hover { opacity: .7; }
        .sidebar-thumb-override { width: 72px; height: 72px; border-radius: 6px; border: 1px solid var(--c-line); flex-shrink: 0; border-bottom: none !important; }
        .rn-related-info { flex: 1; }
        .rn-related-cat { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 6px; }
        .rn-related-ttl { font-size: 13.5px; font-weight: 600; color: var(--c-ink); line-height: 1.4; margin-bottom: 6px; }
        .rn-related-meta { font-size: 11.5px; color: var(--c-light); font-weight: 500; }

        .rn-share-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .rn-share-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border: 1px solid var(--c-line); border-radius: 6px; font-size: 12.5px; color: var(--c-ink2); background: var(--c-bg); cursor: pointer; font-weight: 600; transition: all .2s; }
        .rn-share-btn:hover { background: var(--c-accent-lt); border-color: var(--c-accent2); color: var(--c-accent2); }
        .rn-share-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        .rn-related-bottom { max-width: 1240px; margin: 0 auto; padding: 0 2rem 4rem; border-top: 1px solid var(--c-line); padding-top: 4rem; }
        .rn-related-bottom-title { font-family: var(--ff-serif); font-size: 32px; font-weight: 800; color: var(--c-ink); margin-bottom: .5rem; letter-spacing: -.02em; }
        .rn-related-bottom-sub { font-size: 15px; color: var(--c-muted); margin-bottom: 2.5rem; }
        .rn-related-bottom-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        
        .rn-rel-card { background: var(--c-white); border: 1px solid var(--c-line); border-radius: 8px; overflow: hidden; text-decoration: none; transition: box-shadow .3s, transform .3s; display: flex; flex-direction: column; }
        .rn-rel-card:hover { box-shadow: 0 12px 32px rgba(44,74,92,0.08); transform: translateY(-4px); }
        .rn-rel-card-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
        .rn-rel-card-cat { font-size: 10.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 10px; }
        .rn-rel-card-title { font-family: var(--ff-sans); font-size: 16px; font-weight: 700; color: var(--c-ink); line-height: 1.4; margin-bottom: 12px; flex: 1; }
        .rn-rel-card-meta { font-size: 12px; font-weight: 500; color: var(--c-light); display: flex; align-items: center; gap: 8px; }

        @media (max-width: 960px) { .rn-layout { grid-template-columns: 1fr; gap: 3rem; } .rn-related-bottom-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .rn-hero, .rn-cover, .rn-layout, .rn-breadcrumb, .rn-related-bottom { padding-left: 1.25rem; padding-right: 1.25rem; } .rn-hero-title { font-size: 28px; } .rn-related-bottom-grid { grid-template-columns: 1fr; } .rn-author-stats { display: none; } }
      `}</style>

      <ReadingProgress />

      <div className="rn-wrap">
        
        <nav className="rn-breadcrumb">
          <Link href="/" className="rn-bc-link">Home</Link>
          <span className="rn-bc-sep">/</span>
          <Link href="/blog" className="rn-bc-link">Research & Updates</Link>
          <span className="rn-bc-sep">/</span>
          {post.category && (
            <>
              <Link href="/blog" className="rn-bc-link">{post.category.name}</Link>
              <span className="rn-bc-sep">/</span>
            </>
          )}
          <span className="rn-bc-cur">{post.title}</span>
        </nav>

        <header className="rn-hero">
          <div className="rn-hero-meta">
            {post.category && (
              <span className="rn-category-badge" style={{ background: `${post.category.color}18`, color: post.category.color }}>
                {post.category.name}
              </span>
            )}
            <span className="rn-meta-dot">·</span>
            <span className="rn-meta-txt">{fmt(post.published_at)}</span>
            <span className="rn-meta-dot">·</span>
            <span className="rn-meta-txt">{post.read_time} min read</span>
          </div>

          <h1 className="rn-hero-title">{post.title}</h1>
          {post.excerpt && <p className="rn-hero-excerpt">{post.excerpt}</p>}

          <div className="rn-author-row">
            {post.author && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="rn-author-avatar">{post.author.name[0]}</div>
                <div>
                  <div className="rn-author-name">{post.author.name}</div>
                  <div className="rn-author-role">{post.author.role || 'Contributor'}</div>
                </div>
              </div>
            )}
            <div className="rn-author-stats">
              <div className="rn-author-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {post.read_time} min
              </div>
              <div className="rn-author-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {fmt(post.published_at)}
              </div>
            </div>
          </div>
        </header>

        {post.cover_url && (
          <div className="rn-cover">
            <GlobalImage 
              src={post.cover_url} 
              alt={post.title} 
              mode={isProduct ? 'contain' : 'cover'} 
              aspectRatio="21/9"
              className="main-cover-override"
            />
          </div>
        )}

        <div className="rn-layout">
          <main>
            {/* TOP HALF OF THE TEXT */}
            <div className="rn-prose" dangerouslySetInnerHTML={{ __html: topContent }} />

            {/* MID-ARTICLE IMAGE INJECTION */}
            {showMidImage && (
              <GlobalImage 
                src={post.thumbnail_url} 
                alt="Article Middle Image" 
                mode="contain" 
                aspectRatio="16/9"
                className="thumbnail-override"
              />
            )}

            {/* BOTTOM HALF OF THE TEXT */}
            {showMidImage && (
              <div className="rn-prose" dangerouslySetInnerHTML={{ __html: bottomContent }} />
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="rn-tags">
                <div className="rn-tags-label">Related Tags</div>
                <div className="rn-tags-list">
                  {post.tags.map((t: any) => (
                    <span key={t.id} className="rn-tag">{t.name}</span>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="rn-sidebar">
            <div className="rn-sb-card">
              <div className="rn-sb-title">Publication Info</div>
              <div className="rn-detail-row"><span className="rn-detail-k">Published</span><span className="rn-detail-v">{fmt(post.published_at)}</span></div>
              <div className="rn-detail-row"><span className="rn-detail-k">Read Time</span><span className="rn-detail-v">{post.read_time} min</span></div>
              <div className="rn-detail-row"><span className="rn-detail-k">Division</span><span className="rn-detail-v" style={{ color: post.category?.color }}>{post.category?.name ?? '—'}</span></div>
            </div>

            {/* Related Sidebar */}
            {related.length > 0 && (
              <div className="rn-sb-card">
                <div className="rn-sb-title">Related Research</div>
                <div>
                  {related.map((p: any) => (
                    <Link key={p.id} href={`/blog/${p.slug}`} className="rn-related-item">
                      <GlobalImage src={p.thumbnail_url || p.cover_url} alt={p.title} mode="contain" aspectRatio="1/1" className="sidebar-thumb-override" />
                      <div className="rn-related-info">
                        <div className="rn-related-ttl">{p.title}</div>
                        <div className="rn-related-meta">{fmt(p.published_at)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="rn-sb-card">
              <div className="rn-sb-title">Share Article</div>
              <div className="rn-share-grid">
                <button className="rn-share-btn"><span className="rn-share-dot" style={{ background: '#1D9BF0' }} />Twitter</button>
                <button className="rn-share-btn"><span className="rn-share-dot" style={{ background: '#0A66C2' }} />LinkedIn</button>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="rn-related-bottom">
            <h2 className="rn-related-bottom-title">Keep Reading</h2>
            <p className="rn-related-bottom-sub">More scientific insights from Nobil Laboratories.</p>
            <div className="rn-related-bottom-grid">
              {related.map((p: any) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="rn-rel-card">
                  <GlobalImage src={p.thumbnail_url || p.cover_url} alt={p.title} mode="contain" aspectRatio="16/11" />
                  <div className="rn-rel-card-body">
                    <div className="rn-rel-card-cat" style={{ color: p.category?.color ?? '#2C4A5C' }}>{p.category?.name}</div>
                    <div className="rn-rel-card-title">{p.title}</div>
                    <div className="rn-rel-card-meta">{fmt(p.published_at)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}