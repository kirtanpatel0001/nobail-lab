"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import GlobalImage from "@/components/GlobalImage";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  primary:    "#1A2E38",
  secondary:  "#2C4A5C",
  accent:     "#5BA3C4",
  accentDark: "#3A7FA0",
  bg:         "#FFFFFF",
  bgAlt:      "#F4F7FA",
  bgDeep:     "#E8EFF4",
  border:     "#D8E3EA",
  muted:      "#64748B",
  mutedLight: "#94A3B8",
  rx:         "#B91C1C",
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

const CATEGORY_META: Record<string, { bg: string; fg: string; label: string }> = {
  Ophthalmic:             { bg: "#EBF5FF", fg: "#2471A3", label: "Ophthalmic"   },
  Dermatology:            { bg: "#FFF0F0", fg: "#A93226", label: "Dermatology"  },
  "General Therapeutics": { bg: "#EAFAF1", fg: "#1E8449", label: "Therapeutics" },
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest",     label: "Newest First" },
  { value: "oldest",     label: "Oldest First" },
  { value: "name_asc",   label: "Name: A → Z" },
  { value: "name_desc",  label: "Name: Z → A" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

function getCategoryMeta(category: string) {
  return CATEGORY_META[category] ?? CATEGORY_META["General Therapeutics"];
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
function formatINR(amount: number) {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

// ─── Pharma Packaging Icons (hand-crafted SVGs) ───────────────────────────────
function PackagingIcon({ type, size = 14 }: { type: string; size?: number }) {
  const t = (type || "").toLowerCase();
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (t.includes("bottle")) return (
    <svg {...props}>
      <path d="M9 3h6M8.5 3v2.5L5.5 9.5V20a1.5 1.5 0 0 0 1.5 1.5h10A1.5 1.5 0 0 0 18.5 20V9.5l-3-4V3"/>
      <line x1="5.5" y1="14" x2="18.5" y2="14"/>
    </svg>
  );

  if (t.includes("tube")) return (
    <svg {...props}>
      <path d="M10.5 2h3v2h-3z"/>
      <path d="M9.5 4h5l1.5 3.5V19a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 19V7.5z"/>
      <path d="M8 11.5h8"/>
    </svg>
  );

  if (t.includes("vial")) return (
    <svg {...props}>
      <path d="M9 2.5h6"/>
      <path d="M10 2.5v3.8L6 17a1.5 1.5 0 0 0 1.4 2h9.2A1.5 1.5 0 0 0 18 17l-4-10.7V2.5"/>
      <line x1="6.2" y1="15" x2="17.8" y2="15"/>
    </svg>
  );

  if (t.includes("tube")) return (
    <svg {...props}>
      <ellipse cx="12" cy="20" rx="4" ry="1.5"/>
      <path d="M8 20V8l1.5-2h5L16 8v12"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <path d="M10.5 6h3"/>
    </svg>
  );

  if (t.includes("sachet")) return (
    <svg {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="2"/>
      <path d="M3.5 9.5h17M9 5v4.5M15 5v4.5"/>
    </svg>
  );

  if (t.includes("blister")) return (
    <svg {...props}>
      <rect x="2" y="6.5" width="20" height="11" rx="1.5"/>
      <path d="M7 12a2 2 0 0 0 4 0 2 2 0 0 0-4 0z"/>
      <path d="M13 12a2 2 0 0 0 4 0 2 2 0 0 0-4 0z"/>
    </svg>
  );

  if (t.includes("ampoule")) return (
    <svg {...props}>
      <path d="M12 2v4"/>
      <path d="M10 6h4"/>
      <path d="M9.5 6c0 0-1.5 2-1.5 4v8a2 2 0 0 0 4 0v-8c0-2-1.5-4-1.5-4"/>
      <path d="M14.5 6c0 0 1.5 2 1.5 4v8a2 2 0 0 1-4 0"/>
    </svg>
  );

  if (t.includes("syringe")) return (
    <svg {...props}>
      <path d="m18.5 2.5 3 3"/>
      <path d="m21.5 5.5-3 3-1.5-1.5 3-3"/>
      <path d="M15.5 8.5 7 17l-2 .5-.5-2L13 7"/>
      <path d="m7 17-2.5 2.5"/>
      <path d="M10 10l4 4"/>
      <path d="M12 12l-1 1"/>
    </svg>
  );

  // Box (default)
  return (
    <svg {...props}>
      <path d="M21 8.5l-9-5-9 5v7l9 5 9-5v-7z"/>
      <polyline points="3.27 6.96 12 12 20.73 6.96"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  );
}

// ─── Category placeholder icon ─────────────────────────────────────────────
function CategoryIcon({ category }: { category: string }) {
  if (category === "Ophthalmic") return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
  if (category === "Dermatology") return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

// ─── Filter Accordion ─────────────────────────────────────────────────────────
function FilterSection({ title, badge, children, open: defaultOpen = true }:
  { title: string; badge?: number; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button onClick={() => setOpen(v => !v)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 18px", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
        <span style={{ display:"flex", alignItems:"center", gap:7, fontSize:"0.68rem", fontWeight:800, color:T.primary, textTransform:"uppercase", letterSpacing:"0.1em" }}>
          {title}
          {!!badge && <span style={{ background:T.accent, color:"#fff", borderRadius:100, padding:"1px 7px", fontSize:"0.58rem", fontWeight:700 }}>{badge}</span>}
        </span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.mutedLight} strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? "rotate(180deg)" : "none", transition:"transform 0.2s", flexShrink:0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} style={{ overflow:"hidden" }}>
            <div style={{ padding:"0 18px 14px" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Checkbox({ label, checked, onChange, count, icon }: { label:string; checked:boolean; onChange:()=>void; count?:number; icon?: React.ReactNode }) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:9, padding:"5px 0", cursor:"pointer" }}>
      <span style={{ width:16, height:16, borderRadius:4, border:`2px solid ${checked ? T.accent : T.border}`, background: checked ? T.accent : T.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
        {checked && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display:"none" }} />
      {icon && <span style={{ color: checked ? T.accent : T.mutedLight, display:"flex", flexShrink:0 }}>{icon}</span>}
      <span style={{ fontSize:"0.8rem", color: checked ? T.primary : T.muted, fontWeight: checked ? 600 : 400, flex:1 }}>{label}</span>
      {count !== undefined && <span style={{ fontSize:"0.65rem", color:T.mutedLight, background:T.bgDeep, padding:"1px 6px", borderRadius:99, fontWeight:600 }}>{count}</span>}
    </label>
  );
}

function Radio({ label, checked, onChange }: { label:string; checked:boolean; onChange:()=>void }) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:9, padding:"5px 0", cursor:"pointer" }}>
      <span style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${checked ? T.accent : T.border}`, background: checked ? T.accent : T.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
        {checked && <span style={{ width:5, height:5, borderRadius:"50%", background:"#fff", display:"block" }} />}
      </span>
      <input type="radio" checked={checked} onChange={onChange} style={{ display:"none" }} />
      <span style={{ fontSize:"0.8rem", color: checked ? T.primary : T.muted, fontWeight: checked ? 600 : 400 }}>{label}</span>
    </label>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PublicProductsPage() {
  const searchParams = useSearchParams();

  const [products,   setProducts]   = useState<Product[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [search,     setSearch]     = useState("");
  const [cats,       setCats]       = useState<string[]>([]);
  const [pkgs,       setPkgs]       = useState<string[]>([]);
  const [rxOnly,     setRxOnly]     = useState(false);
  const [newOnly,    setNewOnly]    = useState(false);
  const [inStock,    setInStock]    = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999]);
  const [gRange,     setGRange]     = useState<[number, number]>([0, 99999]);
  const [sort,       setSort]       = useState<SortKey>("newest");
  const [view,       setView]       = useState<ViewMode>("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Read ?category= from URL and auto-apply filter
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && CATEGORIES.includes(cat)) setCats([cat]);
    else setCats([]);
  }, [searchParams]);

  // ── Fetch
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products").select("*").eq("status", "active").order("created_at", { ascending: false });
      const list: Product[] = (!error && data) ? (data as Product[]) : [];
      setProducts(list);
      const prices = list.map(p => parsePrice(p.price)).filter(v => v > 0);
      if (prices.length) {
        const lo = Math.floor(Math.min(...prices));
        const hi = Math.ceil(Math.max(...prices));
        setGRange([lo, hi]); setPriceRange([lo, hi]);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const toggleCat = (c: string) => setCats(v => v.includes(c) ? v.filter(x => x !== c) : [...v, c]);
  const togglePkg = (p: string) => setPkgs(v => v.includes(p) ? v.filter(x => x !== p) : [...v, p]);

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
        (p.name ?? "").toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) || (p.packaging ?? "").toLowerCase().includes(q)
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

  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    CATEGORIES.forEach(c => { m[c] = products.filter(p => p.category === c).length; });
    return m;
  }, [products]);

  const pkgCounts = useMemo(() => {
    const m: Record<string, number> = {};
    PKG_TYPES.forEach(pk => { m[pk] = products.filter(p => (p.packaging ?? "").toLowerCase().includes(pk.toLowerCase())).length; });
    return m;
  }, [products]);

  const filterCount = cats.length + pkgs.length + (rxOnly?1:0) + (newOnly?1:0) + (inStock?1:0)
    + (priceRange[0] !== gRange[0] || priceRange[1] !== gRange[1] ? 1 : 0) + (search.trim() ? 1 : 0);

  function clearAll() {
    setCats([]); setPkgs([]); setRxOnly(false); setNewOnly(false);
    setInStock(false); setPriceRange(gRange); setSearch(""); setSort("newest");
  }

  const priceLoFrac = gRange[1] === gRange[0] ? 0   : ((priceRange[0] - gRange[0]) / (gRange[1] - gRange[0])) * 100;
  const priceHiFrac = gRange[1] === gRange[0] ? 100 : ((priceRange[1] - gRange[0]) / (gRange[1] - gRange[0])) * 100;

  // ─── Sidebar ──────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <nav style={{ fontFamily:"var(--font-geist-sans)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 18px 13px", borderBottom:`1px solid ${T.border}` }}>
        <span style={{ display:"flex", alignItems:"center", gap:7, fontSize:"0.68rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:T.muted }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filters
          {filterCount > 0 && <span style={{ background:T.primary, color:"#fff", borderRadius:100, padding:"1px 7px", fontSize:"0.58rem" }}>{filterCount}</span>}
        </span>
        {filterCount > 0 && <button onClick={clearAll} style={{ fontSize:"0.7rem", color:T.accent, fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Clear all</button>}
      </div>

      <div style={{ padding:"12px 18px", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ position:"relative" }}>
          <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:T.mutedLight, pointerEvents:"none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input ref={searchRef} type="text" placeholder="Search products, SKU…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:"100%", padding:"8px 28px 8px 28px", borderRadius:8, border:`1.5px solid ${T.border}`, fontSize:"0.78rem", color:T.primary, background:T.bg, fontFamily:"inherit", outline:"none" }}
            onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = "0 0 0 3px rgba(91,163,196,0.12)"; }}
            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
          />
          {search && <button onClick={() => setSearch("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", width:16, height:16, borderRadius:"50%", border:"none", background:T.bgDeep, color:T.muted, fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>}
        </div>
      </div>

      <FilterSection title="Category" badge={cats.length}>
        {CATEGORIES.map(c => <Checkbox key={c} label={c} checked={cats.includes(c)} onChange={() => toggleCat(c)} count={catCounts[c] ?? 0} />)}
      </FilterSection>

      <FilterSection title="Price Range (₹)" badge={priceRange[0] !== gRange[0] || priceRange[1] !== gRange[1] ? 1 : 0}>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {(["Min","Max"] as const).map((label, idx) => (
            <div key={label} style={{ flex:1 }}>
              <div style={{ fontSize:"0.58rem", color:T.mutedLight, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:700, marginBottom:4 }}>{label}</div>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", fontSize:"0.75rem", color:T.muted, fontWeight:600, pointerEvents:"none" }}>₹</span>
                <input type="number" min={gRange[0]} max={gRange[1]} value={priceRange[idx]}
                  onChange={e => { const v = Number(e.target.value); idx === 0 ? setPriceRange([Math.min(v, priceRange[1]), priceRange[1]]) : setPriceRange([priceRange[0], Math.max(v, priceRange[0])]); }}
                  style={{ width:"100%", padding:"7px 6px 7px 20px", borderRadius:7, border:`1.5px solid ${T.border}`, fontSize:"0.78rem", fontWeight:600, color:T.primary, background:T.bg, fontFamily:"inherit", outline:"none" }}
                />
              </div>
            </div>
          ))}
        </div>
        <div style={{ position:"relative", height:4, background:T.border, borderRadius:99, margin:"4px 0 8px" }}>
          <div style={{ position:"absolute", left:`${priceLoFrac}%`, right:`${100-priceHiFrac}%`, height:"100%", background:T.accent, borderRadius:99 }} />
          <input type="range" min={gRange[0]} max={gRange[1]} value={priceRange[0]} onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])} style={{ position:"absolute", width:"100%", height:"100%", opacity:0, cursor:"pointer", top:0, left:0, zIndex:1 }} />
          <input type="range" min={gRange[0]} max={gRange[1]} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])} style={{ position:"absolute", width:"100%", height:"100%", opacity:0, cursor:"pointer", top:0, left:0, zIndex:2 }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.65rem", color:T.mutedLight }}>
          <span>₹{gRange[0].toLocaleString("en-IN")}</span><span>₹{gRange[1].toLocaleString("en-IN")}</span>
        </div>
      </FilterSection>

      <FilterSection title="Product Type" badge={[rxOnly,newOnly,inStock].filter(Boolean).length}>
        <Checkbox label="Prescription Required (Rx)" checked={rxOnly} onChange={() => setRxOnly(v => !v)} />
        <Checkbox label="New Arrivals (last 30 days)"  checked={newOnly} onChange={() => setNewOnly(v => !v)} />
        <Checkbox label="In Stock Only"                checked={inStock} onChange={() => setInStock(v => !v)} />
      </FilterSection>

      <FilterSection title="Packaging" badge={pkgs.length} open={false}>
        {PKG_TYPES.filter(pk => (pkgCounts[pk] ?? 0) > 0).length > 0
          ? PKG_TYPES.filter(pk => (pkgCounts[pk] ?? 0) > 0).map(pk => (
              <Checkbox key={pk} label={pk} checked={pkgs.includes(pk)} onChange={() => togglePkg(pk)} count={pkgCounts[pk]} icon={<PackagingIcon type={pk} size={13} />} />
            ))
          : <p style={{ fontSize:"0.75rem", color:T.mutedLight, fontStyle:"italic", margin:0 }}>No packaging data.</p>
        }
      </FilterSection>

      <FilterSection title="Sort By" open={false}>
        {SORT_OPTIONS.map(o => <Radio key={o.value} label={o.label} checked={sort === o.value} onChange={() => setSort(o.value)} />)}
      </FilterSection>
      <div style={{ height:20 }} />
    </nav>
  );

  return (
    <main style={{ background:T.bgAlt, minHeight:"100vh", fontFamily:"var(--font-geist-sans)" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .ph{background:linear-gradient(135deg,#0F2430 0%,#1A3A4A 55%,#0E2838 100%);padding:56px 5vw 44px;position:relative;overflow:hidden;}
        .ph::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 60% 90% at 80% 50%,rgba(91,163,196,0.18) 0%,transparent 65%),radial-gradient(ellipse 40% 60% at 5% 90%,rgba(52,211,153,0.10) 0%,transparent 60%);pointer-events:none;}
        .ph-ring{position:absolute;border-radius:50%;border:1px solid rgba(91,163,196,0.09);pointer-events:none;}
        .ph-inner{max-width:1560px;margin:0 auto;position:relative;z-index:1;}
        .ph-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
        .ph-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(91,163,196,0.15);border:1px solid rgba(91,163,196,0.3);border-radius:100px;padding:4px 12px;font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.18em;color:#5BA3C4;}
        .ph-title{font-size:clamp(1.9rem,3.2vw,3rem);font-weight:800;color:#fff;letter-spacing:-0.04em;line-height:1.05;margin-bottom:10px;}
        .ph-title span{color:#5BA3C4;}
        .ph-sub{font-size:0.85rem;color:rgba(255,255,255,0.55);max-width:440px;line-height:1.7;}

        .cl{max-width:1560px;margin:0 auto;padding:28px 5vw 80px;display:grid;grid-template-columns:260px 1fr;gap:22px;align-items:start;}
        @media(max-width:960px){.cl{grid-template-columns:1fr;}.sidebar-d{display:none!important;}}
        @media(min-width:961px){.mob-bar{display:none!important;}.drawer-wrap{display:none!important;}}

        .sidebar-d{position:sticky;top:90px;background:${T.bg};border:1px solid ${T.border};border-radius:14px;overflow:hidden;max-height:calc(100vh - 110px);overflow-y:auto;scrollbar-width:thin;scrollbar-color:${T.border} transparent;box-shadow:0 2px 12px rgba(26,46,56,0.04);}
        .sidebar-d::-webkit-scrollbar{width:3px;}.sidebar-d::-webkit-scrollbar-thumb{background:${T.border};border-radius:99px;}

        .mob-bar{display:flex;align-items:center;gap:10px;padding:10px 5vw;background:${T.bg};border-bottom:1px solid ${T.border};position:sticky;top:70px;z-index:50;}
        .mob-filter-btn{display:flex;align-items:center;gap:7px;padding:7px 13px;border-radius:8px;border:1.5px solid ${T.border};background:${T.bg};font-size:0.78rem;font-weight:600;color:${T.primary};cursor:pointer;font-family:inherit;}

        .drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;backdrop-filter:blur(3px);}
        .drawer{position:fixed;left:0;top:0;bottom:0;width:min(310px,90vw);background:${T.bg};z-index:101;overflow-y:auto;box-shadow:8px 0 48px rgba(0,0,0,0.18);}
        .drawer-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid ${T.border};position:sticky;top:0;background:${T.bg};z-index:1;}
        .drawer-close{width:28px;height:28px;border-radius:7px;border:1.5px solid ${T.border};background:${T.bgAlt};cursor:pointer;display:flex;align-items:center;justify-content:center;color:${T.muted};font-size:12px;}

        .toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap;padding:10px 14px;border:1px solid ${T.border};border-radius:12px;background:${T.bg};box-shadow:0 1px 6px rgba(26,46,56,0.04);}
        .tb-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:1;}
        .result-ct{font-size:0.8rem;color:${T.muted};font-weight:500;white-space:nowrap;}
        .result-ct strong{color:${T.primary};font-weight:700;}
        .chips{display:flex;gap:5px;flex-wrap:wrap;}
        .chip{display:flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;background:${T.bgAlt};border:1px solid ${T.border};font-size:0.68rem;font-weight:600;color:${T.secondary};cursor:pointer;transition:all 0.15s;}
        .chip:hover{background:${T.rxBg};border-color:${T.rxBorder};color:${T.rx};}
        .tb-right{display:flex;align-items:center;gap:8px;}
        .sort-select{border:1.5px solid ${T.border};background:${T.bg};border-radius:8px;height:32px;padding:0 10px;font-size:0.74rem;font-weight:600;color:${T.primary};font-family:inherit;outline:none;}
        .sort-select:focus{border-color:${T.accent};box-shadow:0 0 0 3px rgba(91,163,196,0.12);}
        .view-tog{display:flex;border:1.5px solid ${T.border};border-radius:8px;overflow:hidden;}
        .vb{padding:5px 8px;border:none;background:transparent;color:${T.mutedLight};cursor:pointer;display:flex;align-items:center;transition:all 0.15s;}
        .vb:first-child{border-right:1.5px solid ${T.border};}
        .vb.on{background:${T.primary};color:#fff;}

        .pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;}

        /* ─── Card ─── */
        .pcard{display:flex;flex-direction:column;background:${T.bg};border:1px solid ${T.border};border-radius:16px;overflow:hidden;text-decoration:none;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);box-shadow:0 1px 4px rgba(26,46,56,0.06),0 4px 16px rgba(26,46,56,0.03);position:relative;}
        .pcard::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${T.accent},#3A7FA0);opacity:0;transition:opacity 0.3s;z-index:3;}
        .pcard:hover{transform:translateY(-5px);box-shadow:0 14px 44px rgba(26,46,56,0.12),0 2px 8px rgba(26,46,56,0.05);border-color:rgba(91,163,196,0.38);}
        .pcard:hover::before{opacity:1;}

        .pcard-img{position:relative;width:100%;background:linear-gradient(145deg,#F0F5F8,#E8EFF4);border-bottom:1px solid ${T.border};overflow:hidden;}
        .pcard-img img{transition:transform 0.4s ease;}
        .pcard:hover .pcard-img img{transform:scale(1.03);}

        .pcard-placeholder{width:100%;aspect-ratio:4/3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;}
        .pcard-placeholder-label{font-size:0.58rem;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;opacity:0.45;}

        .badges{position:absolute;top:10px;left:10px;display:flex;flex-direction:column;gap:4px;z-index:2;}
        .badge{padding:2px 7px;border-radius:5px;font-size:0.54rem;font-weight:800;letter-spacing:0.1em;border-width:1px;border-style:solid;width:fit-content;text-transform:uppercase;backdrop-filter:blur(6px);}
        .b-rx{background:rgba(254,242,242,0.95);color:${T.rx};border-color:${T.rxBorder};}
        .b-new{background:rgba(239,246,255,0.95);color:${T.new};border-color:${T.newBorder};}
        .b-stk{background:rgba(240,253,244,0.95);color:#15803D;border-color:#86EFAC;}
        .b-oos{background:rgba(254,242,242,0.95);color:${T.rx};border-color:${T.rxBorder};}

        .pcard-body{padding:16px 18px 18px;flex:1;display:flex;flex-direction:column;}
        .pc-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
        .pc-sku-tag{font-family:"SF Mono","Fira Code","Fira Mono",monospace;font-size:0.59rem;color:${T.mutedLight};background:${T.bgDeep};padding:2px 7px;border-radius:4px;border:1px solid ${T.border};font-weight:600;letter-spacing:0.04em;}
        .pc-stock-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
        .pc-name{font-size:1rem;font-weight:700;color:${T.primary};line-height:1.3;letter-spacing:-0.02em;margin-bottom:5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .pc-composition{font-size:0.7rem;color:${T.muted};line-height:1.4;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:4px;}
        .pc-pack-pill{display:inline-flex;align-items:center;gap:5px;background:${T.bgAlt};border:1px solid ${T.border};border-radius:100px;padding:3px 10px;font-size:0.62rem;font-weight:600;color:${T.secondary};width:fit-content;margin-top:6px;}
        .pc-divider{height:1px;background:${T.border};margin:12px 0;}
        .pc-foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8px;}
        .pc-price{font-size:1.15rem;font-weight:800;color:${T.primary};letter-spacing:-0.03em;line-height:1;font-variant-numeric:tabular-nums;}
        .pc-price-na{font-size:0.85rem;font-weight:500;color:${T.mutedLight};font-style:italic;}
        .pc-cta{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;background:${T.primary};color:#fff;font-size:0.7rem;font-weight:700;letter-spacing:0.03em;transition:all 0.22s;white-space:nowrap;text-transform:uppercase;}
        .pcard:hover .pc-cta{background:${T.accent};gap:10px;}

        .plist{display:flex;flex-direction:column;gap:10px;}
        .pli{display:flex;align-items:stretch;background:${T.bg};border:1px solid ${T.border};border-radius:12px;overflow:hidden;text-decoration:none;transition:all 0.22s ease;box-shadow:0 1px 4px rgba(26,46,56,0.04);}
        .pli:hover{border-color:rgba(91,163,196,0.45);box-shadow:0 4px 16px rgba(26,46,56,0.08);transform:translateX(3px);}
        .pli-indicator{width:3px;background:linear-gradient(180deg,${T.accent},#3A7FA0);flex-shrink:0;}
        .pli-thumb{width:110px;min-width:110px;display:flex;align-items:center;justify-content:center;border-right:1px solid ${T.border};overflow:hidden;background:${T.bgAlt};}
        .pli-body{flex:1;padding:12px 16px;display:flex;flex-direction:column;justify-content:center;min-width:0;}
        .pli-meta{display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap;}
        .pli-cat{font-size:0.58rem;color:${T.accent};font-weight:800;text-transform:uppercase;letter-spacing:0.1em;}
        .pli-name{font-size:0.88rem;font-weight:700;color:${T.primary};margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .pli-sku{font-family:"SF Mono","Fira Code",monospace;font-size:0.6rem;color:${T.mutedLight};display:flex;align-items:center;gap:4px;}
        .pli-right{padding:12px 16px;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:6px;flex-shrink:0;}
        .pli-price{font-size:0.92rem;font-weight:800;color:${T.primary};font-variant-numeric:tabular-nums;}
        .pli-arr{color:${T.accent};display:flex;align-items:center;transition:transform 0.2s;}
        .pli:hover .pli-arr{transform:translateX(4px);}

        .empty{text-align:center;padding:5rem 2rem;}
        .empty-icon{font-size:3rem;margin-bottom:14px;filter:grayscale(1);opacity:0.25;}
        .empty-title{font-size:1.05rem;font-weight:800;color:${T.primary};margin-bottom:8px;}
        .empty-sub{font-size:0.8rem;color:${T.muted};max-width:280px;margin:0 auto 18px;line-height:1.65;}
        .empty-btn{padding:9px 22px;border-radius:8px;border:none;background:${T.primary};color:#fff;font-size:0.8rem;font-weight:700;cursor:pointer;font-family:inherit;}

        .skel{background:${T.bg};border-radius:14px;border:1px solid ${T.border};overflow:hidden;}
        .sk{background:${T.bgDeep};border-radius:4px;animation:sk 1.6s ease-in-out infinite;}
        @keyframes sk{0%,100%{opacity:1}50%{opacity:0.5}}

        @media(max-width:560px){.pgrid{grid-template-columns:repeat(2,1fr);gap:10px;}.pc-name{font-size:0.85rem;}.pc-price{font-size:1rem;}.pc-cta{padding:7px 10px;font-size:0.62rem;}}
      `}</style>

      {/* ─── Header — NO stats ─── */}
      <header className="ph">
        <div className="ph-ring" style={{ width:500, height:500, right:-130, top:-200 }} />
        <div className="ph-ring" style={{ width:240, height:240, right:90, top:30, borderColor:"rgba(91,163,196,0.07)" }} />
        <div className="ph-inner">
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <div className="ph-eyebrow">
              <div className="ph-pill">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Clinical Portfolio
              </div>
            </div>
            <h1 className="ph-title">Pharmaceutical<br /><span>Product Catalogue</span></h1>
            <p className="ph-sub">Precision-formulated therapeutics engineered for superior clinical outcomes. Trusted by healthcare professionals across India.</p>
          </motion.div>
        </div>
      </header>

      {/* ─── Mobile bar ─── */}
      <div className="mob-bar">
        <button className="mob-filter-btn" onClick={() => setDrawerOpen(true)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filters {filterCount > 0 && `(${filterCount})`}
        </button>
        <span style={{ flex:1, fontSize:"0.75rem", color:T.muted }}>{filtered.length} products</span>
        <div className="view-tog">
          <button className={`vb${view==="grid"?" on":""}`} onClick={() => setView("grid")}><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button>
          <button className={`vb${view==="list"?" on":""}`} onClick={() => setView("list")}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg></button>
        </div>
      </div>

      {/* ─── Mobile drawer ─── */}
      <div className="drawer-wrap">
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div className="drawer-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setDrawerOpen(false)} />
              <motion.div className="drawer" initial={{ x:"-100%" }} animate={{ x:0 }} exit={{ x:"-100%" }} transition={{ type:"spring", damping:28, stiffness:280 }}>
                <div className="drawer-head">
                  <span style={{ fontSize:"0.72rem", fontWeight:800, color:T.primary, textTransform:"uppercase", letterSpacing:"0.1em" }}>Filters</span>
                  <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
                </div>
                <Sidebar />
                <div style={{ padding:"0 18px 24px" }}>
                  <button onClick={() => setDrawerOpen(false)} style={{ width:"100%", padding:"11px", borderRadius:10, border:"none", background:T.primary, color:"#fff", fontSize:"0.82rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
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
              <p className="result-ct"><strong>{filtered.length}</strong> of <strong>{products.length}</strong> products</p>
              <div className="chips">
                {cats.map(c => <button key={c} className="chip" onClick={() => toggleCat(c)}>{c} <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>)}
                {rxOnly  && <button className="chip" onClick={() => setRxOnly(false)}>Rx Only <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
                {newOnly && <button className="chip" onClick={() => setNewOnly(false)}>New Arrivals <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
                {inStock && <button className="chip" onClick={() => setInStock(false)}>In Stock <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
                {pkgs.map(p => <button key={p} className="chip" onClick={() => togglePkg(p)}>{p} <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>)}
              </div>
            </div>
            <div className="tb-right">
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value as SortKey)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="view-tog">
                <button className={`vb${view==="grid"?" on":""}`} onClick={() => setView("grid")} title="Grid"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button>
                <button className={`vb${view==="list"?" on":""}`} onClick={() => setView("list")} title="List"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg></button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="pgrid">
              {Array.from({ length:9 }).map((_,i) => (
                <div key={i} className="skel">
                  <div style={{ aspectRatio:"4/3", background:T.bgDeep, animation:`sk 1.6s ${i*0.07}s ease-in-out infinite` }} />
                  <div style={{ padding:"1rem 1.1rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><div className="sk" style={{ height:7, width:"28%" }} /><div className="sk" style={{ height:7, width:"18%" }} /></div>
                    <div className="sk" style={{ height:14, width:"80%", marginBottom:6 }} />
                    <div className="sk" style={{ height:9, width:"55%", marginBottom:12 }} />
                    <div className="sk" style={{ height:1, width:"100%", marginBottom:12 }} />
                    <div style={{ display:"flex", justifyContent:"space-between" }}><div className="sk" style={{ height:18, width:"32%" }} /><div className="sk" style={{ height:18, width:"28%" }} /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔬</div>
              <h3 className="empty-title">{products.length === 0 ? "No products yet" : "No products found"}</h3>
              <p className="empty-sub">{products.length === 0 ? "Products added to the catalogue will appear here." : search ? `No results for "${search}".` : "No products match your filters."}</p>
              {filterCount > 0 && <button className="empty-btn" onClick={clearAll}>Clear all filters</button>}
            </div>
          ) : view === "grid" ? (
            <div className="pgrid">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => {
                  const inStockP = typeof p.stock === "number" ? p.stock > 0 : p.in_stock !== false;
                  const catMeta  = getCategoryMeta(p.category ?? "");
                  const price    = parsePrice(p.price);
                  return (
                    <motion.div key={p.id} layout initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.97 }} transition={{ delay:Math.min(i*0.03,0.22), duration:0.28, ease:[0.16,1,0.3,1] }}>
                      <Link href={`/products/${p.id}`} className="pcard">
                        <div className="pcard-img">
                          <div className="badges">
                            {p.prescription_required && <span className="badge b-rx">Rx</span>}
                            {isNew(p.created_at) && <span className="badge b-new">New</span>}
                            {inStockP ? <span className="badge b-stk">In Stock</span> : <span className="badge b-oos">Out of Stock</span>}
                          </div>
                          {p.image_id
                            ? <GlobalImage src={getImgUrl(p.image_id)} alt={p.name} mode="contain" aspectRatio="4/3" />
                            : <div className="pcard-placeholder" style={{ background:catMeta.bg, color:catMeta.fg }}><CategoryIcon category={p.category??""} /><span className="pcard-placeholder-label">{catMeta.label}</span></div>
                          }
                        </div>
                        <div className="pcard-body">
                          <div className="pc-meta">
                            <span className="pc-sku-tag">{p.sku||"—"}</span>
                            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.59rem", color:inStockP?"#15803D":T.rx, fontWeight:700 }}>
                              <span className="pc-stock-dot" style={{ background:inStockP?"#22C55E":T.rx }} />
                              {inStockP?"Available":"OOS"}
                            </span>
                          </div>
                          <h2 className="pc-name">{p.name}</h2>
                          {(p.composition||p.description) && <p className="pc-composition">{p.composition||p.description}</p>}
                          {(p.packaging||p.unit_measure) && (
                            <span className="pc-pack-pill">
                              <PackagingIcon type={p.packaging||p.unit_measure||""} size={12} />
                              {p.packaging||p.unit_measure}
                            </span>
                          )}
                          <div className="pc-divider" />
                          <div className="pc-foot">
                            {price ? <span className="pc-price">{formatINR(price)}</span> : <span className="pc-price-na">Price on request</span>}
                            <span className="pc-cta">Details <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="plist">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => {
                  const inStockP = typeof p.stock === "number" ? p.stock > 0 : p.in_stock !== false;
                  const price    = parsePrice(p.price);
                  return (
                    <motion.div key={p.id} layout initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:10 }} transition={{ delay:Math.min(i*0.022,0.18), duration:0.22 }}>
                      <Link href={`/products/${p.id}`} className="pli">
                        <div className="pli-indicator" />
                        <div className="pli-thumb">
                          {p.image_id
                            ? <GlobalImage src={getImgUrl(p.image_id)} alt={p.name} mode="contain" aspectRatio="1/1" />
                            : <div style={{ width:"100%", height:"100%", minHeight:90, display:"flex", alignItems:"center", justifyContent:"center", color:getCategoryMeta(p.category??"").fg, background:getCategoryMeta(p.category??"").bg }}><CategoryIcon category={p.category??""} /></div>
                          }
                        </div>
                        <div className="pli-body">
                          <div className="pli-meta">
                            <span className="pli-cat">{p.category}</span>
                            {p.prescription_required && <span className="badge b-rx">Rx</span>}
                            {isNew(p.created_at) && <span className="badge b-new">New</span>}
                            {!inStockP && <span className="badge b-oos">OOS</span>}
                          </div>
                          <p className="pli-name">{p.name}</p>
                          <span className="pli-sku">
                            {p.sku}
                            {(p.packaging||p.unit_measure) && <><span style={{ opacity:0.4 }}>·</span><PackagingIcon type={p.packaging||p.unit_measure||""} size={10} />{p.packaging||p.unit_measure}</>}
                          </span>
                          {(p.composition||p.description) && <p style={{ fontSize:"0.68rem", color:T.mutedLight, marginTop:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.composition||p.description}</p>}
                        </div>
                        <div className="pli-right">
                          <span className="pli-price">{price?formatINR(price):"—"}</span>
                          <span className="pli-arr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
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