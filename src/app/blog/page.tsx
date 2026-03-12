import { supabase } from '@/lib/supabase/server';
import Link from 'next/link';
import type { PostCard } from '@/types/blog';
import type { Metadata } from 'next';
import MostReadRotator from './MostReadRotator';
import GlobalImage from '@/components/GlobalImage';

export const metadata: Metadata = {
  title: 'Research & Insights — Nobil Laboratories',
  description: 'Latest research publications, clinical trial updates, and scientific innovations from Nobil Laboratories.',
};

export const revalidate = 60;

function fmt(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ArticleCard({ post }: { post: PostCard }) {
  const isProduct = post.category?.name?.toLowerCase().includes('formulation') || true;

  return (
    <Link href={`/blog/${post.slug}`} className="rn-card">
      <div style={{ position: 'relative' }}>
        <GlobalImage 
          src={post.cover_url} 
          alt={post.title} 
          mode={isProduct ? 'contain' : 'cover'} 
        />
        {post.category && (
          <span className="rn-card-cat-badge" style={{ background: post.category.color ?? '#5BA3C4' }}>
            {post.category.name}
          </span>
        )}
      </div>
      <div className="rn-card-body">
        <div className="rn-card-meta">
          <span className="rn-card-date">{fmt(post.published_at)}</span>
          <span className="rn-card-dot">·</span>
          <span className="rn-card-read">{post.read_time} min read</span>
        </div>
        <h2 className="rn-card-title">{post.title}</h2>
        {post.excerpt && <p className="rn-card-exc">{post.excerpt}</p>}
        <div className="rn-card-foot">
          {post.author && (
            <div className="rn-card-author">
              <div className="rn-card-ava">{post.author.name[0]}</div>
              <span className="rn-card-author-name">{post.author.name}</span>
            </div>
          )}
          <span className="rn-card-cta">
            Read
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function BlogPage() {
  // Fetch real data directly from Supabase to prevent 404 issues
  const { data: postsData } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const safePosts: PostCard[] = Array.isArray(postsData) ? postsData : [];
  const [hero, ...rest] = safePosts;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap');

        :root {
          --bg: #F4F8FA;
          --white: #FFFFFF;
          --ink: #1A2E38;
          --ink2: #2C4A5C;
          --muted: #6B8A99;
          --light: #A8BEC8;
          --line: #DDE6EA;
          --line-lt: #EBF3F7;
          --accent: #2C4A5C;
          --accent2: #5BA3C4;
          --ff-serif: 'Playfair Display', Georgia, serif;
          --ff-sans: 'DM Sans', 'Helvetica Neue', sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .rn-blog { background: var(--bg); min-height: 100vh; font-family: var(--ff-sans); color: var(--ink); }

        .rn-ph { background: var(--white); border-bottom: 1px solid var(--line); padding: 2rem 2.5rem; }
        .rn-ph-inner { max-width: 1240px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; }
        .rn-ph-eyebrow { font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--accent2); margin-bottom: 8px; }
        .rn-ph-title { font-family: var(--ff-serif); font-size: clamp(24px, 3vw, 36px); font-weight: 700; color: var(--ink); letter-spacing: -.02em; line-height: 1.1; }
        .rn-ph-count { flex-shrink: 0; text-align: right; }
        .rn-ph-count-num { font-family: var(--ff-serif); font-size: 32px; font-weight: 700; color: var(--accent); line-height: 1; }
        .rn-ph-count-label { font-size: 10px; color: var(--light); text-transform: uppercase; letter-spacing: .1em; margin-top: 4px; font-weight: 600; }

        .rn-body { max-width: 1240px; margin: 0 auto; padding: 2.5rem 2.5rem 5rem; display: grid; grid-template-columns: 1fr 300px; gap: 3.5rem; align-items: start; }

        .rn-hero-card { display: grid; grid-template-columns: 1fr 1.2fr; background: var(--white); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; text-decoration: none; margin-bottom: 2.5rem; transition: box-shadow .2s, transform .2s; }
        .rn-hero-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,.06); transform: translateY(-2px); }
        .rn-hero-card:hover .gl-img { transform: scale(1.03); }
        .rn-hero-cat-badge { position: absolute; top: 16px; left: 16px; font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #fff; padding: 4px 12px; border-radius: 100px; z-index: 2; }
        
        .rn-hero-body { padding: 2rem; display: flex; flex-direction: column; justify-content: center; gap: 12px; }
        .rn-hero-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 9.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--accent2); }
        .rn-hero-badge::before { content: ''; width: 16px; height: 2px; background: var(--accent2); display: inline-block; }
        .rn-hero-title { font-family: var(--ff-serif); font-size: clamp(20px, 2vw, 26px); font-weight: 700; color: var(--ink); line-height: 1.2; letter-spacing: -.02em; }
        .rn-hero-exc { font-size: 13.5px; color: var(--muted); line-height: 1.6; font-weight: 400; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .rn-hero-foot { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--line); gap: 1rem; }
        .rn-hero-author { display: flex; align-items: center; gap: 8px; }
        .rn-hero-ava { width: 28px; height: 28px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; font-family: var(--ff-serif); flex-shrink: 0; }
        .rn-hero-author-name { font-size: 12px; font-weight: 600; color: var(--ink); }
        .rn-hero-author-meta { font-size: 10.5px; color: var(--light); margin-top: 2px; }
        .rn-hero-read { display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; color: var(--accent2); white-space: nowrap; transition: gap .15s; text-transform: uppercase; letter-spacing: .05em; }
        .rn-hero-card:hover .rn-hero-read { gap: 8px; }

        .rn-grid-head { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
        .rn-grid-head-title { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
        .rn-grid-head-line { flex: 1; height: 1px; background: var(--line); }
        .rn-grid-head-count { font-size: 11px; font-weight: 600; color: var(--light); white-space: nowrap; }

        .rn-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; }
        .rn-card { background: var(--white); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; text-decoration: none; display: flex; flex-direction: column; transition: box-shadow .2s, transform .2s; }
        .rn-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.05); transform: translateY(-2px); }
        .rn-card:hover .gl-img { transform: scale(1.03); }
        .rn-card-cat-badge { position: absolute; top: 12px; left: 12px; font-size: 8.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #fff; padding: 3px 10px; border-radius: 100px; z-index: 2; }
        .rn-card-body { padding: 1.15rem; display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .rn-card-meta { display: flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 500; color: var(--light); }
        .rn-card-dot { color: var(--line); }
        .rn-card-title { font-size: 14px; font-weight: 700; color: var(--ink); line-height: 1.35; letter-spacing: -.01em; }
        .rn-card-exc { font-size: 12px; color: var(--muted); line-height: 1.6; font-weight: 400; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .rn-card-foot { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 10px; border-top: 1px solid var(--line-lt); }
        .rn-card-author { display: flex; align-items: center; gap: 6px; }
        .rn-card-ava { width: 20px; height: 20px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; flex-shrink: 0; }
        .rn-card-author-name { font-size: 11.5px; font-weight: 600; color: var(--ink2); }
        .rn-card-cta { display: flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 700; color: var(--accent2); white-space: nowrap; transition: gap .15s; text-transform: uppercase; letter-spacing: .05em; }
        .rn-card:hover .rn-card-cta { gap: 6px; }
        
        .rn-sidebar { display: flex; flex-direction: column; gap: 2rem; position: sticky; top: 2rem; }
        .rn-sb-card { background: var(--white); border: 1px solid var(--line); border-radius: 5px; padding: 1.5rem; }
        .rn-sb-title { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--ink); margin-bottom: 1.25rem; padding-bottom: .75rem; border-bottom: 2px solid var(--ink); display: flex; align-items: center; justify-content: space-between; }
        .rn-sb-live { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--accent2); font-weight: 600; letter-spacing: .08em; }
        .rn-sb-live::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--accent2); animation: pulse 1.8s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .4; transform: scale(.8); } }

        .rn-mr-list { display: flex; flex-direction: column; }
        .rn-mr-item { display: flex; gap: 12px; align-items: flex-start; padding: 11px 0; border-bottom: 1px solid var(--line-lt); text-decoration: none; animation: slideIn .35s ease both; }
        .rn-mr-item:last-child { border-bottom: none; padding-bottom: 0; }
        .rn-mr-item:hover { opacity: .75; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .rn-mr-exit { animation: slideOut .3s ease both; }
        @keyframes slideOut { from { opacity: 1; } to { opacity: 0; transform: translateY(-8px); } }
        .rn-mr-rank { font-family: var(--ff-serif); font-size: 22px; font-weight: 700; color: var(--line); line-height: 1; flex-shrink: 0; min-width: 28px; transition: color .3s; }
        .rn-mr-item:hover .rn-mr-rank { color: var(--accent2); }
        .rn-mr-cat { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; display: block; margin-bottom: 3px; }
        .rn-mr-title { font-size: 13px; font-weight: 500; color: var(--ink); line-height: 1.4; }
        .rn-mr-meta { font-size: 11px; color: var(--light); margin-top: 3px; }

        .rn-sb-cats { display: flex; flex-direction: column; }
        .rn-sb-cat-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--line-lt); text-decoration: none; transition: padding-left .18s; }
        .rn-sb-cat-item:last-child { border-bottom: none; }
        .rn-sb-cat-item:hover { padding-left: 5px; }
        .rn-sb-cat-name { font-size: 13.5px; color: var(--ink); }
        .rn-sb-cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        .rn-nl-txt { font-size: 13px; color: var(--muted); line-height: 1.7; margin-bottom: 14px; font-weight: 300; }
        .rn-nl-input { width: 100%; padding: 9px 12px; border: 1px solid var(--line); border-radius: 3px; font-size: 13px; font-family: var(--ff-sans); color: var(--ink); outline: none; margin-bottom: 8px; background: var(--white); transition: border-color .18s; }
        .rn-nl-input:focus { border-color: var(--accent2); }
        .rn-nl-btn { width: 100%; padding: 10px; background: var(--accent); color: #fff; border: none; border-radius: 3px; font-size: 12.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; font-family: var(--ff-sans); transition: background .18s; }
        .rn-nl-btn:hover { background: var(--accent2); }

        @media (max-width: 1024px) {
          .rn-body { grid-template-columns: 1fr; }
          .rn-sidebar { position: static; flex-direction: row; flex-wrap: wrap; }
          .rn-sb-card { flex: 1; min-width: 240px; }
        }
        @media (max-width: 768px) {
          .rn-hero-card { grid-template-columns: 1fr; }
          .rn-grid { grid-template-columns: 1fr; }
          .rn-ph, .rn-body { padding-left: 1.25rem; padding-right: 1.25rem; }
          .rn-sidebar { flex-direction: column; }
        }
      `}</style>

      <div className="rn-blog">

        <div className="rn-ph">
          <div className="rn-ph-inner">
            <div>
              <div className="rn-ph-eyebrow">Nobil Laboratories · Scientific Insights</div>
              <h1 className="rn-ph-title">Research &amp; Updates</h1>
            </div>
            <div className="rn-ph-count">
              <div className="rn-ph-count-num">{safePosts.length}</div>
              <div className="rn-ph-count-label">Articles</div>
            </div>
          </div>
        </div>

        <div className="rn-body">
          <main>
            {safePosts.length === 0 && (
              <p style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                No articles yet. Check back soon.
              </p>
            )}

            {hero && (
              <Link href={`/blog/${hero.slug}`} className="rn-hero-card">
                <div style={{ position: 'relative' }}>
                  <GlobalImage 
                    src={hero.cover_url} 
                    alt={hero.title} 
                    mode="contain" 
                    aspectRatio="16/12"
                    className="hero-img-wrap"
                  />
                  {hero.category && (
                    <span className="rn-hero-cat-badge" style={{ background: hero.category.color ?? '#5BA3C4' }}>
                      {hero.category.name}
                    </span>
                  )}
                </div>
                <div className="rn-hero-body">
                  <span className="rn-hero-badge">Latest Publication</span>
                  <h2 className="rn-hero-title">{hero.title}</h2>
                  {hero.excerpt && <p className="rn-hero-exc">{hero.excerpt}</p>}
                  <div className="rn-hero-foot">
                    {hero.author && (
                      <div className="rn-hero-author">
                        <div className="rn-hero-ava">{hero.author.name[0]}</div>
                        <div>
                          <div className="rn-hero-author-name">{hero.author.name}</div>
                          <div className="rn-hero-author-meta">{fmt(hero.published_at)} · {hero.read_time} min</div>
                        </div>
                      </div>
                    )}
                    <span className="rn-hero-read">
                      Read
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <>
                <div className="rn-grid-head">
                  <span className="rn-grid-head-title">All Articles</span>
                  <div className="rn-grid-head-line" />
                  <span className="rn-grid-head-count">{rest.length} articles</span>
                </div>
                <div className="rn-grid">
                  {rest.map(p => <ArticleCard key={p.id} post={p} />)}
                </div>
              </>
            )}
          </main>

          <aside className="rn-sidebar">
            <div className="rn-sb-card">
              <div className="rn-sb-title">
                Most Read
                <span className="rn-sb-live">Live</span>
              </div>
              <MostReadRotator posts={safePosts} />
            </div>

            <div className="rn-sb-card">
              <div className="rn-sb-title">Topics</div>
              <div className="rn-sb-cats">
                {[
                  { name: 'Research', color: '#5BA3C4' },
                  { name: 'Clinical Trials', color: '#1A2E38' },
                  { name: 'Formulations', color: '#2C4A5C' },
                  { name: 'Publications', color: '#6B8A99' },
                  { name: 'Company News', color: '#A8BEC8' },
                ].map(c => (
                  <a key={c.name} href="#" className="rn-sb-cat-item">
                    <span className="rn-sb-cat-name">{c.name}</span>
                    <span className="rn-sb-cat-dot" style={{ background: c.color }} />
                  </a>
                ))}
              </div>
            </div>

            <div className="rn-sb-card">
              <div className="rn-sb-title">Stay Updated</div>
              <p className="rn-nl-txt">Get the latest scientific breakthroughs and laboratory updates delivered to your inbox.</p>
              <input className="rn-nl-input" type="email" placeholder="Your email address" />
              <button className="rn-nl-btn">Subscribe</button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}