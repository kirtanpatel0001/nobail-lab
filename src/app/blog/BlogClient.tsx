'use client';

import { useState, useEffect } from 'react';
import type { PostCard } from '@/types/blog';

// ─── constants ────────────────────────────────────────────────────────────────
const TOPICS = [
  { name: 'Research', color: '#5BA3C4' },
  { name: 'Clinical Trials', color: '#1A2E38' },
  { name: 'Formulations', color: '#2C4A5C' },
  { name: 'Publications', color: '#6B8A99' },
  { name: 'Company News', color: '#A8BEC8' },
];

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmt(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── shared sub-components ────────────────────────────────────────────────────
function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#2C4A5C', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.43, fontWeight: 600, flexShrink: 0,
      fontFamily: "'Playfair Display', Georgia, serif",
    }}>
      {name[0]}
    </div>
  );
}

function CategoryBadge({
  category,
  style: extra = {},
}: {
  category: PostCard['category'];
  style?: React.CSSProperties;
}) {
  if (!category) return null;
  return (
    <span style={{
      position: 'absolute', top: 12, left: 12,
      fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
      textTransform: 'uppercase', color: '#fff',
      padding: '3px 10px', borderRadius: 100,
      background: category.color ?? '#5BA3C4',
      zIndex: 2, ...extra,
    }}>
      {category.name}
    </span>
  );
}

function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function LiveDot() {
  return (
    <span style={{
      display: 'flex', alignItems: 'center', gap: 5,
      fontSize: 10, color: '#5BA3C4', fontWeight: 600, letterSpacing: '.08em',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: '#5BA3C4',
        animation: 'pulse 1.8s ease-in-out infinite',
      }} />
      Live
    </span>
  );
}

function SidebarCard({
  title,
  liveIndicator,
  children,
}: {
  title: string;
  liveIndicator?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #DDE6EA',
      borderRadius: 5, padding: '1.5rem',
    }}>
      <div style={{
        fontSize: 12, fontWeight: 700, letterSpacing: '.1em',
        textTransform: 'uppercase', color: '#1A2E38',
        marginBottom: '1.25rem', paddingBottom: '.75rem',
        borderBottom: '2px solid #1A2E38',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {title}
        {liveIndicator && <LiveDot />}
      </div>
      {children}
    </div>
  );
}

// ─── HeroCard ────────────────────────────────────────────────────────────────
function HeroCard({ post }: { post: PostCard }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={`/blog/${post.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: '1fr 1.2fr',
        background: '#fff', border: '1px solid #DDE6EA',
        borderRadius: 12, overflow: 'hidden',
        textDecoration: 'none', marginBottom: '2.5rem',
        transition: 'box-shadow .2s, transform .2s',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,.07)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* image */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 260 }}>
        {post.cover_url && (
          <img
            src={post.cover_url}
            alt={post.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transition: 'transform .35s ease',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        )}
        <CategoryBadge category={post.category} style={{ top: 16, left: 16 }} />
      </div>

      {/* text */}
      <div style={{
        padding: '2rem', display: 'flex', flexDirection: 'column',
        gap: 12, justifyContent: 'center',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 9.5, fontWeight: 700, letterSpacing: '.12em',
          textTransform: 'uppercase', color: '#5BA3C4',
        }}>
          <span style={{ width: 16, height: 2, background: '#5BA3C4', display: 'inline-block' }} />
          Latest Publication
        </span>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(20px, 2vw, 26px)', fontWeight: 700,
          color: '#1A2E38', lineHeight: 1.2, letterSpacing: '-.02em', margin: 0,
        }}>
          {post.title}
        </h2>

        {post.excerpt && (
          <p style={{
            fontSize: 13.5, color: '#6B8A99', lineHeight: 1.6, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.excerpt}
          </p>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #DDE6EA', gap: '1rem',
        }}>
          {post.author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar name={post.author.name} size={28} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1A2E38' }}>{post.author.name}</div>
                <div style={{ fontSize: 10.5, color: '#A8BEC8', marginTop: 2 }}>
                  {fmt(post.published_at)} · {post.read_time} min
                </div>
              </div>
            </div>
          )}
          <span style={{
            display: 'flex', alignItems: 'center',
            gap: hovered ? 8 : 6, fontSize: 11.5, fontWeight: 700,
            color: '#5BA3C4', whiteSpace: 'nowrap',
            textTransform: 'uppercase', letterSpacing: '.05em',
            transition: 'gap .15s',
          }}>
            Read <ArrowIcon size={13} />
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── ArticleCard ─────────────────────────────────────────────────────────────
function ArticleCard({ post }: { post: PostCard }) {
  const [hovered, setHovered] = useState(false);
  const useContain = post.category?.name?.toLowerCase().includes('formulation');

  return (
    <a
      href={`/blog/${post.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', border: '1px solid #DDE6EA',
        borderRadius: 8, overflow: 'hidden',
        textDecoration: 'none', display: 'flex', flexDirection: 'column',
        transition: 'box-shadow .2s, transform .2s',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,.06)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden', height: 160 }}>
        {post.cover_url && (
          <img
            src={post.cover_url}
            alt={post.title}
            style={{
              width: '100%', height: '100%',
              objectFit: useContain ? 'contain' : 'cover',
              display: 'block',
              transition: 'transform .35s ease',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        )}
        <CategoryBadge category={post.category} />
      </div>

      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 500, color: '#A8BEC8' }}>
          <span>{fmt(post.published_at)}</span>
          <span style={{ color: '#DDE6EA' }}>·</span>
          <span>{post.read_time} min read</span>
        </div>

        <h2 style={{
          fontSize: 14, fontWeight: 700, color: '#1A2E38',
          lineHeight: 1.35, letterSpacing: '-.01em', margin: 0,
        }}>
          {post.title}
        </h2>

        {post.excerpt && (
          <p style={{
            fontSize: 12, color: '#6B8A99', lineHeight: 1.6, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.excerpt}
          </p>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #EBF3F7',
        }}>
          {post.author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar name={post.author.name} size={20} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#2C4A5C' }}>{post.author.name}</span>
            </div>
          )}
          <span style={{
            display: 'flex', alignItems: 'center',
            gap: hovered ? 6 : 4, fontSize: 10.5, fontWeight: 700,
            color: '#5BA3C4', whiteSpace: 'nowrap',
            textTransform: 'uppercase', letterSpacing: '.05em',
            transition: 'gap .15s',
          }}>
            Read <ArrowIcon size={12} />
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── MostReadRotator ─────────────────────────────────────────────────────────
function MostReadRotator({ posts }: { posts: PostCard[] }) {
  const PAGE_SIZE = 3;
  const [page, setPage] = useState(0);
  const total = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const visible = posts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => setPage(p => (p + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {visible.map((post, i) => (
        <a
          key={post.id}
          href={`/blog/${post.slug}`}
          style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            padding: '11px 0',
            borderBottom: i < visible.length - 1 ? '1px solid #EBF3F7' : 'none',
            textDecoration: 'none',
          }}
        >
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22, fontWeight: 700, color: '#DDE6EA',
            lineHeight: 1, flexShrink: 0, minWidth: 28,
          }}>
            {page * PAGE_SIZE + i + 1}
          </span>
          <div>
            {post.category && (
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: post.category.color ?? '#5BA3C4',
                display: 'block', marginBottom: 3,
              }}>
                {post.category.name}
              </span>
            )}
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A2E38', lineHeight: 1.4, display: 'block' }}>
              {post.title}
            </span>
            <span style={{ fontSize: 11, color: '#A8BEC8', marginTop: 3, display: 'block' }}>
              {post.read_time} min read
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}

// ─── NewsletterBox ────────────────────────────────────────────────────────────
function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div>
      <p style={{ fontSize: 13, color: '#6B8A99', lineHeight: 1.7, fontWeight: 300, margin: '0 0 14px' }}>
        Get the latest scientific breakthroughs and laboratory updates delivered to your inbox.
      </p>
      {done ? (
        <p style={{ fontSize: 13, color: '#5BA3C4', fontWeight: 600 }}>✓ Subscribed!</p>
      ) : (
        <>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px',
              border: '1px solid #DDE6EA', borderRadius: 3,
              fontSize: 13, fontFamily: 'inherit', color: '#1A2E38',
              outline: 'none', marginBottom: 8, background: '#fff',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => email && setDone(true)}
            style={{
              width: '100%', padding: 10, background: '#2C4A5C',
              color: '#fff', border: 'none', borderRadius: 3,
              fontSize: 12.5, fontWeight: 600, letterSpacing: '.06em',
              textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Subscribe
          </button>
        </>
      )}
    </div>
  );
}

// ─── BlogClient (root) ────────────────────────────────────────────────────────
export default function BlogClient({ posts = [] }: { posts: PostCard[] }) {
  const [hero, ...rest] = posts;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .rn-body {
          max-width: 1240px; margin: 0 auto; padding: 2.5rem;
          display: grid; grid-template-columns: 1fr 300px;
          gap: 3.5rem; align-items: start;
        }
        .rn-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .rn-sidebar {
          display: flex; flex-direction: column; gap: 2rem;
          position: sticky; top: 2rem;
        }
        @media (max-width: 1024px) {
          .rn-body { grid-template-columns: 1fr; padding: 1.5rem; }
          .rn-sidebar { position: static; flex-direction: row; flex-wrap: wrap; }
          .rn-sidebar > * { flex: 1; min-width: 240px; }
        }
        @media (max-width: 768px) {
          .rn-hero-grid { grid-template-columns: 1fr !important; }
          .rn-grid { grid-template-columns: 1fr; }
          .rn-body { padding: 1rem; }
          .rn-sidebar { flex-direction: column; }
        }
      `}</style>

      <div style={{
        background: '#F4F8FA', minHeight: '100vh',
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: '#1A2E38',
      }}>

        {/* ── page header ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #DDE6EA', padding: '2rem 2.5rem' }}>
          <div style={{
            maxWidth: 1240, margin: '0 auto',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem',
          }}>
            <div>
              <div style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em',
                textTransform: 'uppercase', color: '#5BA3C4', marginBottom: 8,
              }}>
                Nobil Laboratories · Scientific Insights
              </div>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700,
                color: '#1A2E38', letterSpacing: '-.02em', lineHeight: 1.1,
              }}>
                Research &amp; Updates
              </h1>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 32, fontWeight: 700, color: '#2C4A5C', lineHeight: 1,
              }}>
                {posts.length}
              </div>
              <div style={{
                fontSize: 10, color: '#A8BEC8', textTransform: 'uppercase',
                letterSpacing: '.1em', marginTop: 4, fontWeight: 600,
              }}>
                Articles
              </div>
            </div>
          </div>
        </div>

        {/* ── body ── */}
        <div className="rn-body">
          <main>
            {posts.length === 0 && (
              <p style={{ padding: '5rem 0', textAlign: 'center', color: '#6B8A99', fontSize: 14 }}>
                No articles yet. Check back soon.
              </p>
            )}

            {hero && <HeroCard post={hero} />}

            {rest.length > 0 && (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
                    textTransform: 'uppercase', color: '#6B8A99', whiteSpace: 'nowrap',
                  }}>
                    All Articles
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#DDE6EA' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#A8BEC8', whiteSpace: 'nowrap' }}>
                    {rest.length} articles
                  </span>
                </div>
                <div className="rn-grid">
                  {rest.map(p => <ArticleCard key={p.id} post={p} />)}
                </div>
              </>
            )}
          </main>

          {/* ── sidebar ── */}
          <aside className="rn-sidebar">
            <SidebarCard title="Most Read" liveIndicator>
              <MostReadRotator posts={posts} />
            </SidebarCard>

            <SidebarCard title="Topics">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {TOPICS.map((c, i) => (
                  <a key={c.name} href="#" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i < TOPICS.length - 1 ? '1px solid #EBF3F7' : 'none',
                    textDecoration: 'none',
                  }}>
                    <span style={{ fontSize: 13.5, color: '#1A2E38' }}>{c.name}</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </SidebarCard>

            <SidebarCard title="Stay Updated">
              <NewsletterBox />
            </SidebarCard>
          </aside>
        </div>
      </div>
    </>
  );
}