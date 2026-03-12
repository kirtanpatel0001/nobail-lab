"use client";
import Link from "next/link";
import { useState } from "react";

const C = {
  primary:  "#2C4A5C",
  accent:   "#5BA3C4",
  muted:    "#6B8A99",
  text:     "#1A2E38",
  border:   "#E2E8EC",
  pageBg:   "#FFFFFF",
  dash:     "#B89A6A",
};

const PRODUCTS = [
  {
    id:       "p1",
    tag:      "Ophthalmic",
    name:     "Lubricating Eye Drops",
    form:     "0.5% Carboxymethylcellulose",
    pack:     "10 ml Dropper Bottle",
    desc:     "Precision-formulated sterile solution for long-lasting relief from dry eye syndrome. GDP-certified, preservative-free variant available.",
    badge:    null,
    img:      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&q=90",
    href:     "/products/lubricating-eye-drops",
  },
  {
    id:       "p2",
    tag:      "Dermatologic",
    name:     "Antifungal Cream",
    form:     "Clotrimazole 1% w/w",
    pack:     "15 g Tube",
    desc:     "Broad-spectrum topical antifungal clinically proven against dermatophytes. Smooth, non-greasy base for sustained patient compliance.",
    badge:    "Bestseller",
    img:      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&q=90",
    href:     "/products/antifungal-cream",
  },
  {
    id:       "p3",
    tag:      "Dermatologic",
    name:     "Barrier Repair Gel",
    form:     "Panthenol + Allantoin",
    pack:     "30 g Tube",
    desc:     "Advanced skin-barrier recovery formulation with dual-action moisturisation. Suitable for post-procedure and chronic dry-skin management.",
    badge:    "New",
    img:      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=90",
    href:     "/products/barrier-repair-gel",
  },
  {
    id:       "p4",
    tag:      "Therapeutics",
    name:     "Multivitamin Capsules",
    form:     "Vitamins A, C, D, E + B-complex",
    pack:     "Strip of 10 Capsules",
    desc:     "Comprehensive micronutrient supplement covering daily therapeutic requirements. Manufactured under WHO-GMP conditions with validated bioavailability.",
    badge:    null,
    img:      "https://images.unsplash.com/photo-1550572017-edd951b55104?w=900&q=90",
    href:     "/products/multivitamin-capsules",
  },
];

/* Colour tints per category for the tag pill */
const TAG_PALETTE = {
  "Ophthalmic":   { bg: "rgba(91,163,196,0.18)",  text: "#2A7A9B" },
  "Dermatologic": { bg: "rgba(30,138,94,0.15)",   text: "#167A52" },
  "Therapeutics": { bg: "rgba(184,154,106,0.18)", text: "#8A6830" },
};

// ─── Card ─────────────────────────────────────────────────────────────────────
function ProductCard({ p, index }) {
  const [hovered, setHovered] = useState(false);
  const tp = TAG_PALETTE[p.tag] || { bg: "rgba(91,163,196,0.18)", text: "#2A7A9B" };

  return (
    <Link
      href={p.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        "flex",
        flexDirection:  "column",
        textDecoration: "none",
        borderRadius:   "12px",
        overflow:       "hidden",
        border:         `1px solid ${hovered ? "rgba(91,163,196,0.45)" : C.border}`,
        boxShadow:      hovered
          ? "0 24px 64px rgba(44,74,92,0.16), 0 4px 16px rgba(44,74,92,0.08)"
          : "0 2px 12px rgba(44,74,92,0.06)",
        transform:      hovered ? "translateY(-6px)" : "translateY(0)",
        transition:     "transform 0.32s cubic-bezier(0.22,1,0.36,1), box-shadow 0.32s ease, border-color 0.25s ease",
        animation:      `fadeUp 0.55s ease both`,
        animationDelay: `${index * 0.09}s`,
        background:     "#fff",
      }}
    >

      {/* ── FULL-BLEED IMAGE ─────────────────────────────
          No padding, no container bg peeking — image fills edge-to-edge.
          We use a dark gradient overlay at the bottom so the tag pill
          always reads cleanly on top of any photo colour.           */}
      <div style={{
        position: "relative",
        height:   "300px",          /* fixed height so all 4 align */
        flexShrink: 0,
        overflow: "hidden",
      }}>
        {/* The image itself — cover fills every pixel */}
        <img
          src={p.img}
          alt={p.name}
          style={{
            display:    "block",
            width:      "100%",
            height:     "100%",
            objectFit:  "cover",    /* full-bleed, no empty space */
            objectPosition: "center",
            transform:  hovered ? "scale(1.06)" : "scale(1.0)",
            transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
          }}
        />

        {/* Gradient vignette — bottom 50% fades to near-black so overlaid
            text is always legible regardless of photo brightness */}
        <div style={{
          position:   "absolute",
          inset:      0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(10,22,30,0.72) 100%)",
          pointerEvents: "none",
        }}/>

        {/* Category tag — top-left, pill style */}
        <div style={{
          position:      "absolute",
          top:           "14px",
          left:          "14px",
          padding:       "5px 12px",
          background:    tp.bg,
          backdropFilter:"blur(6px)",
          WebkitBackdropFilter:"blur(6px)",
          border:        `1px solid ${tp.text}30`,
          borderRadius:  "99px",
          fontSize:      "10px",
          fontWeight:    700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color:         tp.text,
          fontFamily:    "'DM Sans', sans-serif",
        }}>
          {p.tag}
        </div>

        {/* Badge — top-right */}
        {p.badge && (
          <div style={{
            position:      "absolute",
            top:           "14px",
            right:         "14px",
            padding:       "4px 11px",
            background:    p.badge === "New" ? "#1E8A5E" : C.primary,
            borderRadius:  "3px",
            fontSize:      "9px",
            fontWeight:    700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         "#fff",
            fontFamily:    "'DM Sans', sans-serif",
          }}>
            {p.badge}
          </div>
        )}

        {/* Product name lives IN the image at bottom-left on the dark gradient
            so it reads as a cinematic title. On hover the full info panel
            slides up from the bottom of the CARD (below), not from here.  */}
        <div style={{
          position: "absolute",
          bottom:   "16px",
          left:     "18px",
          right:    "18px",
        }}>
          <h3 style={{
            fontFamily:    "'DM Serif Display', serif",
            fontSize:      "1.2rem",
            fontWeight:    400,
            color:         "#fff",
            lineHeight:    1.25,
            margin:        0,
            textShadow:    "0 2px 8px rgba(0,0,0,0.4)",
            /* Slide title up slightly on hover for polish */
            transform:     hovered ? "translateY(-3px)" : "translateY(0)",
            transition:    "transform 0.35s ease",
          }}>
            {p.name}
          </h3>
        </div>
      </div>

      {/* ── DETAILS PANEL ────────────────────────────────
          Always visible (not hidden-on-hover) so the card
          works on touch devices too. Clean white background
          with formulation, pack, and a short description.  */}
      <div style={{
        padding:    "20px 20px 22px",
        display:    "flex",
        flexDirection: "column",
        gap:        "10px",
        flex:       1,
        background: "#fff",
      }}>

        {/* Formulation + pack as two small labelled rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{
              fontFamily:    "'DM Sans', sans-serif",
              fontSize:      "9.5px",
              fontWeight:    700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color:         C.muted,
              flexShrink:    0,
              width:         "72px",
            }}>
              Formulation
            </span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize:   "12.5px",
              fontWeight: 600,
              color:      C.text,
            }}>
              {p.form}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{
              fontFamily:    "'DM Sans', sans-serif",
              fontSize:      "9.5px",
              fontWeight:    700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color:         C.muted,
              flexShrink:    0,
              width:         "72px",
            }}>
              Pack Size
            </span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize:   "12.5px",
              fontWeight: 600,
              color:      C.text,
            }}>
              {p.pack}
            </span>
          </div>
        </div>

        {/* Thin divider */}
        <div style={{
          height:     "1px",
          background: C.border,
          margin:     "2px 0",
        }}/>

        {/* Description — 3 lines max */}
        <p style={{
          fontFamily:          "'DM Sans', sans-serif",
          fontSize:            "12.5px",
          lineHeight:          1.7,
          color:               C.muted,
          margin:              0,
          display:             "-webkit-box",
          WebkitLineClamp:     3,
          WebkitBoxOrient:     "vertical",
          overflow:            "hidden",
          flex:                1,
        }}>
          {p.desc}
        </p>

        {/* CTA row — text link + animated arrow circle */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginTop:      "4px",
        }}>
          <span style={{
            fontFamily:    "'DM Sans', sans-serif",
            fontSize:      "11px",
            fontWeight:    700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color:         hovered ? C.primary : C.muted,
            transition:    "color 0.22s ease",
          }}>
            View Details
          </span>

          {/* Circle arrow button */}
          <div style={{
            width:        "34px",
            height:       "34px",
            borderRadius: "50%",
            background:   hovered ? C.primary : C.pageBg,
            border:       `1.5px solid ${hovered ? C.primary : C.border}`,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            transition:   "background 0.25s ease, border-color 0.25s ease",
            flexShrink:   0,
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M2.5 6.5h8M7 3l3.5 3.5L7 10"
                stroke={hovered ? "#fff" : C.muted}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

      </div>
    </Link>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function ProductsSection() {
  return (
    <section style={{ padding: "100px 2rem", background: C.pageBg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .ps-view-all {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 12px 26px;
          border: 1.5px solid ${C.text};
          color: ${C.text}; border-radius: 4px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .ps-view-all:hover { background: ${C.text}; color: #fff; }

        .ps-enquire {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 12px 26px;
          background: ${C.primary}; color: #fff;
          border: 1.5px solid ${C.primary};
          border-radius: 4px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .ps-enquire:hover { background: #3D6478; border-color: #3D6478; }

        .ps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media(max-width: 1100px) {
          .ps-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media(max-width: 560px) {
          .ps-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: "1340px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          display:        "flex",
          alignItems:     "flex-end",
          justifyContent: "space-between",
          flexWrap:       "wrap",
          gap:            "28px",
          marginBottom:   "52px",
        }}>
          <div>
            {/* Small overline label */}
            <p style={{
              fontFamily:    "'DM Sans', sans-serif",
              fontSize:      "10px",
              fontWeight:    700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color:         C.accent,
              marginBottom:  "14px",
              display:       "flex",
              alignItems:    "center",
              gap:           "8px",
            }}>
              <span style={{
                display:         "inline-block",
                width:           "24px",
                height:          "1.5px",
                background:      C.accent,
                borderRadius:    "99px",
                verticalAlign:   "middle",
              }}/>
              Our Product Range
            </p>

            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize:   "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 400,
              color:      C.text,
              lineHeight: 1.1,
              margin:     0,
            }}>
              Formulations Built for{" "}
              <em style={{ color: C.accent, fontStyle: "italic" }}>Every Need</em>
            </h2>
          </div>

          <div style={{ textAlign: "right", maxWidth: "320px" }}>
            <p style={{
              fontFamily:   "'DM Sans', sans-serif",
              fontSize:     "14px",
              lineHeight:   1.8,
              color:        C.muted,
              marginBottom: "20px",
            }}>
              Three therapeutic segments — each manufactured to rigorous regulatory and GDP standards.
            </p>
            <Link href="/products" className="ps-view-all">
              View All Products →
            </Link>
          </div>
        </div>

        {/* ── Rule ── */}
        <div style={{
          height:       "1px",
          background:   `linear-gradient(90deg, ${C.accent}55, transparent)`,
          marginBottom: "40px",
        }}/>

        {/* ── 4-card grid ── */}
        <div className="ps-grid">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>

        {/* ── Bottom strip ── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          flexWrap:       "wrap",
          gap:            "24px",
          marginTop:      "60px",
          paddingTop:     "40px",
          borderTop:      `1px solid ${C.border}`,
        }}>
          <div>
            <h3 style={{
              fontFamily:   "'DM Serif Display', serif",
              fontSize:     "1.35rem",
              fontWeight:   400,
              color:        C.text,
              marginBottom: "6px",
            }}>
              Need a specific formulation?
            </h3>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize:   "13.5px",
              color:      C.muted,
              margin:     0,
            }}>
              Our team handles product enquiries, bulk orders, and custom requirements.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/contact"  className="ps-enquire">Enquire Now</Link>
            <Link href="/products" className="ps-view-all">Full Catalogue</Link>
          </div>
        </div>

      </div>
    </section>
  );
}