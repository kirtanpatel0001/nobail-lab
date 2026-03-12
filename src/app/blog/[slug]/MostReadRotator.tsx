'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PostCard } from '@/types/blog';

function fmt(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MostReadRotator({ posts }: { posts: PostCard[] }) {
  const DISPLAY = 5;
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (posts.length <= DISPLAY) return;
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setOffset(o => (o + 1) % posts.length);
        setAnimating(false);
      }, 320);
    }, 3500);
    return () => clearInterval(id);
  }, [posts.length]);

  const visible = Array.from({ length: Math.min(DISPLAY, posts.length) }, (_, i) =>
    posts[(offset + i) % posts.length]
  );

  return (
    <div className="rn-mr-list">
      {visible.map((p, i) => {
        const rank = ((offset + i) % posts.length) + 1;
        return (
          <Link
            key={`${p.id}-${offset}-${i}`}
            href={`/blog/${p.slug}`}
            className={`rn-mr-item${animating && i === 0 ? ' rn-mr-exit' : ''}`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="rn-mr-rank">{String(rank).padStart(2, '0')}</span>
            <div className="rn-mr-body">
              {p.category && (
                <span className="rn-mr-cat" style={{ color: p.category.color ?? '#2D6A4F' }}>
                  {p.category.name}
                </span>
              )}
              <div className="rn-mr-title">{p.title}</div>
              <div className="rn-mr-meta">{fmt(p.published_at)} · {p.read_time} min</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}