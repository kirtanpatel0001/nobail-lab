'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PostCard } from '@/types/blog';

function fmt(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const DISPLAY = 5;

export default function MostReadRotator({ posts }: { posts: PostCard[] }) {
  const [offset, setOffset] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (posts.length <= DISPLAY) return;

    const id = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setOffset(o => (o + 1) % posts.length);
        setExiting(false);
      }, 300);
    }, 4000);

    return () => clearInterval(id);
  }, [posts.length]);

  const visible = Array.from(
    { length: Math.min(DISPLAY, posts.length) },
    (_, i) => posts[(offset + i) % posts.length],
  );

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; }
          to   { opacity: 0; transform: translateY(-6px); }
        }
        .rn-mr-list { display: flex; flex-direction: column; }
        .rn-mr-item {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 11px 0;
          border-bottom: 1px solid #EBF3F7;
          text-decoration: none;
        }
        .rn-mr-item:last-child { border-bottom: none; padding-bottom: 0; }
        .rn-mr-item:hover { opacity: .75; }
        .rn-mr-item.entering { animation: slideIn .35s ease both; }
        .rn-mr-item.exiting  { animation: slideOut .3s ease both; }
        .rn-mr-rank {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px; font-weight: 700; color: #DDE6EA;
          line-height: 1; flex-shrink: 0; min-width: 28px;
          transition: color .2s;
        }
        .rn-mr-item:hover .rn-mr-rank { color: #5BA3C4; }
        .rn-mr-cat {
          font-size: 10px; font-weight: 700; letter-spacing: .08em;
          text-transform: uppercase; display: block; margin-bottom: 3px;
        }
        .rn-mr-title { font-size: 13px; font-weight: 500; color: #1A2E38; line-height: 1.4; }
        .rn-mr-meta { font-size: 11px; color: #A8BEC8; margin-top: 3px; display: block; }
      `}</style>

      <div className="rn-mr-list">
        {visible.map((post, i) => {
          const globalRank = (offset + i) % posts.length + 1;
          return (
            <Link
              key={`${post.id}-${offset}-${i}`}
              href={`/blog/${post.slug}`}
              className={`rn-mr-item ${exiting ? 'exiting' : 'entering'}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="rn-mr-rank">{String(globalRank).padStart(2, '0')}</span>
              <div>
                {post.category && (
                  <span className="rn-mr-cat" style={{ color: post.category.color ?? '#5BA3C4' }}>
                    {post.category.name}
                  </span>
                )}
                <div className="rn-mr-title">{post.title}</div>
                <span className="rn-mr-meta">{fmt(post.published_at)} · {post.read_time} min</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}