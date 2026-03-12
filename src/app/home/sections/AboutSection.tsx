"use client";
import Link from "next/link";
import { useState } from "react";

const C = {
  primary:  "#2C4A5C",
  accent:   "#5BA3C4",
  light:    "#EBF3F7",
  muted:    "#6B8A99",
  text:     "#1A2E38",
  border:   "#DDE6EA",
  bg:       "#F4F8FA",
};





export default function AboutSection() {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <section style={{ padding: "100px 2rem", background: "#fff", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── CTA button ── */
        .ab-btn {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 13px 28px;
          background: ${C.primary}; color: #fff;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .ab-btn:hover { background: #3D6478; transform: translateY(-2px); }

        /* ── Ghost button ── */
        .ab-ghost {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 13px 28px;
          border: 1.5px solid ${C.border}; color: ${C.primary};
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          text-decoration: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .ab-ghost:hover { border-color: ${C.accent}; background: ${C.light}; }

        /* Responsive split */
        @media(max-width: 900px) {
          .ab-split { flex-direction: column !important; }
          .ab-img-col { min-height: 340px !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1340px", margin: "0 auto" }}>

        {/* ════════════════════════════════════════
            TOP SPLIT — image left, content right
        ════════════════════════════════════════ */}
        <div className="ab-split" style={{
          display: "flex", alignItems: "stretch",
          gap: "64px",
        }}>

          {/* ── LEFT: image column ── */}
          <div className="ab-img-col" style={{
            flex: "1 1 44%", position: "relative", minHeight: "480px",
          }}>

            {/* Main image — full rounded card */}
            <div style={{
              height: "100%", minHeight: "480px",
              borderRadius: "14px", overflow: "hidden",
              boxShadow: "0 24px 64px rgba(44,74,92,0.14)",
            }}>
              <img
                src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&q=85"
                alt="Nobil Laboratories — pharmaceutical manufacturing"
                onLoad={() => setImgLoaded(true)}
                style={{
                  display: "block", width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center",
                  // Subtle zoom-in on load
                  transform: imgLoaded ? "scale(1)" : "scale(1.04)",
                  transition: "transform 1.2s cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </div>

            {/* Decorative accent dot-grid behind image */}
            <div style={{
              position: "absolute", top: "-16px", left: "-16px",
              width: "110px", height: "110px",
              backgroundImage: `radial-gradient(circle, ${C.border} 1.2px, transparent 1.2px)`,
              backgroundSize: "12px 12px",
              borderRadius: "8px",
              zIndex: -1,
            }}/>

            {/* Floating stat badge — bottom right overlap */}
            <div style={{
              position: "absolute", bottom: "28px", right: "-22px",
              background: C.primary, color: "#fff",
              borderRadius: "12px", padding: "18px 22px",
              boxShadow: "0 12px 36px rgba(44,74,92,0.25)",
              fontFamily: "'DM Sans', sans-serif",
              zIndex: 2,
              animation: "fadeUp 0.7s ease 0.3s both",
            }}>
              <div style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "28px", fontWeight: 400,
                lineHeight: 1, marginBottom: "4px",
              }}>500+</div>
              <div style={{ fontSize: "11px", fontWeight: 600, opacity: 0.75, letterSpacing: "0.06em" }}>
                Products Distributed
              </div>
            </div>

            {/* Second small floating badge — top right */}
            <div style={{
              position: "absolute", top: "24px", right: "-14px",
              background: "#fff",
              border: `1px solid ${C.border}`,
              borderRadius: "10px", padding: "10px 16px",
              boxShadow: "0 4px 16px rgba(44,74,92,0.10)",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: "8px",
              zIndex: 2,
              animation: "fadeUp 0.6s ease 0.15s both",
            }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#1E8A5E", flexShrink: 0,
              }}/>
              <span style={{
                fontSize: "11.5px", fontWeight: 700,
                color: C.text, letterSpacing: "0.04em",
              }}>GDP Certified</span>
            </div>

          </div>

          {/* ── RIGHT: content column ── */}
          <div style={{
            flex: "1 1 52%",
            display: "flex", flexDirection: "column",
            justifyContent: "center", gap: "0",
          }}>

            {/* Overline */}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "10px", fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: C.accent, marginBottom: "14px",
              display: "flex", alignItems: "center", gap: "9px",
            }}>
              <span style={{
                display: "inline-block", width: "22px", height: "1.5px",
                background: C.accent, borderRadius: "99px",
              }}/>
              About Nobil Laboratories
            </p>

            {/* Headline */}
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(1.9rem, 3vw, 2.8rem)",
              fontWeight: 400, color: C.text,
              lineHeight: 1.15, marginBottom: "22px",
            }}>
              Where Science Meets{" "}
              <em style={{ color: C.accent }}>Human Care</em>
            </h2>

            {/* Body text */}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px", lineHeight: 1.85,
              color: C.muted, marginBottom: "14px",
            }}>
              Nobil Laboratories is a forward-thinking pharmaceutical company committed to developing,
              manufacturing, and distributing high-quality healthcare solutions from Surat, India —
              across ophthalmic, dermatologic, and general therapeutic segments.
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px", lineHeight: 1.85,
              color: C.muted, marginBottom: "28px",
            }}>
              Guided by integrity, innovation, and scientific excellence, we believe healthcare is a
              noble responsibility. Every formulation we produce carries that commitment.
            </p>

            {/* Pull quote */}
            <div style={{
              display: "flex", gap: "16px", alignItems: "flex-start",
              padding: "18px 20px",
              background: C.light,
              borderRadius: "8px",
              border: `1px solid ${C.border}`,
              marginBottom: "32px",
            }}>
              <div style={{
                width: "3px", flexShrink: 0,
                alignSelf: "stretch",
                background: `linear-gradient(180deg, ${C.accent}, transparent)`,
                borderRadius: "99px",
              }}/>
              <p style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "16px", fontStyle: "italic",
                color: C.primary, lineHeight: 1.6, margin: 0,
              }}>
                "Nobil Laboratories — Where Science Meets Trust."
              </p>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/about"   className="ab-btn">Our Full Story →</Link>
              <Link href="/contact" className="ab-ghost">Get in Touch</Link>
            </div>

          </div>
        </div>



      </div>
    </section>
  );
}