"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import GlobalImage from "@/components/GlobalImage";

// ─── Theme ───────────────────────────────────────────────────────────
const T = {
  primary:    "#1A2E38",
  secondary:  "#2C4A5C",
  accent:     "#5BA3C4",
  accentDark: "#3A7FA0",
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

type SortKey  = "newest" | "oldest" | "name_asc" | "name_desc" | "price_asc" | "price_desc";
type ViewMode = "grid" | "list";

const CATEGORIES = ["Ophthalmic", "Dermatology", "General Therapeutics"];
const PKG_TYPES  = ["Bottle", "Box", "Vial", "Tube", "Sachet", "Blister", "Ampoule", "Syringe"];

const CATEGORY_THEME: Record<string, { bg: string; fg: string; grad: string }> = {
  Ophthalmic:             { bg: "#EFF8FF", fg: "#3A7FA0", grad: "linear-gradient(145deg,#EFF8FF 0%,#DBEEFF 100%)" },
  Dermatology:            { bg: "#FFF5F5", fg: "#C05252", grad: "linear-gradient(145deg,#FFF5F5 0%,#FFE8E8 100%)" },
  "General Therapeutics": { bg: "#F0FDF4", fg: "#2D8A5E", grad: "linear-gradient(145deg,#F0FDF4 0%,#DCFCE7 100%)" },
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest",     label: "Newest First" },
  { value: "oldest",     label: "Oldest First" },
  { value: "name_asc",   label: "Name: A → Z" },
  { value: "name_desc",  label: "Name: Z → A" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

function getCategoryTheme(category: string) {
  return CATEGORY_THEME[category] ?? CATEGORY_THEME["General Therapeutics"];
}

function parsePrice(p: string | number | null | undefined): number {
  if (!p) return 0;
  const n = parseFloat(String(p).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function isNew(created_at?: string | null): boolean {
  if (!created_at) return false;
  return Date.now() - new Date(created_at).getTime() < 30 * 24 * 60 * 60 * 1000;
}

function getImgUrl(val: string | null | undefined) {
  if (!val) return "";
  if (val.startsWith("http")) return val;
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${val}`;
}

// ─── Category icon ────────────────────────────────────────────────────
function CategoryIcon({ category }: { category: string }) {
  if (category === "Ophthalmic") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
  if (category === "Dermatology") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

// ─── Accordion filter section ─────────────────────────────────────────
function FilterSection({
  title, badge, children, open: defaultOpen = true,
}: { title: string; badge?: number; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.73rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", letterSpacing: "0.09em" }}>
          {title}
          {!!badge && <span style={{ background: T.accent, color: "#fff", borderRadius: 100, padding: "1px 7px", fontSize: "0.6rem", fontWeight: 700 }}>{badge}</span>}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 20px 16px" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Checkbox({ label, checked, onChange, count }: { label: string; checked: boolean; onChange: () => void; count?: number }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 0", cursor: "pointer" }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? T.accent : T.border}`, background: checked ? T.accent : T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
        {checked && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
      <span style={{ fontSize: "0.82rem", color: checked ? T.primary : T.muted, fontWeight: checked ? 600 : 400, flex: 1 }}>{label}</span>
      {count !== undefined && <span style={{ fontSize: "0.68rem", color: T.mutedLight }}>{count}</span>}
    </label>
  );
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 0", cursor: "pointer" }}>
      <span style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${checked ? T.accent : T.border}`, background: checked ? T.accent : T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
        {checked && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "block" }} />}
      </span>
      <input type="radio" checked={checked} onChange={onChange} style={{ display: "none" }} />
      <span style={{ fontSize: "0.82rem", color: checked ? T.primary : T.muted, fontWeight: checked ? 600 : 400 }}>{label}</span>
    </label>
  );
}

// ─── Main page ────────────────────────────────────────────────────────
export default function PublicProductsPage() {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [search,       setSearch]       = useState("");
  const [cats,         setCats]         = useState<string[]>([]);
  const [pkgs,         setPkgs]         = useState<string[]>([]);
  const [rxOnly,       setRxOnly]       = useState(false);
  const [newOnly,      setNewOnly]      = useState(false);
  const [inStock,      setInStock]      = useState(false);
  const [priceRange,   setPriceRange]   = useState<[number, number]>([0, 9999]);
  const [gRange,       setGRange]       = useState<[number, number]>([0, 9999]);
  const [sort,         setSort]         = useState<SortKey>("newest");
  const [view,         setView]         = useState<ViewMode>("grid");
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // ─── Fetch from Supabase ─────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      const list: Product[] = (!error && data) ? (data as Product[]) : [];
      setProducts(list);

      const prices = list.map(p => parsePrice(p.price)).filter(v => v > 0);
      if (prices.length) {
        const lo = Math.floor(Math.min(...prices));
        const hi = Math.ceil(Math.max(...prices));
        setGRange([lo, hi]);
        setPriceRange([lo, hi]);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const toggleCat = (c: string) => setCats(v => v.includes(c) ? v.filter(x => x !== c) : [...v, c]);
  const togglePkg = (p: string) => setPkgs(v => v.includes(p) ? v.filter(x => x !== p) : [...v, p]);

  // ─── Filter + sort ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...products];
    if (cats.length)  list = list.filter(p => cats.includes(p.category ?? ""));
    if (pkgs.length)  list = list.filter(p => pkgs.some(pk => (p.packaging ?? "").toLowerCase().includes(pk.toLowerCase())));
    if (rxOnly)       list = list.filter(p => p.prescription_required);
    if (newOnly)      list = list.filter(p => isNew(p.created_at));
    if (inStock)      list = list.filter(p => (typeof p.stock === "number" ? p.stock > 0 : p.in_stock !== false));
    list = list.filter(p => { const pr = parsePrice(p.price); return pr === 0 || (pr >= priceRange[0] && pr <= priceRange[1]); });
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) ||
        (p.packaging ?? "").toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "oldest":     list.sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()); break;
      case "name_asc":   list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")); break;
      case "name_desc":  list.sort((a, b) => (b.name ?? "").localeCompare(a.name ?? "")); break;
      case "price_asc":  list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
      case "price_desc": list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
    }
    return list;
  }, [products, cats, pkgs, rxOnly, newOnly, inStock, priceRange, search, sort]);

  // ─── Counts ──────────────────────────────────────────────────────
  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    CATEGORIES.forEach(c => { m[c] = products.filter(p => p.category === c).length; });
    return m;
  }, [products]);

  const pkgCounts = useMemo(() => {
    const m: Record<string, number> = {};
    PKG_TYPES.forEach(pk => {
      m[pk] = products.filter(p => (p.packaging ?? "").toLowerCase().includes(pk.toLowerCase())).length;
    });
    return m;
  }, [products]);

  const filterCount =
    cats.length + pkgs.length
    + (rxOnly ? 1 : 0)
    + (newOnly ? 1 : 0)
    + (inStock ? 1 : 0)
    + (priceRange[0] !== gRange[0] || priceRange[1] !== gRange[1] ? 1 : 0)
    + (search.trim() ? 1 : 0);

  function clearAll() {
    setCats([]); setPkgs([]); setRxOnly(false); setNewOnly(false);
    setInStock(false); setPriceRange(gRange); setSearch(""); setSort("newest");
  }

  const priceLoFrac = gRange[1] === gRange[0] ? 0   : ((priceRange[0] - gRange[0]) / (gRange[1] - gRange[0])) * 100;
  const priceHiFrac = gRange[1] === gRange[0] ? 100 : ((priceRange[1] - gRange[0]) / (gRange[1] - gRange[0])) * 100;

  // ─── Sidebar component ────────────────────────────────────────────
  const Sidebar = () => (
    <nav style={{ fontFamily: "var(--font-geist-sans)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: `1px solid ${T.border}` }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: T.muted }}>
          Filters
          {filterCount > 0 && <span style={{ background: T.primary, color: "#fff", borderRadius: 100, padding: "1px 8px", fontSize: "0.6rem" }}>{filterCount}</span>}
        </span>
        {filterCount > 0 && (
          <button onClick={clearAll} style={{ fontSize: "0.72rem", color: T.accent, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.mutedLight, pointerEvents: "none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 30px 8px 30px", borderRadius: 9, border: `1.5px solid ${T.border}`, fontSize: "0.8rem", color: T.primary, background: T.bg, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
            onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = "0 0 0 3px rgba(91,163,196,0.12)"; }}
            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 17, height: 17, borderRadius: "50%", border: "none", background: T.bgDeep, color: T.muted, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          )}
        </div>
      </div>

      {/* Category */}
      <FilterSection title="Category" badge={cats.length}>
        {CATEGORIES.map(c => (
          <Checkbox key={c} label={c} checked={cats.includes(c)} onChange={() => toggleCat(c)} count={catCounts[c] ?? 0} />
        ))}
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range" badge={priceRange[0] !== gRange[0] || priceRange[1] !== gRange[1] ? 1 : 0}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {(["Min", "Max"] as const).map((label, idx) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{ fontSize: "0.6rem", color: T.mutedLight, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 4 }}>{label}</div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: T.muted, fontWeight: 600, pointerEvents: "none" }}>$</span>
                <input
                  type="number" min={gRange[0]} max={gRange[1]}
                  value={priceRange[idx]}
                  onChange={e => {
                    const v = Number(e.target.value);
                    if (idx === 0) setPriceRange([Math.min(v, priceRange[1]), priceRange[1]]);
                    else setPriceRange([priceRange[0], Math.max(v, priceRange[0])]);
                  }}
                  style={{ width: "100%", padding: "7px 6px 7px 20px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: "0.8rem", fontWeight: 600, color: T.primary, background: T.bg, fontFamily: "inherit", outline: "none" }}
                />
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: "relative", height: 4, background: T.border, borderRadius: 99, margin: "4px 0 6px" }}>
          <div style={{ position: "absolute", left: `${priceLoFrac}%`, right: `${100 - priceHiFrac}%`, height: "100%", background: T.accent, borderRadius: 99 }} />
          <input type="range" min={gRange[0]} max={gRange[1]} value={priceRange[0]}
            onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
            style={{ position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer", top: 0, left: 0, zIndex: 1 }}
          />
          <input type="range" min={gRange[0]} max={gRange[1]} value={priceRange[1]}
            onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
            style={{ position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer", top: 0, left: 0, zIndex: 2 }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.67rem", color: T.mutedLight }}>
          <span>${gRange[0]}</span><span>${gRange[1]}</span>
        </div>
      </FilterSection>

      {/* Product Type */}
      <FilterSection title="Product Type" badge={[rxOnly, newOnly, inStock].filter(Boolean).length}>
        <Checkbox label="Prescription Required (Rx)" checked={rxOnly} onChange={() => setRxOnly(v => !v)} />
        <Checkbox label="New Arrivals (last 30 days)" checked={newOnly} onChange={() => setNewOnly(v => !v)} />
        <Checkbox label="In Stock Only" checked={inStock} onChange={() => setInStock(v => !v)} />
      </FilterSection>

      {/* Packaging */}
      <FilterSection title="Packaging" badge={pkgs.length} open={false}>
        {PKG_TYPES.filter(pk => (pkgCounts[pk] ?? 0) > 0).length > 0
          ? PKG_TYPES.filter(pk => (pkgCounts[pk] ?? 0) > 0).map(pk => (
              <Checkbox key={pk} label={pk} checked={pkgs.includes(pk)} onChange={() => togglePkg(pk)} count={pkgCounts[pk]} />
            ))
          : <p style={{ fontSize: "0.78rem", color: T.mutedLight, fontStyle: "italic", margin: 0 }}>No packaging data.</p>
        }
      </FilterSection>

      {/* Sort */}
      <FilterSection title="Sort By" open={false}>
        {SORT_OPTIONS.map(o => (
          <Radio key={o.value} label={o.label} checked={sort === o.value} onChange={() => setSort(o.value)} />
        ))}
      </FilterSection>

      <div style={{ height: 20 }} />
    </nav>
  );

  return (
    <main style={{ background: T.bgAlt, minHeight: "100vh", fontFamily: "var(--font-geist-sans)" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ─── Header ─── */
        .ph {
          background: linear-gradient(140deg, ${T.primary} 0%, #133845 58%, #0f2d38 100%);
          padding: 52px 5vw 40px;
          position: relative;
          overflow: hidden;
        }
        .ph::before {
          content: "";
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 80% at 75% 50%, rgba(91,163,196,0.22) 0%, transparent 65%),
            radial-gradient(ellipse 45% 70% at 10% 100%, rgba(52,211,153,0.14) 0%, transparent 60%);
          pointer-events: none;
        }
        .ph-ring { position:absolute; border-radius:50%; border:1px solid rgba(91,163,196,0.1); pointer-events:none; }
        .ph-inner { max-width:1560px; margin:0 auto; position:relative; z-index:1; }
        .ph-eyebrow { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
        .ph-line { width:28px; height:2px; background:${T.accent}; border-radius:99px; }
        .ph-tag { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.22em; color:${T.accent}; }
        .ph-title { font-size:clamp(2rem,3.5vw,3.2rem); font-weight:800; color:#fff; letter-spacing:-0.035em; line-height:1.05; margin-bottom:8px; }
        .ph-sub { font-size:0.88rem; color:rgba(255,255,255,0.64); max-width:480px; line-height:1.65; }

        /* ─── Layout ─── */
        .cl { max-width:1560px; margin:0 auto; padding:28px 5vw 80px; display:grid; grid-template-columns:268px 1fr; gap:24px; align-items:start; }
        @media (max-width:960px) {
          .cl { grid-template-columns:1fr; }
          .sidebar-d { display:none !important; }
        }
        @media (min-width:961px) { .mob-bar { display:none !important; } .drawer-wrap { display:none !important; } }

        /* ─── Sidebar ─── */
        .sidebar-d {
          position:sticky; top:24px;
          background:${T.bg}; border:1.5px solid ${T.border}; border-radius:16px;
          overflow:hidden; max-height:calc(100vh - 48px); overflow-y:auto;
          scrollbar-width:thin; scrollbar-color:${T.border} transparent;
        }
        .sidebar-d::-webkit-scrollbar { width:3px; }
        .sidebar-d::-webkit-scrollbar-thumb { background:${T.border}; border-radius:99px; }

        /* ─── Mobile bar ─── */
        .mob-bar {
          display:flex; align-items:center; gap:10px;
          padding:12px 5vw; background:${T.bg};
          border-bottom:1px solid ${T.border};
          position:sticky; top:0; z-index:50;
        }
        .mob-filter-btn {
          display:flex; align-items:center; gap:7px;
          padding:8px 14px; border-radius:9px;
          border:1.5px solid ${T.border}; background:${T.bg};
          font-size:0.8rem; font-weight:600; color:${T.primary};
          cursor:pointer; font-family:inherit;
        }

        /* ─── Drawer ─── */
        .drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:100; backdrop-filter:blur(3px); }
        .drawer { position:fixed; left:0; top:0; bottom:0; width:min(310px,90vw); background:${T.bg}; z-index:101; overflow-y:auto; box-shadow:8px 0 48px rgba(0,0,0,0.18); }
        .drawer-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid ${T.border}; position:sticky; top:0; background:${T.bg}; z-index:1; }
        .drawer-close { width:30px; height:30px; border-radius:7px; border:1.5px solid ${T.border}; background:${T.bgAlt}; cursor:pointer; display:flex; align-items:center; justify-content:center; color:${T.muted}; font-size:14px; }

        /* ─── Toolbar ─── */
        .toolbar {
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          margin-bottom:12px; flex-wrap:wrap;
          padding:12px; border:1px solid ${T.border}; border-radius:14px;
          background:rgba(255,255,255,0.85); backdrop-filter:blur(5px);
          position:sticky; top:10px; z-index:10;
        }
        .tb-left { display:flex; align-items:center; gap:8px; flex-wrap:wrap; flex:1; }
        .result-ct { font-size:0.82rem; color:${T.muted}; font-weight:500; white-space:nowrap; }
        .result-ct strong { color:${T.primary}; font-weight:700; }
        .chips { display:flex; gap:5px; flex-wrap:wrap; }
        .chip { display:flex; align-items:center; gap:5px; padding:3px 10px; border-radius:100px; background:${T.bg}; border:1px solid ${T.border}; font-size:0.7rem; font-weight:600; color:${T.secondary}; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
        .chip:hover { background:${T.rxBg}; border-color:${T.rxBorder}; color:${T.rx}; }
        .tb-right { display:flex; align-items:center; gap:8px; }
        .sort-select { border:1.5px solid ${T.border}; background:${T.bg}; border-radius:9px; height:33px; padding:0 10px; font-size:0.76rem; font-weight:700; color:${T.primary}; font-family:inherit; outline:none; }
        .sort-select:focus { border-color:${T.accent}; box-shadow:0 0 0 3px rgba(91,163,196,0.14); }
        .view-tog { display:flex; border:1.5px solid ${T.border}; border-radius:9px; overflow:hidden; }
        .vb { padding:6px 9px; border:none; background:transparent; color:${T.mutedLight}; cursor:pointer; display:flex; align-items:center; transition:all 0.15s; }
        .vb:first-child { border-right:1.5px solid ${T.border}; }
        .vb.on { background:${T.primary}; color:#fff; }

        /* ─── Grid ─── */
        .pgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:18px; }

        /* ─── Card ─── */
        .pcard {
          display:flex; flex-direction:column;
          background:${T.bg}; border:1.5px solid ${T.border};
          border-radius:18px; overflow:hidden; text-decoration:none;
          transition:all 0.32s cubic-bezier(0.16,1,0.3,1);
          box-shadow:0 2px 8px rgba(26,46,56,0.04);
        }
        .pcard:hover {
          transform:translateY(-6px);
          box-shadow:0 20px 48px rgba(26,46,56,0.13);
          border-color:rgba(91,163,196,0.55);
        }

        /* Image zone */
        .pcard-thumb {
          position:relative;
          overflow:hidden; flex-shrink:0; width:100%;
          background:${T.bgAlt};
          border-bottom: 1px solid ${T.border};
        }
        .pcard-thumb .gl-img-wrap { border-bottom: none !important; }
        .pcard-thumb img { transition:transform 0.4s ease; }
        .pcard:hover .pcard-thumb img { transform:scale(1.04); }

        /* Badges */
        .badges { position:absolute; top:10px; left:10px; display:flex; flex-direction:column; gap:4px; z-index:2; }
        .badge { padding:3px 8px; border-radius:6px; font-size:0.58rem; font-weight:800; letter-spacing:0.1em; border-width:1px; border-style:solid; width:fit-content; text-transform:uppercase; backdrop-filter:blur(6px); }
        .b-rx  { background:rgba(254,242,242,0.92); color:${T.rx};  border-color:${T.rxBorder}; }
        .b-new { background:rgba(239,246,255,0.92); color:${T.new}; border-color:${T.newBorder}; }
        .b-stk { background:rgba(240,253,244,0.92); color:#166534; border-color:#BBF7D0; }
        .b-oos { background:rgba(254,242,242,0.92); color:${T.rx};  border-color:${T.rxBorder}; }

        /* Body */
        .pcard-body {
          padding:14px 16px 14px;
          flex:1; display:flex; flex-direction:column;
        }
        .pc-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
        .pc-cat { font-size:0.6rem; color:${T.accent}; font-weight:800; text-transform:uppercase; letter-spacing:0.12em; }
        .pc-sku { font-family:"SF Mono","Fira Code",monospace; font-size:0.6rem; color:${T.mutedLight}; }
        .pc-name {
          font-size:1.05rem; font-weight:750; color:${T.primary};
          line-height:1.3; letter-spacing:-0.02em;
          margin-bottom:4px;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .pc-pack { font-size:0.7rem; color:${T.muted}; margin-bottom:10px; }
        .pc-foot {
          margin-top:auto; display:flex; align-items:center; justify-content:space-between;
          padding-top:10px; border-top:1px solid ${T.border};
          gap:8px;
        }
        .pc-price {
          font-size:1.25rem; font-weight:800; color:${T.primary};
          letter-spacing:-0.03em; line-height:1;
        }
        .pc-price span { font-size:0.72rem; font-weight:600; color:${T.muted}; margin-left:1px; }
        .pc-cta {
          display:flex; align-items:center; gap:6px;
          padding:7px 14px; border-radius:9px;
          background:${T.primary}; color:#fff;
          font-size:0.72rem; font-weight:700;
          transition:all 0.2s; white-space:nowrap;
        }
        .pcard:hover .pc-cta { background:${T.accent}; gap:10px; }

        /* ─── List ─── */
        .plist { display:flex; flex-direction:column; gap:9px; }
        .pli { display:flex; align-items:stretch; background:${T.bg}; border:1.5px solid ${T.border}; border-radius:13px; overflow:hidden; text-decoration:none; transition:all 0.22s ease; }
        .pli:hover { border-color:rgba(91,163,196,0.5); box-shadow:0 5px 18px rgba(26,46,56,0.07); transform:translateX(3px); }
        .pli-thumb { width:120px; min-width:120px; display:flex; align-items:center; justify-content:center; border-right:1.5px solid ${T.border}; overflow:hidden; position:relative; }
        .pli-thumb .gl-img-wrap { border-bottom: none !important; }
        .pli-body { flex:1; padding:12px 14px; display:flex; flex-direction:column; justify-content:center; min-width:0; }
        .pli-meta { display:flex; align-items:center; gap:6px; margin-bottom:3px; }
        .pli-cat { font-size:0.62rem; color:${T.accent}; font-weight:800; text-transform:uppercase; letter-spacing:0.09em; }
        .pli-name { font-size:0.9rem; font-weight:700; color:${T.primary}; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .pli-sku { font-family:"SF Mono","Fira Code",monospace; font-size:0.65rem; color:${T.mutedLight}; }
        .pli-pack { border:1px solid ${T.border}; background:${T.bgAlt}; color:${T.secondary}; border-radius:999px; padding:1px 8px; font-size:0.62rem; font-weight:700; }
        .pli-right { padding:12px 16px; display:flex; flex-direction:column; align-items:flex-end; justify-content:center; gap:8px; border-left:1px solid ${T.border}; flex-shrink:0; }
        .pli-price { font-size:0.95rem; font-weight:800; color:${T.primary}; }
        .pli-arr { color:${T.accent}; display:flex; align-items:center; transition:transform 0.2s; }
        .pli:hover .pli-arr { transform:translateX(4px); }

        /* ─── Empty ─── */
        .empty { text-align:center; padding:5rem 2rem; }
        .empty-icon { font-size:3rem; margin-bottom:12px; filter:grayscale(1); opacity:0.3; }
        .empty-title { font-size:1.1rem; font-weight:800; color:${T.primary}; margin-bottom:8px; }
        .empty-sub { font-size:0.82rem; color:${T.muted}; max-width:280px; margin:0 auto 18px; line-height:1.65; }
        .empty-btn { padding:9px 22px; border-radius:9px; border:none; background:${T.primary}; color:#fff; font-size:0.82rem; font-weight:700; cursor:pointer; font-family:inherit; }
        .empty-btn:hover { opacity:0.85; }

        /* ─── Skeleton ─── */
        .skel { background:${T.bg}; border-radius:14px; border:1.5px solid ${T.border}; overflow:hidden; }
        .sk { background:${T.border}; border-radius:4px; animation:sk 1.6s ease-in-out infinite; }
        @keyframes sk { 0%,100%{opacity:1} 50%{opacity:0.45} }

        @media (max-width:960px) { .toolbar { position:static; backdrop-filter:none; } }
        @media (max-width:680px) { .tb-right { width:100%; justify-content:space-between; } .sort-select { width:100%; } .toolbar { padding:10px; } .result-ct { width:100%; } }
        @media (max-width:560px) { .pgrid { grid-template-columns:repeat(2,1fr); gap:10px; } .pc-name { font-size:0.88rem; } .pc-price { font-size:1.05rem; } }
      `}</style>

      {/* ─── Page header ─── */}
      <header className="ph">
        <div className="ph-ring" style={{ width: 500, height: 500, right: -120, top: -180 }} />
        <div className="ph-ring" style={{ width: 260, height: 260, right: 80, top: 20, borderColor: "rgba(91,163,196,0.07)" }} />
        <div className="ph-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="ph-eyebrow"><div className="ph-line" /><span className="ph-tag">The Formulary</span></div>
            <h1 className="ph-title">Clinical Portfolio.</h1>
            <p className="ph-sub">High-efficacy pharmaceutical solutions engineered for superior patient outcomes.</p>
          </motion.div>
        </div>
      </header>

      {/* ─── Mobile bar ─── */}
      <div className="mob-bar">
        <button className="mob-filter-btn" onClick={() => setDrawerOpen(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filters {filterCount > 0 && `(${filterCount})`}
        </button>
        <span style={{ flex: 1, fontSize: "0.78rem", color: T.muted }}>{filtered.length} products</span>
        <div className="view-tog">
          <button className={`vb${view === "grid" ? " on" : ""}`} onClick={() => setView("grid")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </button>
          <button className={`vb${view === "list" ? " on" : ""}`} onClick={() => setView("list")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
          </button>
        </div>
      </div>

      {/* ─── Mobile drawer ─── */}
      <div className="drawer-wrap">
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} />
              <motion.div className="drawer" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }}>
                <div className="drawer-head">
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", letterSpacing: "0.1em" }}>Filters</span>
                  <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
                </div>
                <Sidebar />
                <div style={{ padding: "0 20px 24px" }}>
                  <button onClick={() => setDrawerOpen(false)} style={{ width: "100%", padding: "12px", borderRadius: 11, border: "none", background: T.primary, color: "#fff", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    Show {filtered.length} Results
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Main layout ─── */}
      <div className="cl">
        <aside className="sidebar-d"><Sidebar /></aside>

        <div>
          {/* Toolbar */}
          <div className="toolbar">
            <div className="tb-left">
              <p className="result-ct">
                <strong>{filtered.length}</strong> of <strong>{products.length}</strong> products
              </p>
              <div className="chips">
                {cats.map(c => (
                  <button key={c} className="chip" onClick={() => toggleCat(c)}>
                    {c}
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                ))}
                {rxOnly && (
                  <button className="chip" onClick={() => setRxOnly(false)}>
                    Rx Only
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
                {newOnly && (
                  <button className="chip" onClick={() => setNewOnly(false)}>
                    New Arrivals
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
                {inStock && (
                  <button className="chip" onClick={() => setInStock(false)}>
                    In Stock
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
                {pkgs.map(p => (
                  <button key={p} className="chip" onClick={() => togglePkg(p)}>
                    {p}
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="tb-right">
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value as SortKey)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="view-tog">
                <button className={`vb${view === "grid" ? " on" : ""}`} onClick={() => setView("grid")} title="Grid">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </button>
                <button className={`vb${view === "list" ? " on" : ""}`} onClick={() => setView("list")} title="List">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* ─── Product list ─── */}
          {isLoading ? (
            /* Skeleton grid */
            <div className="pgrid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skel">
                  <div style={{ aspectRatio: "4/3", background: T.bgDeep, animation: `sk 1.6s ${i * 0.07}s ease-in-out infinite` }} />
                  <div style={{ padding: "0.95rem 1.05rem" }}>
                    <div className="sk" style={{ height: 7, width: "35%", marginBottom: 8 }} />
                    <div className="sk" style={{ height: 15, width: "75%", marginBottom: 5 }} />
                    <div className="sk" style={{ height: 9, width: "50%", marginBottom: 14 }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div className="sk" style={{ height: 16, width: "30%" }} />
                      <div className="sk" style={{ height: 16, width: "22%" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div className="empty">
              <div className="empty-icon">🔬</div>
              <h3 className="empty-title">
                {products.length === 0 ? "No products yet" : "No products found"}
              </h3>
              <p className="empty-sub">
                {products.length === 0
                  ? "Products added to the catalogue will appear here."
                  : search
                    ? `No results for "${search}". Try adjusting your search or filters.`
                    : "No products match your selected filters."
                }
              </p>
              {filterCount > 0 && (
                <button className="empty-btn" onClick={clearAll}>Clear all filters</button>
              )}
            </div>
          ) : view === "grid" ? (
            /* ─── GRID VIEW ─── */
            <div className="pgrid">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => {
                  const inStockP = typeof p.stock === "number" ? p.stock > 0 : p.in_stock !== false;
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: Math.min(i * 0.03, 0.22), duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link href={`/products/${p.id}`} className="pcard">
                        
                        <div className="pcard-thumb">
                          <div className="badges">
                            {p.prescription_required && <span className="badge b-rx">Rx Only</span>}
                            {isNew(p.created_at) && <span className="badge b-new">New</span>}
                            {inStockP
                              ? <span className="badge b-stk">In Stock</span>
                              : <span className="badge b-oos">Out of Stock</span>
                            }
                          </div>
                          {p.image_id ? (
                            <GlobalImage src={getImgUrl(p.image_id)} alt={p.name} mode="contain" aspectRatio="4/3" />
                          ) : (
                            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background: getCategoryTheme(p.category ?? "").bg, color: getCategoryTheme(p.category ?? "").fg }}>
                              <div style={{ opacity:0.45, transform:"scale(2.8)" }}>
                                <CategoryIcon category={p.category ?? ""} />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pcard-body">
                          <div className="pc-top">
                            <span className="pc-cat">{p.category}</span>
                            <span className="pc-sku">{p.sku}</span>
                          </div>
                          <h2 className="pc-name">{p.name}</h2>
                          {(p.packaging || p.unit_measure) && (
                            <span className="pc-pack">{p.packaging || p.unit_measure}</span>
                          )}
                          <div className="pc-foot">
                            <span className="pc-price">
                              {p.price ? p.price : "—"}
                            </span>
                            <span className="pc-cta">
                              View
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                              </svg>
                            </span>
                          </div>
                        </div>

                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            /* ─── LIST VIEW ─── */
            <div className="plist">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => {
                  const inStockP = typeof p.stock === "number" ? p.stock > 0 : p.in_stock !== false;
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: Math.min(i * 0.022, 0.18), duration: 0.22 }}
                    >
                      <Link href={`/products/${p.id}`} className="pli">
                        <div className="pli-thumb">
                           {p.image_id ? (
                             <GlobalImage src={getImgUrl(p.image_id)} alt={p.name} mode="contain" aspectRatio="1/1" />
                           ) : (
                             <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: getCategoryTheme(p.category ?? "").bg, color: getCategoryTheme(p.category ?? "").fg }}>
                               <CategoryIcon category={p.category ?? ""} />
                             </div>
                           )}
                        </div>
                        <div className="pli-body">
                          <div className="pli-meta">
                            <span className="pli-cat">{p.category}</span>
                            {p.prescription_required && <span className="badge b-rx">Rx</span>}
                            {isNew(p.created_at) && <span className="badge b-new">New</span>}
                          </div>
                          <p className="pli-name">{p.name}</p>
                          <span className="pli-sku">{p.sku}{p.packaging || p.unit_measure ? ` · ${p.packaging || p.unit_measure}` : ""}</span>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                            {!inStockP && <span className="badge b-oos">Out of Stock</span>}
                          </div>
                        </div>
                        <div className="pli-right">
                          <span className="pli-price">{p.price || "—"}</span>
                          <span className="pli-arr">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                            </svg>
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}