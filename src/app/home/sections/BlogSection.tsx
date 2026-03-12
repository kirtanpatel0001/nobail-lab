import Link from "next/link";
import { getAllPosts } from '@/lib/supabase/server';

const C = {
  primary: "#2C4A5C",
  accent:  "#5BA3C4",
  light:   "#EBF4F9",
  muted:   "#6B8A99",
  text:    "#1A2E38",
  border:  "#DDE6EA",
};

function fmt(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogSection() {
  const posts = (await getAllPosts()).slice(0, 3);

  return (
    <section style={{ padding:"100px 2rem", background:"#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');
        .blog-pill {
          display:inline-flex; align-items:center; gap:7px;
          padding:6px 14px; background:${C.light}; color:${C.accent};
          border-radius:99px; font-size:12px; font-weight:600;
          letter-spacing:0.06em; text-transform:uppercase; margin-bottom:16px;
          font-family:'DM Sans',sans-serif;
        }
        .blog-pill::before { content:""; width:6px; height:6px; border-radius:50%; background:${C.accent}; }
        .blog-card {
          background:#fff; border-radius:14px; overflow:hidden;
          border:1px solid ${C.border}; text-decoration:none; display:block;
          transition:transform 0.25s ease, box-shadow 0.25s ease;
        }
        .blog-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(44,74,92,0.10); }
        .blog-card img { width:100%; height:185px; object-fit:cover; display:block; }
        .blog-btn-outline {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 22px; border:1.5px solid ${C.primary}; color:${C.primary};
          border-radius:8px; font-weight:600; font-size:13.5px;
          text-decoration:none; font-family:'DM Sans',sans-serif;
          transition:background 0.2s, color 0.2s, transform 0.18s; background:transparent;
        }
        .blog-btn-outline:hover { background:${C.primary}; color:#fff; transform:translateY(-2px); }
        @media(max-width:768px){ .blog-grid { grid-template-columns:1fr !important; } }
      `}</style>

      <div style={{ maxWidth:"1340px", margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"48px", flexWrap:"wrap", gap:"16px" }}>
          <div>
            <span className="blog-pill">Latest Insights</span>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.8rem, 3vw, 2.6rem)", color:C.text, fontWeight:400 }}>
              From the <em style={{ color:C.accent }}>Blog</em>
            </h2>
          </div>
          <Link href="/blog" className="blog-btn-outline">All Articles →</Link>
        </div>

        <div className="blog-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"26px" }}>
          {posts.map((b) => (
            <Link key={b.id} href={`/blog/${b.slug}`} className="blog-card">
              {b.cover_url ? (
                <img src={b.cover_url} alt={b.title} />
              ) : (
                <div style={{ width: "100%", height: "185px", background: C.border }} />
              )}
              <div style={{ padding:"22px 20px 26px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
                  <span style={{ fontSize:"10.5px", fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color: b.category?.color || C.accent, fontFamily:"'DM Sans',sans-serif" }}>
                    {b.category?.name || "Article"}
                  </span>
                  <span style={{ width:"3px", height:"3px", borderRadius:"50%", background:C.border, display:"inline-block" }} />
                  <span style={{ fontSize:"12px", color:C.muted, fontFamily:"'DM Sans',sans-serif" }}>
                    {fmt(b.published_at)}
                  </span>
                </div>
                <h4 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"1.1rem", color:C.text, marginBottom:"10px", lineHeight:1.35, fontWeight:400 }}>
                  {b.title}
                </h4>
                <p style={{ fontSize:"13px", color:C.muted, lineHeight:1.7, marginBottom:"18px", fontFamily:"'DM Sans',sans-serif", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {b.excerpt}
                </p>
                <span style={{ fontSize:"13px", fontWeight:600, color:C.primary, fontFamily:"'DM Sans',sans-serif" }}>
                  Read More →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}