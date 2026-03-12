"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import GlobalImage from "@/components/GlobalImage";

const C = {
  primary:  "#2C4A5C",
  accent:   "#5BA3C4",
  muted:    "#6B8A99",
  text:     "#1A2E38",
  border:   "#E2E8EC",
  pageBg:   "#FFFFFF",
  dash:     "#B89A6A",
  rx:       "#DC2626", // Added rx color to fix the TS error
};

/* Colour tints per category for the tag pill */
const TAG_PALETTE = {
  "Ophthalmic":           { bg: "rgba(91,163,196,0.18)",  text: "#2A7A9B" },
  "Dermatology":          { bg: "rgba(30,138,94,0.15)",   text: "#167A52" },
  "General Therapeutics": { bg: "rgba(184,154,106,0.18)", text: "#8A6830" },
};

// Helper: Checks if a product is less than 30 days old
function isNew(created_at?: string | null): boolean {
  if (!created_at) return false;
  return Date.now() - new Date(created_at).getTime() < 30 * 24 * 60 * 60 * 1000;
}

// Helper: Gets the correct full URL for the image
function getImgUrl(val: string | null | undefined) {
  if (!val) return "";
  if (val.startsWith("http")) return val;
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${val}`;
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function ProductCard({ p, index }: { p: Product; index: number }) {
  const [hovered, setHovered] = useState(false);
  
  // Safe category fallback
  const cat = p.category || "General Therapeutics";
  const tp = TAG_PALETTE[cat as keyof typeof TAG_PALETTE] || TAG_PALETTE["General Therapeutics"];

  // Determine badge
  const badge = isNew(p.created_at) ? "New" : p.prescription_required ? "Rx Only" : null;

  return (
    <Link
      href={`/products/${p.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        "flex",
        flexDirection:  "column",
        textDecoration: "none",
        borderRadius:   "16px",
        overflow:       "hidden",
        border:         `1px solid ${hovered ? "rgba(91,163,196,0.45)" : C.border}`,
        boxShadow:      hovered
          ? "0 24px 64px rgba(44,74,92,0.12), 0 4px 16px rgba(44,74,92,0.06)"
          : "0 2px 12px rgba(44,74,92,0.04)",
        transform:      hovered ? "translateY(-6px)" : "translateY(0)",
        transition:     "transform 0.32s cubic-bezier(0.22,1,0.36,1), box-shadow 0.32s ease, border-color 0.25s ease",
        animation:      `fadeUp 0.55s ease both`,
        animationDelay: `${index * 0.09}s`,
        background:     "#fff",
        height:         "100%", // Ensure all cards stretch to same height in grid
      }}
    >
      {/* ── IMAGE AREA ── */}
      <div style={{
        position: "relative",
        height:   "260px",
        background: "#F8FAFC",
        borderBottom: `1px solid ${C.border}`,
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        {p.image_id ? (
          <div style={{ 
            width: "100%", height: "100%", 
            transform: hovered ? "scale(1.06)" : "scale(1.0)", 
            transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)" 
          }}>
            <GlobalImage src={getImgUrl(p.image_id)} alt={p.name} mode="contain" aspectRatio="1/1" />
          </div>
        ) : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" opacity={0.3}>
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
        )}

        {/* Category tag */}
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
          fontWeight:    800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color:         tp.text,
          fontFamily:    "'DM Sans', sans-serif",
          zIndex: 2,
        }}>
          {cat}
        </div>

        {/* Badge */}
        {badge && (
          <div style={{
            position:      "absolute",
            top:           "14px",
            right:         "14px",
            padding:       "4px 11px",
            background:    badge === "New" ? "#1E8A5E" : C.rx,
            borderRadius:  "4px",
            fontSize:      "9px",
            fontWeight:    800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         "#fff",
            fontFamily:    "'DM Sans', sans-serif",
            zIndex: 2,
          }}>
            {badge}
          </div>
        )}
      </div>

      {/* ── DETAILS PANEL ── */}
      <div style={{
        padding:    "20px",
        display:    "flex",
        flexDirection: "column",
        gap:        "12px",
        flex:       1,
        background: "#fff",
      }}>
        
        <h3 style={{
          fontFamily:    "'DM Serif Display', serif",
          fontSize:      "1.3rem",
          fontWeight:    400,
          color:         C.text,
          lineHeight:    1.25,
          margin:        0,
          display:       "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow:      "hidden",
        }}>
          {p.name}
        </h3>

        {/* Formulation + pack */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{
              fontFamily:    "'DM Sans', sans-serif",
              fontSize:      "9.5px",
              fontWeight:    700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color:         C.muted,
              flexShrink:    0,
              width:         "84px",
            }}>
              Formulation
            </span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize:   "12px",
              fontWeight: 600,
              color:      C.text,
              whiteSpace: "nowrap",
              overflow:   "hidden",
              textOverflow: "ellipsis"
            }}>
              {p.composition || p.dosage_form || "—"}
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
              width:         "84px",
            }}>
              Pack Size
            </span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize:   "12px",
              fontWeight: 600,
              color:      C.text,
            }}>
              {p.packaging || p.unit_measure ? `${p.packaging || ""} ${p.unit_measure ? `· ${p.unit_measure}` : ""}` : "—"}
            </span>
          </div>
        </div>

        {/* Thin divider */}
        <div style={{
          height:     "1px",
          background: C.border,
          margin:     "4px 0",
        }}/>

        {/* Description */}
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
          {p.short_description || "High-efficacy formulation engineered for superior clinical outcomes."}
        </p>

        {/* CTA row */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginTop:      "auto",
          paddingTop:     "8px",
        }}>
          <span style={{
            fontFamily:    "'DM Sans', sans-serif",
            fontSize:      "11px",
            fontWeight:    800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color:         hovered ? C.accent : C.primary,
            transition:    "color 0.22s ease",
          }}>
            View Details
          </span>

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
                strokeWidth="1.8"
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);

      if (!error && data) {
        setProducts(data as Product[]);
      }
      setLoading(false);
    }
    
    fetchProducts();
  }, []);

  return (
    <section style={{ padding: "100px 2rem", background: C.pageBg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        
        /* Remove GlobalImage default transparent borders that break layouts */
        .gl-img-wrap { border: none !important; border-bottom: none !important; background: transparent !important; }

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
        
        .ps-skel {
          background: #F8FAFC; border: 1px solid ${C.border}; border-radius: 16px; height: 480px;
          animation: pulse 1.5s infinite ease-in-out;
        }
        
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
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
              fontWeight:    800,
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
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="ps-skel" />)
          ) : products.length > 0 ? (
            products.map((p, i) => (
              <ProductCard key={p.id} p={p} index={i} />
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
              No products found. Please add products in the admin panel.
            </div>
          )}
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