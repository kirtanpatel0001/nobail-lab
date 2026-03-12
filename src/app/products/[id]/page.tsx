"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import GlobalImage from "@/components/GlobalImage";

// ─── Theme ────────────────────────────────────────────────────────────
const T = {
  primary:    "#1A2E38",
  secondary:  "#2C4A5C",
  accent:     "#5BA3C4",
  bg:         "#FFFFFF",
  bgAlt:      "#F8FAFC",
  bgDeep:     "#EFF4F7",
  border:     "#E2E8F0",
  muted:      "#64748B",
  mutedLight: "#94A3B8",
  rx:         "#DC2626",
  rxBg:       "#FEF2F2",
  rxBorder:   "#FECACA",
  new:        "#1D4ED8",
  newBg:      "#EFF6FF",
  newBorder:  "#BFDBFE",
};

// ─── Category styles ─────────────────────────────────────────────────
const catStyle: Record<string, { bg:string; fg:string; gradA:string; gradB:string }> = {
  Ophthalmic:             { bg:"#EFF8FF", fg:"#3A7FA0", gradA:"#C8E8F7", gradB:"#EFF8FF" },
  Dermatology:            { bg:"#FFF5F5", fg:"#C05252", gradA:"#FECACA", gradB:"#FFF5F5" },
  "General Therapeutics": { bg:"#F0FDF4", fg:"#2D8A5E", gradA:"#A7F3D0", gradB:"#F0FDF4" },
};
function getCatStyle(cat: string) { return catStyle[cat] ?? catStyle["General Therapeutics"]; }
function isNew(d?: string | null) { return !!d && Date.now() - new Date(d).getTime() < 30*86400000; }

function getImgUrl(val: string | null | undefined) {
  if (!val) return "";
  if (val.startsWith("http")) return val;
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${val}`;
}

// ─── Icons ────────────────────────────────────────────────────────────
function CatIcon({ cat, size=32 }: { cat:string; size?:number }) {
  const s = { width:size, height:size } as React.CSSProperties;
  if (cat === "Ophthalmic") return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" opacity="0.5"/>
    </svg>
  );
  if (cat === "Dermatology") return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
  return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

// ─── Gallery placeholder ─────────────────────────────────────────────
function GalleryPlaceholder({ cat, thumb=false }: { cat:string; thumb?:boolean }) {
  const cs = getCatStyle(cat);
  return (
    <div style={{ width:"100%", height:"100%", position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(145deg, ${cs.gradA} 0%, ${cs.gradB} 100%)` }} />
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.18 }} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:7},(_,r)=>Array.from({length:7},(_,c)=><circle key={`${r}-${c}`} cx={c*50} cy={r*50} r="1.8" fill={cs.fg}/>))}
      </svg>
      <div style={{
        position:"relative", zIndex:1,
        width: thumb ? 32 : 112, height: thumb ? 32 : 112,
        borderRadius:"50%",
        background:"rgba(255,255,255,0.88)", backdropFilter:"blur(8px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow: thumb ? `0 2px 8px ${cs.fg}20` : `0 16px 48px ${cs.fg}28, 0 2px 8px ${cs.fg}18`,
        border:`1.5px solid rgba(255,255,255,0.9)`, color:cs.fg, flexShrink:0,
      }}>
        <CatIcon cat={cat} size={thumb ? 15 : 44} />
      </div>
    </div>
  );
}

// ─── Reco card ───────────────────────────────────────────────────────
function RecoCard({ p }: { p:Product }) {
  const cs = getCatStyle(p.category || "");
  return (
    <Link href={`/products/${p.id}`}
      style={{ display:"flex", flexDirection:"column", background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:16, overflow:"hidden", textDecoration:"none", transition:"all 0.28s cubic-bezier(0.16,1,0.3,1)" }}
      onMouseEnter={e => { const el=e.currentTarget as HTMLAnchorElement; el.style.transform="translateY(-4px)"; el.style.boxShadow=`0 14px 36px rgba(26,46,56,0.1),0 0 0 1.5px ${T.accent}48`; el.style.borderColor=`${T.accent}50`; }}
      onMouseLeave={e => { const el=e.currentTarget as HTMLAnchorElement; el.style.transform=""; el.style.boxShadow=""; el.style.borderColor=T.border; }}
    >
      <div style={{ aspectRatio:"4/3", position:"relative", overflow:"hidden", background: T.bgAlt, borderBottom: `1px solid ${T.border}` }}>
        {p.image_id ? (
          <div className="no-pad-img" style={{ padding: '0.75rem', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GlobalImage src={getImgUrl(p.image_id)} alt={p.name} mode="contain" aspectRatio="4/3" />
          </div>
        ) : (
          <GalleryPlaceholder cat={p.category||""} />
        )}
        <div style={{ position:"absolute", top:12, left:12, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(8px)", borderRadius:8, padding:"4px 10px", fontSize:"0.55rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", color:cs.fg, zIndex: 10, border: `1px solid ${cs.fg}20` }}>
          {p.category}
        </div>
      </div>
      <div style={{ padding:"16px 18px", flex:1, display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ fontFamily:"monospace", fontSize:"0.65rem", color:T.mutedLight }}>{p.sku}</div>
        <div style={{ fontSize:"0.95rem", fontWeight:800, color:T.primary, lineHeight:1.35, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" } as React.CSSProperties}>{p.name}</div>
        <div style={{ marginTop:"auto", paddingTop:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:"1rem", fontWeight:800, color:T.primary, letterSpacing:"-0.02em" }}>{p.price || "—"}</span>
          <span style={{ fontSize:"0.65rem", fontWeight:800, color:T.accent, display:"flex", alignItems:"center", gap:4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            View <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Specs tab ───────────────────────────────────────────────────────
function SpecsContent({ product }: { product:Product }) {
  const rows = [
    { label:"Dosage Form",  value:(product as any).dosage_form },
    { label:"Packaging",    value:product.packaging },
    { label:"Unit / Size",  value:product.unit_measure },
    { label:"Status",       value:product.status ? product.status.charAt(0).toUpperCase()+product.status.slice(1) : null, green: product.status==="active" },
    { label:"Prescription", value:product.prescription_required ? "Required (Rx)" : "Not Required (OTC)" },
    { label:"Availability", value:(product.stock ?? 0) > 0 ? "In Stock" : "Out of Stock" },
  ].filter(r => r.value);
  return (
    <div>
      <div className="spec-table" style={{ border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden", background: "#fff" }}>
        {rows.map((r, i) => (
          <div key={i}
            style={{ display:"grid", gridTemplateColumns:"minmax(140px, 30%) 1fr", padding:"16px 24px", borderBottom: i<rows.length-1 ? `1px solid ${T.border}` : "none", transition:"background 0.15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background=T.bgAlt}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background=T.bg}
          >
            <span style={{ fontSize:"0.75rem", fontWeight:700, color:T.muted, alignSelf:"center" }}>{r.label}</span>
            <span style={{ fontSize:"0.95rem", fontWeight:600, color:(r as any).green ? "#166534" : T.primary }}>{r.value}</span>
          </div>
        ))}
      </div>
      {(product as any).composition && (
        <div style={{ marginTop:20, padding:"20px 24px", background:T.bgAlt, borderRadius:16, border:`1px solid ${T.border}` }}>
          <div style={{ fontSize:"0.65rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:T.muted, marginBottom:10 }}>Active Composition (APIs)</div>
          <div style={{ fontFamily:"monospace", fontSize:"0.95rem", fontWeight:600, color:T.primary, lineHeight:1.6 }}>{(product as any).composition}</div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const idStr = params?.id as string;
  const id = parseInt(idStr, 10);

  const [product,   setProduct]   = useState<Product|null>(null);
  const [loading,   setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [reccos,    setReccos]    = useState<Product[]>([]);

  // Setup images array correctly - MULTIPLE IMAGES
  const images = useMemo(() => {
    if (!product) return [];
    return [product.image_id, ...(product.gallery_images || [])].filter(Boolean) as string[];
  }, [product]);

  // Swipe tracking
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const prevImg = useCallback(() => {
    if (images.length === 0) return;
    setActiveImg(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const nextImg = useCallback(() => {
    if (images.length === 0) return;
    setActiveImg(i => (i + 1) % images.length);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? nextImg() : prevImg();
    }
  };

  useEffect(() => {
    async function load() {
      if (isNaN(id)) {
        router.push("/products");
        return;
      }

      // Fetch Real Product
      const { data, error } = await supabase.from("products").select("*").eq("id", id).eq("status","active").single();
      
      if (error || !data) { 
        router.push("/products"); 
        return; 
      }
      
      setProduct(data as Product);
      
      // Fetch Real Reccos
      const { data: rData } = await supabase.from("products")
        .select("*")
        .eq("status","active")
        .eq("category", data.category)
        .neq("id", data.id)
        .limit(4);
      
      setReccos(rData as Product[] || []);
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading || !product) return (
    <div style={{ background:T.bgAlt, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, color:T.mutedLight }}>
        <div style={{ width:40, height:40, borderRadius:"50%", border:`3px solid ${T.border}`, borderTopColor:T.accent, animation:"spin 0.8s linear infinite" }} />
        <span style={{ fontSize:"0.78rem", fontWeight:600, letterSpacing:"0.04em" }}>Loading product…</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  const cs      = getCatStyle(product.category || "");
  const inStock = (product.stock ?? 0) > 0;

  const TABS = [
    { id:"overview",       label:"Overview",        iconD:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4" },
    { id:"benefits",       label:"Clinical Benefits", iconD:"M22 12A10 10 0 1 1 12 2 M22 4 12 14.01 9 11.01" },
    { id:"usage",          label:"Usage & Admin",     iconD:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8" },
    { id:"pharmacology",   label:"Pharmacology",      iconD:"M10 2v7.31 M14 9.3V2 M8.5 2h7 M14 9.3a6.5 6.5 0 1 1-4 0" },
    { id:"specifications", label:"Specifications",    iconD:"M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01" },
  ];

  const tabContent: Record<string,React.ReactNode> = {
    overview:      <p style={{ fontSize:"1rem", color:T.muted, lineHeight:1.9, maxWidth:850 }}>{(product as any).short_description||"High-efficacy formulation engineered for superior clinical outcomes."}</p>,
    benefits:      <p style={{ fontSize:"1rem", color:T.muted, lineHeight:1.9, maxWidth:850, whiteSpace:"pre-wrap" }}>{(product as any).benefits||"No clinical benefit data available."}</p>,
    usage:         <p style={{ fontSize:"1rem", color:T.muted, lineHeight:1.9, maxWidth:850, whiteSpace:"pre-wrap" }}>{(product as any).usage_instructions||"No usage instructions available."}</p>,
    pharmacology:  <p style={{ fontSize:"1rem", color:T.muted, lineHeight:1.9, maxWidth:850, whiteSpace:"pre-wrap" }}>{product.description||"No pharmacological data available."}</p>,
    specifications:<SpecsContent product={product} />,
  };

  return (
    <main style={{ background:T.bgAlt, minHeight:"100vh", fontFamily:"var(--font-geist-sans)", color:T.primary }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        /* Override GlobalImage defaults that shrink the image */
        .gl-img-wrap { border: none !important; border-bottom: none !important; background: transparent !important; }
        .no-pad-img .gl-img-wrap { padding: 0 !important; width: 100% !important; height: 100% !important; }

        /* Breadcrumb */
        .bc-bar{background:#fff; border-bottom:1px solid ${T.border}; padding:14px 5vw;}
        .bc{max-width:1560px; margin:0 auto; display:flex; align-items:center; gap:8px; font-size:0.75rem; font-weight:600; color:${T.muted}}
        .bc a{color:${T.accent}; text-decoration:none; transition:opacity .15s}
        .bc a:hover{opacity:.7}
        .bc-sep{color:${T.border}; font-size:0.7rem}

        .page-wrap{max-width:1560px; margin:0 auto; padding:36px 4vw 80px}

        /* ─── PRODUCT HERO ─── */
        .product-top{
          display:grid;
          grid-template-columns: 58% 42%;
          background:${T.bg};
          border:1px solid ${T.border};
          border-radius:24px;
          overflow:hidden;
          margin-bottom:32px;
          box-shadow:0 12px 40px rgba(26,46,56,0.03);
          align-items: stretch;
        }

        /* ─── GALLERY SECTION (VERTICAL LAYOUT) ─── */
        .gallery-col{
          display:flex; 
          flex-direction:row; 
          justify-content: flex-start;
          border-right:1px solid ${T.border}; 
          background: #fff;
          padding: 32px;
          gap: 24px;
        }

        /* Thumbnail Track (Vertical) */
        .thumb-track{
          display:flex; flex-direction: column; gap:14px;
          width: 86px; flex-shrink: 0;
          overflow-y:auto; scrollbar-width:none;
          max-height: 540px; 
        }
        .thumb-track::-webkit-scrollbar{display:none;}
        
        .thumb-btn{
          width:84px; height:84px; border-radius:14px;
          border:2px solid ${T.border}; background:#fff;
          flex-shrink:0; cursor:pointer;
          transition:all .2s; 
          padding: 4px; /* Reduced padding to make image larger inside */
          display: flex; align-items: center; justify-content: center;
        }
        .thumb-btn:hover{border-color: ${T.mutedLight};}
        .thumb-btn.on{
          border: 3px solid ${T.primary}; /* Exact dark thick border from your screenshot */
          padding: 3px; /* Compensate for border thickness so image stays stable */
          box-shadow: 0 4px 14px rgba(26,46,56,0.08);
        }
        .thumb-inner { width: 100%; height: 100%; position: relative; border-radius: 8px; overflow: hidden; }

        /* Main Image */
        .main-img-wrap{
          flex: 1;
          height: 540px;
          position:relative;
          display:flex; align-items:center; justify-content:center;
          background: #F8FAFC;
          border: 1px solid ${T.border};
          border-radius: 16px;
          overflow:hidden;
          user-select:none;
        }

        /* ─── DATA COLUMN ─── */
        .data-col{display:flex; flex-direction:column; padding:48px 48px 48px 32px; background: #fff;}

        .p-eyebrow{
          display:inline-flex; align-items:center; gap:8px;
          font-size:0.65rem; font-weight:800; text-transform:uppercase; letter-spacing:0.15em;
          color:${cs.fg}; background:${cs.bg}; border:1px solid ${cs.fg}25;
          padding:6px 14px; border-radius:100px; margin-bottom:16px; width:fit-content;
        }

        .p-name{ font-size:2.2rem; font-weight:800; line-height:1.15; letter-spacing:-0.03em; color:${T.primary}; margin-bottom:12px; }

        .p-sku{
          display:inline-flex; align-items:center; gap:6px;
          font-family:monospace; font-size:0.75rem; color:${T.muted};
          background:${T.bgAlt}; border:1px solid ${T.border};
          padding:4px 12px; border-radius:8px; margin-bottom:24px; width:fit-content;
        }

        .price-row{display:flex; align-items:baseline; gap:10px; margin-bottom:6px}
        .p-price{font-size:2.4rem; font-weight:900; color:${T.primary}; letter-spacing:-0.04em; line-height:1}
        .p-unit{font-size:0.85rem; color:${T.mutedLight}; font-weight:600}

        .badges-row{display:flex; align-items:center; gap:8px; margin-bottom:24px; flex-wrap:wrap; margin-top:8px}
        .pill{display:inline-flex; align-items:center; gap:5px; padding:5px 14px; border-radius:100px; font-size:0.7rem; font-weight:800; letter-spacing:0.05em; border:1px solid}
        .pill-in{background:#F0FDF4; color:#166534; border-color:#BBF7D0}
        .pill-out{background:${T.rxBg}; color:${T.rx}; border-color:${T.rxBorder}}
        .pill-rx{background:${T.rxBg}; color:${T.rx}; border-color:${T.rxBorder}}
        .pill-new{background:${T.newBg}; color:${T.new}; border-color:${T.newBorder}}

        .p-short{ font-size:0.95rem; color:${T.muted}; line-height:1.7; margin-bottom:0; }
        .divider{height:1px; background:${T.border}; margin:32px 0}

        /* 3-cell key info */
        .keyinfo{
          display:grid; grid-template-columns:1fr 1fr 1fr;
          background:${T.bgAlt}; border:1px solid ${T.border}; border-radius:16px;
          overflow:hidden; margin-bottom:32px;
        }
        .ki-cell{padding:16px 20px; border-right:1px solid ${T.border};}
        .ki-cell:last-child{border-right:none}
        .ki-lbl{font-size:0.6rem; font-weight:800; text-transform:uppercase; letter-spacing:0.12em; color:${T.mutedLight}; margin-bottom:6px}
        .ki-val{font-size:0.95rem; font-weight:700; color:${T.primary}}

        /* CTAs */
        .cta-wrap{display:flex; flex-direction:column; gap:14px; margin-bottom:32px}
        .btn-primary{
          display:flex; align-items:center; justify-content:center; gap:10px;
          height:56px; border-radius:16px; border:none; cursor:pointer;
          font-family:inherit; font-size:0.9rem; font-weight:800;
          letter-spacing:0.06em; text-transform:uppercase;
          background:${T.primary}; color:#fff;
          box-shadow:0 8px 24px rgba(26,46,56,0.15);
          transition:all .2s; text-decoration:none;
        }
        .btn-primary:hover{background:${T.secondary}; transform:translateY(-2px); box-shadow:0 12px 32px rgba(26,46,56,0.2)}
        .btn-secondary{
          display:flex; align-items:center; justify-content:center; gap:8px;
          height:52px; border-radius:16px;
          border:1px solid ${T.border}; cursor:pointer;
          font-family:inherit; font-size:0.85rem; font-weight:700;
          color:${T.primary}; background:${T.bgAlt};
          transition:all .2s; text-decoration:none;
        }
        .btn-secondary:hover{border-color:${T.accent}; color:${T.accent}; background:#fff; transform:translateY(-1px)}

        /* Trust row */
        .trust-row{display:flex; align-items:center; gap:24px; flex-wrap:wrap; padding-top:20px; border-top:1px solid ${T.border}}
        .trust-item{display:flex; align-items:center; gap:6px; font-size:0.7rem; font-weight:700; color:${T.mutedLight}; text-transform:uppercase; letter-spacing:0.08em}
        .trust-item svg{color:${T.accent}}

        /* ─── TABS ─── */
        .tabs-section{
          background:#fff; border:1px solid ${T.border};
          border-radius:24px; overflow:hidden;
          margin-bottom:48px; box-shadow:0 4px 24px rgba(26,46,56,0.02);
        }
        .tabs-strip{
          display:flex; background:${T.bgAlt}; border-bottom:1px solid ${T.border};
          overflow-x:auto; scrollbar-width:none;
        }
        .tabs-strip::-webkit-scrollbar{display:none}
        .tab-btn{
          display:inline-flex; align-items:center; gap:8px;
          padding:18px 28px; border:none; background:transparent;
          cursor:pointer; font-family:inherit;
          font-size:0.85rem; font-weight:600; color:${T.muted};
          white-space:nowrap; transition:all .2s; border-bottom:2px solid transparent;
        }
        .tab-btn:hover:not(.on){color:${T.primary}; background:#fff;}
        .tab-btn.on{ color:${T.primary}; font-weight:800; background:#fff; border-bottom-color:${T.primary}; }
        .tab-content{padding:40px 48px}
        .tab-eyebrow{font-size:0.65rem; font-weight:800; text-transform:uppercase; letter-spacing:0.15em; color:${T.mutedLight}; margin-bottom:20px}

        /* ─── RECCOS ─── */
        .reco-header{display:flex; align-items:center; justify-content:space-between; margin-bottom:24px}
        .reco-title{font-size:1.4rem; font-weight:800; color:${T.primary}; letter-spacing:-0.02em}
        .reco-link{display:inline-flex; align-items:center; gap:6px; font-size:0.8rem; font-weight:700; color:${T.accent}; text-decoration:none; background:${T.bgAlt}; border:1px solid ${T.border}; padding:8px 20px; border-radius:100px; transition:all .2s}
        .reco-link:hover{background:${T.accent}; color:#fff; border-color:${T.accent}}
        .reco-grid{display:grid; grid-template-columns:repeat(4,1fr); gap:20px}

        /* ─── RESPONSIVE ─── */
        @media(max-width:1100px){
          .product-top{grid-template-columns:1fr}
          
          /* Switch Gallery to Horizontal on Mobile/Tablet */
          .gallery-col { 
            flex-direction: column; 
            border-right: none; 
            border-bottom: 1px solid ${T.border}; 
            padding: 24px;
          }
          .thumb-track {
            flex-direction: row; 
            width: 100%; 
            max-height: none; 
            padding: 16px 0 0 0;
            border-top: none;
            background: transparent;
            justify-content: flex-start;
          }
          .main-img-wrap{height: 400px;}
          
          .data-col{padding:32px}
          .reco-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:640px){
          .page-wrap{padding:20px 5vw 60px}
          .product-top{border-radius:16px}
          .main-img-wrap{height:300px; padding: 16px;}
          .data-col{padding:24px}
          .tab-content{padding:24px}
          .keyinfo{grid-template-columns:1fr}
          .ki-cell{border-right:none; border-bottom:1px solid ${T.border}}
          .ki-cell:last-child{border-bottom:none}
          .reco-grid{grid-template-columns:1fr; gap:16px}
          .p-name{font-size:1.6rem}
          .p-price{font-size:2rem}
          .tabs-strip{padding:0}
          .tab-btn{padding:14px 20px; font-size:0.8rem}
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="bc-bar">
        <nav className="bc">
          <Link href="/">Home</Link>
          <span className="bc-sep">/</span>
          <Link href="/products">Catalogue</Link>
          <span className="bc-sep">/</span>
          <span style={{ color:T.muted }}>{product.category}</span>
          <span className="bc-sep">/</span>
          <span style={{ color:T.primary, maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{product.name}</span>
        </nav>
      </div>

      <div className="page-wrap">

        {/* ════ HERO CARD ════ */}
        <motion.div className="product-top" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}>

          {/* ── GALLERY (Vertical layout on Desktop) ── */}
          <div className="gallery-col">
            
            {/* Thumbnails (Left side on desktop) */}
            {images.length > 1 && (
              <div className="thumb-track">
                {images.map((img, i)=>(
                  <button key={i} className={`thumb-btn ${activeImg===i?"on":""}`} onClick={()=>setActiveImg(i)}>
                    <div className="thumb-inner no-pad-img">
                      <GlobalImage src={getImgUrl(img)} alt="thumb" mode="contain" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Area */}
            <div
              className="main-img-wrap"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  initial={{ opacity:0, scale: 0.98 }}
                  animate={{ opacity:1, scale: 1 }}
                  exit={{ opacity:0, scale: 1.02 }}
                  transition={{ duration:0.25 }}
                  style={{ width:"100%", height:"100%", position:"absolute", inset:0, padding: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  className="no-pad-img"
                >
                  {images.length > 0 ? (
                    <GlobalImage src={getImgUrl(images[activeImg])} alt={product.name} mode="contain" />
                  ) : (
                    <GalleryPlaceholder cat={product.category||""} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            
          </div>

          {/* ── DATA ── */}
          <div className="data-col">

            {/* Category tag */}
            <div className="p-eyebrow">
              <CatIcon cat={product.category||""} size={12} />
              {product.category}
            </div>

            {/* Name */}
            <h1 className="p-name">{product.name}</h1>

            {/* SKU — compact, inline */}
            <div className="p-sku">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              {product.sku}
            </div>

            {/* Price */}
            <div className="price-row">
              <span className="p-price">{product.price||"—"}</span>
              {product.unit_measure && <span className="p-unit">/ {product.unit_measure}</span>}
            </div>

            {/* Badges */}
            <div className="badges-row">
              <span className={`pill ${inStock?"pill-in":"pill-out"}`}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"currentColor",flexShrink:0}}/>
                {inStock?"In Stock":"Out of Stock"}
              </span>
              {product.prescription_required && (
                <span className="pill pill-rx">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Rx Only
                </span>
              )}
              {isNew(product.created_at) && <span className="pill pill-new">✦ New</span>}
            </div>

            {/* Short description */}
            <p className="p-short">
              {(product as any).short_description||"High-efficacy formulation engineered for superior clinical outcomes."}
            </p>

            <div className="divider" />

            {/* 3-cell key info */}
            <div className="keyinfo">
              <div className="ki-cell">
                <div className="ki-lbl">Dosage Form</div>
                <div className="ki-val">{(product as any).dosage_form||"—"}</div>
              </div>
              <div className="ki-cell">
                <div className="ki-lbl">Packaging</div>
                <div className="ki-val">{product.packaging||"—"}</div>
              </div>
              <div className="ki-cell">
                <div className="ki-lbl">Unit / Size</div>
                <div className="ki-val">{product.unit_measure||"—"}</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="cta-wrap">
              <Link
                href={`/contact?subject=Product+Information&product=${encodeURIComponent(product.name)}&sku=${encodeURIComponent(product.sku)}&category=${encodeURIComponent(product.category||"")}`}
                className="btn-primary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Enquire About Product
              </Link>
              
              <Link href="/products" className="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Browse Full Catalogue
              </Link>
            </div>

            {/* Trust */}
            <div className="trust-row">
              {[
                { d:"M20 6 9 17 4 12", label:"Clinically Verified" },
                { d:"M3 11h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M7 11V7a5 5 0 0 1 10 0v4", label:"Secure Catalogue" },
                { d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label:"Premium Quality" },
              ].map(t=>(
                <div key={t.label} className="trust-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d={t.d}/>
                  </svg>
                  {t.label}
                </div>
              ))}
            </div>

          </div>
        </motion.div>

        {/* ════ TABS ════ */}
        <motion.div className="tabs-section" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.1 }}>
          <div className="tabs-strip">
            {TABS.map((tab,i)=>(
              <button key={tab.id} className={`tab-btn${activeTab===i?" on":""}`} onClick={()=>setActiveTab(i)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={tab.iconD}/>
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.2 }} className="tab-content">
              <div className="tab-eyebrow">{TABS[activeTab].label}</div>
              {tabContent[TABS[activeTab].id]}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ════ RELATED PRODUCTS ════ */}
        {reccos.length > 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.2 }}>
            <div className="reco-header">
              <h2 className="reco-title">Related Formulations</h2>
              <Link href="/products" className="reco-link">
                View all
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
            <div className="reco-grid">
              {reccos.map(r=><RecoCard key={r.id} p={r}/>)}
            </div>
          </motion.div>
        )}

      </div>
    </main>
  );
}