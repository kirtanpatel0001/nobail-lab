"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../layout-client";
import { supabase } from "@/lib/supabase/server";
import { Product } from "@/types/product";
import { motion, AnimatePresence } from "framer-motion";
import GlobalImage from "@/components/GlobalImage";

// ─── Wizard steps ─────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: "Basic Info",     desc: "Name, SKU, Category, Status" },
  { id: 2, title: "Clinical",       desc: "Form, APIs, Composition" },
  { id: 3, title: "Packaging",      desc: "Pack size, Unit, Price, Stock" },
  { id: 4, title: "Content",        desc: "Descriptions, Benefits, Usage" },
  { id: 5, title: "Media",          desc: "Primary & gallery images" },
];

const CATEGORIES   = ["Ophthalmic", "Dermatology", "General Therapeutics"];
const DOSAGE_FORMS = ["Eye Drops", "Eye Ointment", "Topical Cream", "Topical Gel", "Lotion", "Tablet", "Film-Coated Tablet", "Capsule", "Syrup", "Injection", "Other"];
const PACK_TYPES   = ["Bottle", "Tube", "Vial", "Blister", "Box", "Sachet", "Ampoule", "Other"];

// ─── Helpers ──────────────────────────────────────────────────────────

// Safely gets the uncropped image URL, supporting both raw URLs and old Cloudinary IDs
function getImgUrl(val: string | null | undefined) {
  if (!val) return "";
  if (val.startsWith("http")) return val;
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${val}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string }> = {
    active:   { bg: "#F0FDF4", color: "#166534", dot: "#22C55E" },
    draft:    { bg: "#FFFBEB", color: "#92400E", dot: "#F59E0B" },
    inactive: { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8" },
  };
  const s = map[status] ?? map.inactive;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, border: `1px solid ${s.color}28`, fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function CatThumb({ cat }: { cat: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    Ophthalmic:             { bg: "#EFF8FF", fg: "#3A7FA0" },
    Dermatology:            { bg: "#FFF5F5", fg: "#C05252" },
    "General Therapeutics": { bg: "#F0FDF4", fg: "#2D8A5E" },
  };
  const s = map[cat] ?? map["General Therapeutics"];
  return (
    <div style={{ width: 44, height: 44, borderRadius: 8, background: s.bg, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", color: s.fg, flexShrink: 0 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
      </svg>
    </div>
  );
}

export default function ProductsPage() {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState<"all"|"active"|"inactive"|"draft">("all");

  const [showModal,    setShowModal]    = useState(false);
  const [editProduct,  setEditProduct]  = useState<Partial<Product>|null>(null);
  const [activeStep,   setActiveStep]   = useState(1);
  const [isUploading,  setIsUploading]  = useState(false);
  const [isSaving,     setIsSaving]     = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setIsLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (!error && data) setProducts(data as Product[]);
    setIsLoading(false);
  }

  // ─── Image upload (FIXED to prevent cropping) ────────────
  async function uploadToCloudinary(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
    const data = await res.json();
    // Return full secure_url instead of public_id to bypass aggressive clipping logic
    return data.secure_url ?? null;
  }

  async function handleMainImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      if (url) setEditProduct(p => ({ ...p!, image_id: url }));
    } catch { alert("Failed to upload primary image."); }
    finally { setIsUploading(false); }
  }

  function removeMainImage() {
    setEditProduct(p => ({ ...p!, image_id: null }));
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) { 
        const url = await uploadToCloudinary(f); 
        if (url) urls.push(url); 
      }
      setEditProduct(p => ({ ...p!, gallery_images: [...(p?.gallery_images || []), ...urls] }));
    } catch { alert("Failed to upload gallery images."); }
    finally { setIsUploading(false); }
  }

  function removeGalleryImage(i: number) {
    setEditProduct(p => ({ ...p!, gallery_images: p?.gallery_images?.filter((_, idx) => idx !== i) }));
  }

  // ─── Validation ───────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!editProduct?.name?.trim())     e.name     = "Product name is required.";
    if (!editProduct?.sku?.trim())      e.sku      = "SKU is required.";
    if (!editProduct?.category)         e.category = "Category is required.";
    if (!editProduct?.price?.trim())    e.price    = "Price is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ─── Save ─────────────────────────────────────────────────
  async function saveProduct() {
    if (!validate()) { setActiveStep(1); return; }
    setIsSaving(true);

    const stockVal = editProduct?.stock ?? 0;
    const payload = {
      name:                  editProduct!.name!.trim(),
      category:              editProduct!.category || "Ophthalmic",
      sku:                   editProduct!.sku!.trim(),
      price:                 editProduct!.price || "",
      status:                editProduct!.status || "draft",
      stock:                 stockVal,
      in_stock:              stockVal > 0,
      image_id:              editProduct!.image_id || null,
      gallery_images:        editProduct!.gallery_images || [],
      short_description:     editProduct!.short_description || "",
      description:           editProduct!.description || "",
      benefits:              editProduct!.benefits || "",
      usage_instructions:    editProduct!.usage_instructions || "",
      composition:           editProduct!.composition || "",
      dosage_form:           editProduct!.dosage_form || "",
      packaging:             editProduct!.packaging || "",
      unit_measure:          editProduct!.unit_measure || "",
      prescription_required: editProduct!.prescription_required || false,
    };

    if (editProduct!.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", editProduct!.id);
      if (!error) setProducts(p => p.map(x => x.id === editProduct!.id ? { ...x, ...payload } as Product : x));
      else alert("Error updating: " + error.message);
    } else {
      const { data, error } = await supabase.from("products").insert([payload]).select().single();
      if (!error && data) setProducts(p => [data as Product, ...p]);
      else alert("Error creating: " + error?.message);
    }

    setIsSaving(false);
    closeModal();
  }

  async function deleteProduct(id: number) {
    if (!confirm("Delete this product permanently?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) setProducts(p => p.filter(x => x.id !== id));
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q);
    return matchSearch && (filter === "all" || p.status === filter);
  });

  function openNew() {
    setEditProduct({ name: "", category: "Ophthalmic", sku: `NL-${Date.now().toString().slice(-6)}`, price: "", status: "draft", stock: 0, in_stock: false, prescription_required: false, gallery_images: [] });
    setActiveStep(1); setErrors({}); setShowModal(true);
  }
  function openEdit(p: Product) {
    setEditProduct({ ...p, gallery_images: p.gallery_images || [] });
    setActiveStep(1); setErrors({}); setShowModal(true);
  }
  function closeModal() { setShowModal(false); setTimeout(() => setEditProduct(null), 300); }

  // ─── Field helper ─────────────────────────────────────────
  const set = (k: keyof Product, v: any) => setEditProduct(p => ({ ...p!, [k]: v }));

  const inp = (field: string, extra?: React.CSSProperties): React.CSSProperties => ({
    width: "100%", padding: "0.72rem 1rem",
    borderRadius: 8, border: `1px solid ${errors[field] ? "#EF4444" : "var(--c-border)"}`,
    background: "var(--c-bg)", fontFamily: "inherit", fontSize: "0.88rem",
    outline: "none", transition: "0.2s", ...extra,
  });

  const counts = { all: products.length, active: products.filter(p => p.status==="active").length, draft: products.filter(p => p.status==="draft").length, inactive: products.filter(p => p.status==="inactive").length };

  return (
    <AdminLayout>
      <style>{`
        .pw { --c-bg:#FFFFFF; --c-surface:#F8FAFC; --c-border:#E2E8F0; --c-text:#0F172A; --c-muted:#64748B; --c-primary:#2C4A5C; --c-accent:#5BA3C4; font-family:var(--font-geist-sans),sans-serif; color:var(--c-text); }

        /* Header */
        .pt-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:1.75rem; }
        .pt-title { font-size:1.75rem; font-weight:800; letter-spacing:-0.03em; color:var(--c-text); margin:0; line-height:1; }
        .pt-sub { font-size:0.7rem; font-weight:700; color:var(--c-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px; }

        /* Buttons */
        .btn-add { background:var(--c-primary); color:#fff; border:none; border-radius:9px; padding:0.7rem 1.2rem; font-size:0.84rem; font-weight:700; cursor:pointer; box-shadow:0 4px 14px rgba(44,74,92,0.18); transition:0.2s; display:flex; align-items:center; gap:7px; letter-spacing:0.02em; }
        .btn-add:hover { background:#1A2E38; transform:translateY(-1px); }
        .btn-add:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .btn-ghost { background:transparent; border:1px solid var(--c-border); padding:0.65rem 1.2rem; border-radius:8px; font-weight:600; cursor:pointer; color:var(--c-text); font-size:0.84rem; transition:0.2s; font-family:inherit; }
        .btn-ghost:hover { background:var(--c-surface); border-color:#94A3B8; }

        /* Filters */
        .filters { display:flex; gap:12px; margin-bottom:1.5rem; flex-wrap:wrap; }
        .search-box { flex:1; min-width:220px; max-width:340px; position:relative; }
        .search-box svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--c-muted); pointer-events:none; }
        .search-box input { width:100%; padding:0.65rem 1rem 0.65rem 2.4rem; border-radius:8px; border:1px solid var(--c-border); background:var(--c-bg); font-size:0.86rem; outline:none; font-family:inherit; }
        .search-box input:focus { border-color:var(--c-accent); box-shadow:0 0 0 3px rgba(91,163,196,0.1); }
        .tab-group { display:flex; background:var(--c-surface); border:1px solid var(--c-border); border-radius:9px; padding:3px; }
        .tab-btn { background:transparent; border:none; padding:0.4rem 1rem; border-radius:7px; font-size:0.82rem; font-weight:500; color:var(--c-muted); cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.15s; font-family:inherit; white-space:nowrap; }
        .tab-btn.on { background:var(--c-bg); color:var(--c-primary); font-weight:700; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
        .tab-count { background:var(--c-border); color:var(--c-muted); font-size:0.65rem; font-weight:800; padding:1px 6px; border-radius:100px; }
        .tab-btn.on .tab-count { background:var(--c-accent); color:#fff; }

        /* Table */
        .table-card { background:var(--c-bg); border:1.5px solid var(--c-border); border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
        .table-card table { width:100%; border-collapse:collapse; text-align:left; }
        .table-card th { padding:0.85rem 1.25rem; font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.07em; color:var(--c-muted); border-bottom:1.5px solid var(--c-border); background:var(--c-surface); white-space:nowrap; }
        .table-card td { padding:0.9rem 1.25rem; border-bottom:1px solid var(--c-border); font-size:0.86rem; vertical-align:middle; }
        .table-card tr:last-child td { border-bottom:none; }
        .table-card tr:hover td { background:var(--c-surface); }
        .t-prod { display:flex; align-items:center; gap:12px; }
        .t-name { font-weight:700; color:var(--c-text); display:block; margin-bottom:2px; font-size:0.88rem; }
        .t-sku  { font-family:monospace; font-size:0.72rem; color:var(--c-muted); }
        .rx-tag { background:#FEF2F2; color:#991B1B; font-size:0.62rem; padding:2px 7px; border-radius:5px; font-weight:800; margin-left:6px; border:1px solid #FECACA; }
        .act-btn { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border-radius:7px; border:1px solid var(--c-border); background:var(--c-bg); cursor:pointer; color:var(--c-muted); transition:0.18s; }
        .act-btn:hover { border-color:var(--c-accent); color:var(--c-accent); }
        .act-btn.del:hover { border-color:#EF4444; color:#EF4444; background:#FEF2F2; }

        /* Empty state */
        .empty { text-align:center; padding:4rem 1rem; color:var(--c-muted); }
        .empty svg { margin:0 auto 1rem; opacity:0.3; display:block; }

        /* ── WIZARD MODAL ── */
        .wm-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.55); backdrop-filter:blur(5px); z-index:100; display:flex; align-items:center; justify-content:center; padding:1.5rem; }
        .wm-box { width:100%; max-width:980px; height:min(780px,90vh); background:var(--c-bg); border-radius:18px; display:flex; overflow:hidden; box-shadow:0 24px 56px rgba(0,0,0,0.22); }

        /* Sidebar */
        .wm-sidebar { width:260px; flex-shrink:0; background:#F0F5F8; border-right:1.5px solid var(--c-border); padding:1.75rem 1.5rem; display:flex; flex-direction:column; }
        .wm-sidebar-title { font-size:1.05rem; font-weight:800; color:var(--c-primary); letter-spacing:-0.02em; margin-bottom:0.25rem; }
        .wm-sidebar-sub { font-size:0.72rem; color:var(--c-muted); margin-bottom:1.75rem; }

        .step-item { display:flex; gap:12px; position:relative; padding-bottom:1.75rem; cursor:pointer; transition:0.18s; }
        .step-item:last-child { padding-bottom:0; }
        .step-item:not(:last-child)::after { content:''; position:absolute; left:13px; top:28px; bottom:4px; width:2px; background:var(--c-border); border-radius:2px; }
        .step-item.completed:not(:last-child)::after { background:var(--c-accent); }

        .step-dot { width:28px; height:28px; border-radius:50%; border:2px solid var(--c-border); background:var(--c-bg); display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; z-index:2; flex-shrink:0; transition:0.2s; color:var(--c-muted); }
        .step-item.active  .step-dot { border-color:var(--c-accent); background:var(--c-accent); color:#fff; box-shadow:0 0 0 4px rgba(91,163,196,0.2); }
        .step-item.completed .step-dot { border-color:var(--c-accent); background:var(--c-bg); color:var(--c-accent); }

        .step-lbl h4 { font-size:0.84rem; font-weight:700; margin:0 0 2px; color:var(--c-text); }
        .step-lbl p  { font-size:0.72rem; color:var(--c-muted); margin:0; }
        .step-item:not(.active):not(.completed) .step-lbl { opacity:0.55; }

        /* Content area */
        .wm-content { flex:1; display:flex; flex-direction:column; min-width:0; }
        .wm-step-header { padding:1.5rem 2rem 0; border-bottom:1.5px solid var(--c-border); padding-bottom:1rem; }
        .wm-step-title { font-size:1.1rem; font-weight:800; color:var(--c-text); margin:0 0 3px; letter-spacing:-0.02em; }
        .wm-step-desc  { font-size:0.78rem; color:var(--c-muted); margin:0; }
        .wm-body { flex:1; padding:1.5rem 2rem; overflow-y:auto; }
        .wm-footer { padding:1rem 2rem; border-top:1.5px solid var(--c-border); display:flex; justify-content:space-between; align-items:center; background:#FAFCFD; gap:12px; }
        .wm-footer-info { font-size:0.72rem; color:var(--c-muted); }

        /* Form grid */
        .fg   { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
        .fc   { display:flex; flex-direction:column; gap:6px; }
        .fc.span2 { grid-column:span 2; }
        .fc label { font-size:0.76rem; font-weight:700; color:var(--c-text); letter-spacing:0.01em; }
        .fc .hint { font-size:0.68rem; color:var(--c-muted); margin-top:2px; }
        .fc .err  { font-size:0.7rem; color:#EF4444; margin-top:2px; }
        .fc input:focus, .fc select:focus, .fc textarea:focus { border-color:var(--c-accent); box-shadow:0 0 0 3px rgba(91,163,196,0.12); }
        textarea { resize:vertical; min-height:90px; font-family:inherit; }

        /* Toggle / checkbox row */
        .toggle-row { display:flex; align-items:center; gap:10px; padding:10px 14px; background:var(--c-surface); border:1.5px solid var(--c-border); border-radius:9px; cursor:pointer; transition:0.15s; }
        .toggle-row:hover { border-color:var(--c-accent); }
        .toggle-row input[type=checkbox] { width:17px; height:17px; accent-color:var(--c-accent); cursor:pointer; flex-shrink:0; }
        .toggle-row span { font-size:0.84rem; font-weight:600; color:var(--c-text); }
        .toggle-row small { font-size:0.72rem; color:var(--c-muted); }

        /* Media upload */
        .media-title { font-size:0.76rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:var(--c-muted); margin-bottom:10px; }
        .img-drop { border:2px dashed var(--c-border); border-radius:12px; padding:1.75rem; text-align:center; cursor:pointer; position:relative; background:var(--c-surface); transition:0.2s; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; min-height:110px; }
        .img-drop:hover { border-color:var(--c-accent); background:rgba(91,163,196,0.03); }
        .img-drop .file-hidden { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
        .img-drop svg { color:var(--c-muted); opacity:0.5; }
        .img-drop p { font-size:0.82rem; color:var(--c-muted); margin:0; }
        .img-drop small { font-size:0.7rem; color:var(--c-muted); opacity:0.7; }
        
        .img-preview-box { position: relative; width: 160px; border-radius: 10px; border: 1px solid var(--c-border); background: #fff; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
        .gallery-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:14px; margin-top:12px; }
        .gallery-item { position:relative; border-radius:10px; overflow:hidden; border:1px solid var(--c-border); background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
        
        .del-btn { position:absolute; top:6px; right:6px; background:#EF4444; color:#fff; border:none; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition:0.15s; z-index: 10;}
        .del-btn:hover { background:#DC2626; transform: scale(1.05); }
        
        .uploading-overlay { position:absolute; inset:0; background:rgba(255,255,255,0.85); display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:700; color:var(--c-primary); gap:8px; border-radius:10px; z-index: 5; }

        /* Section divider in form */
        .sect-div { grid-column:span 2; height:1px; background:var(--c-border); margin:4px 0; }
        .sect-head { grid-column:span 2; font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:var(--c-muted); padding-top:4px; }
      `}</style>

      <div className="pw">

        {/* ── Header ── */}
        <div className="pt-header">
          <div>
            <div className="pt-sub">Catalogue Management</div>
            <h1 className="pt-title">Pharmaceuticals</h1>
          </div>
          <button className="btn-add" onClick={openNew}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Formulation
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="filters">
          <div className="search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input placeholder="Search name, SKU, category…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tab-group">
            {(["all","active","draft","inactive"] as const).map(f => (
              <button key={f} className={`tab-btn${filter===f?" on":""}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
                <span className="tab-count">{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="table-card">
          {isLoading ? (
            <div className="empty">
              <div style={{ width:36,height:36,borderRadius:"50%",border:"3px solid #E2E8F0",borderTopColor:"#5BA3C4",animation:"spin 0.8s linear infinite",margin:"0 auto 12px" }} />
              <span style={{ fontSize:"0.82rem" }}>Loading products…</span>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <p style={{ fontSize:"0.9rem", fontWeight:600, margin:"0 0 4px" }}>No products found</p>
              <p style={{ fontSize:"0.8rem" }}>Try a different search or filter.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Formulation</th>
                  <th>Category</th>
                  <th>Dosage Form</th>
                  <th>Pack / Unit</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="t-prod">
                        {p.image_id ? (
                          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', border: "1px solid #E2E8F0", flexShrink: 0 }}>
                            <GlobalImage src={getImgUrl(p.image_id)} alt={p.name} mode="contain" aspectRatio="1/1" />
                          </div>
                        ) : (
                          <CatThumb cat={p.category} />
                        )}
                        <div>
                          <span className="t-name">
                            {p.name}
                            {p.prescription_required && <span className="rx-tag">Rx</span>}
                          </span>
                          <span className="t-sku">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:"0.82rem" }}>{p.category}</td>
                    <td style={{ fontSize:"0.82rem", color:"var(--c-muted)" }}>{p.dosage_form || "—"}</td>
                    <td>
                      <div style={{ fontWeight:600, fontSize:"0.84rem" }}>{p.packaging || "—"}</div>
                      <div style={{ fontSize:"0.72rem", color:"var(--c-muted)", fontFamily:"monospace" }}>{p.unit_measure || ""}</div>
                    </td>
                    <td style={{ fontWeight:700, fontSize:"0.9rem" }}>{p.price || "—"}</td>
                    <td>
                      {p.stock === 0
                        ? <span style={{ color:"#EF4444", fontWeight:700, fontSize:"0.8rem" }}>Out of Stock</span>
                        : <span style={{ color: p.stock < 50 ? "#D97706" : "#16A34A", fontWeight:700, fontSize:"0.84rem" }}>{p.stock}</span>
                      }
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <div style={{ display:"flex", gap:6 }}>
                        <button className="act-btn" onClick={() => openEdit(p)} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="act-btn del" onClick={() => deleteProduct(p.id!)} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6 M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            WIZARD MODAL
        ══════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showModal && editProduct && (
            <div className="wm-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
              <motion.div
                className="wm-box"
                initial={{ opacity:0, scale:0.97, y:12 }}
                animate={{ opacity:1, scale:1,    y:0 }}
                exit={{    opacity:0, scale:0.97, y:12 }}
                transition={{ duration:0.22 }}
              >
                {/* Sidebar */}
                <div className="wm-sidebar">
                  <div className="wm-sidebar-title">{editProduct.id ? "Edit Product" : "New Product"}</div>
                  <div className="wm-sidebar-sub">{editProduct.id ? `Editing: ${editProduct.sku}` : "Fill all steps before saving"}</div>

                  {STEPS.map(step => {
                    const isActive    = activeStep === step.id;
                    const isCompleted = activeStep >  step.id;
                    return (
                      <div key={step.id} className={`step-item${isActive?" active":""}${isCompleted?" completed":""}`} onClick={() => setActiveStep(step.id)}>
                        <div className="step-dot">{isCompleted ? "✓" : step.id}</div>
                        <div className="step-lbl"><h4>{step.title}</h4><p>{step.desc}</p></div>
                      </div>
                    );
                  })}

                  {/* Quick summary at bottom */}
                  {editProduct.name && (
                    <div style={{ marginTop:"auto", paddingTop:"1.5rem", borderTop:"1px solid var(--c-border)" }}>
                      <div style={{ fontSize:"0.65rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--c-muted)", marginBottom:6 }}>Current</div>
                      <div style={{ fontSize:"0.82rem", fontWeight:700, color:"var(--c-primary)", lineHeight:1.4 }}>{editProduct.name}</div>
                      {editProduct.sku && <div style={{ fontSize:"0.7rem", fontFamily:"monospace", color:"var(--c-muted)", marginTop:2 }}>{editProduct.sku}</div>}
                      {editProduct.price && <div style={{ fontSize:"0.82rem", fontWeight:700, color:"var(--c-text)", marginTop:4 }}>{editProduct.price}</div>}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="wm-content">
                  {/* Step header */}
                  <div className="wm-step-header">
                    <div className="wm-step-title">{STEPS[activeStep-1].title}</div>
                    <div className="wm-step-desc">{STEPS[activeStep-1].desc}</div>
                  </div>

                  <div className="wm-body">

                    {/* ── STEP 1: Basic Info ── */}
                    {activeStep === 1 && (
                      <motion.div key="s1" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.18}} className="fg">
                        <div className="fc span2">
                          <label>Product Name *</label>
                          <input style={inp("name")} value={editProduct.name||""} onChange={e=>set("name",e.target.value)} placeholder="e.g. Timolol Maleate 0.5% Eye Drops" />
                          {errors.name && <span className="err">{errors.name}</span>}
                        </div>
                        <div className="fc">
                          <label>SKU / Batch Code *</label>
                          <input style={inp("sku")} value={editProduct.sku||""} onChange={e=>set("sku",e.target.value)} placeholder="e.g. OPH-TIM-001" />
                          {errors.sku && <span className="err">{errors.sku}</span>}
                        </div>
                        <div className="fc">
                          <label>Therapeutic Category *</label>
                          <select style={inp("category")} value={editProduct.category||"Ophthalmic"} onChange={e=>set("category",e.target.value)}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="fc span2">
                          <label>Publish Status</label>
                          <select style={inp("status")} value={editProduct.status||"draft"} onChange={e=>set("status",e.target.value as Product["status"])}>
                            <option value="active">Active — visible on catalogue</option>
                            <option value="draft">Draft — hidden from catalogue</option>
                            <option value="inactive">Inactive — archived</option>
                          </select>
                          <span className="hint">Active products appear on the public product catalogue.</span>
                        </div>
                        <div className="fc span2">
                          <label className="toggle-row" style={{ cursor:"pointer" }}>
                            <input type="checkbox" checked={editProduct.prescription_required||false} onChange={e=>set("prescription_required",e.target.checked)} style={{ width:17,height:17,accentColor:"#DC2626" }} />
                            <div>
                              <span style={{ fontSize:"0.84rem", fontWeight:700, color:"#991B1B" }}>Prescription Required (Rx Only)</span>
                              <div style={{ fontSize:"0.72rem", color:"var(--c-muted)", marginTop:1 }}>Product will be tagged with an Rx badge on the catalogue.</div>
                            </div>
                          </label>
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 2: Clinical ── */}
                    {activeStep === 2 && (
                      <motion.div key="s2" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.18}} className="fg">
                        <div className="fc">
                          <label>Dosage Form</label>
                          <select style={inp("dosage_form")} value={editProduct.dosage_form||""} onChange={e=>set("dosage_form",e.target.value)}>
                            <option value="">Select form…</option>
                            {DOSAGE_FORMS.map(f=><option key={f}>{f}</option>)}
                          </select>
                        </div>
                        <div className="fc">
                          <label>Active Composition (APIs)</label>
                          <input style={inp("composition")} value={editProduct.composition||""} onChange={e=>set("composition",e.target.value)} placeholder="e.g. Timolol Maleate 0.5% w/v" />
                          <span className="hint">Full IUPAC / INN name and concentration.</span>
                        </div>

                        <div className="sect-div" />
                        <div className="sect-head">Additional Clinical Notes</div>

                        <div className="fc span2">
                          <label>Key Benefits (Clinical Highlights)</label>
                          <textarea style={{ ...inp("benefits"), minHeight:80 }} value={editProduct.benefits||""} onChange={e=>set("benefits",e.target.value)} placeholder="Bullet-style benefits shown in Clinical Benefits tab…" />
                        </div>
                        <div className="fc span2">
                          <label>Usage &amp; Administration Instructions</label>
                          <textarea style={{ ...inp("usage_instructions"), minHeight:80 }} value={editProduct.usage_instructions||""} onChange={e=>set("usage_instructions",e.target.value)} placeholder="Dosing schedule, administration route, frequency…" />
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 3: Packaging & Pricing ── */}
                    {activeStep === 3 && (
                      <motion.div key="s3" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.18}} className="fg">
                        <div className="fc">
                          <label>Packaging Type</label>
                          <select style={inp("packaging")} value={editProduct.packaging||""} onChange={e=>set("packaging",e.target.value)}>
                            <option value="">Select pack type…</option>
                            {PACK_TYPES.map(t=><option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="fc">
                          <label>Unit / Size Measure</label>
                          <input style={inp("unit_measure")} value={editProduct.unit_measure||""} onChange={e=>set("unit_measure",e.target.value)} placeholder="e.g. 5 mL, 30 g, 24 tabs, 2.5 mL" />
                          <span className="hint">Displayed next to price on product page.</span>
                        </div>
                        <div className="fc">
                          <label>Price (MRP) *</label>
                          <input style={inp("price")} value={editProduct.price||""} onChange={e=>set("price",e.target.value)} placeholder="e.g. $12.50 or ₹150.00" />
                          {errors.price && <span className="err">{errors.price}</span>}
                        </div>
                        <div className="fc">
                          <label>Stock Count</label>
                          <input type="number" min={0} style={inp("stock")} value={editProduct.stock??0} onChange={e=>{ const v=parseInt(e.target.value)||0; setEditProduct(p=>({...p!,stock:v,in_stock:v>0})); }} />
                          <span className="hint">Setting to 0 marks the product as out of stock.</span>
                        </div>

                        {/* in_stock visual status */}
                        <div className="fc span2">
                          <div style={{ padding:"12px 16px", background:(editProduct.stock??0)>0?"#F0FDF4":"#FEF2F2", borderRadius:10, border:`1px solid ${(editProduct.stock??0)>0?"#BBF7D0":"#FECACA"}`, display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:8,height:8,borderRadius:"50%",background:(editProduct.stock??0)>0?"#22C55E":"#EF4444",flexShrink:0 }}/>
                            <span style={{ fontSize:"0.82rem", fontWeight:700, color:(editProduct.stock??0)>0?"#166534":"#991B1B" }}>
                              {(editProduct.stock??0)>0 ? `In Stock — ${editProduct.stock} units available` : "Out of Stock — product will show as unavailable"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 4: Content / Copy ── */}
                    {activeStep === 4 && (
                      <motion.div key="s4" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.18}} className="fg">
                        <div className="fc span2">
                          <label>Short Description</label>
                          <input style={inp("short_description")} value={editProduct.short_description||""} onChange={e=>set("short_description",e.target.value)} placeholder="One-line summary shown on product cards and the Overview tab." />
                          <span className="hint">Keep under 140 characters for best display.</span>
                        </div>
                        <div className="fc span2">
                          <label>Full Pharmacological Description</label>
                          <textarea style={{ ...inp("description"), minHeight:110 }} value={editProduct.description||""} onChange={e=>set("description",e.target.value)} placeholder="Detailed mechanism of action, pharmacokinetics, indications…" />
                          <span className="hint">Shown in the Pharmacology tab on the product page.</span>
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 5: Media ── */}
                    {activeStep === 5 && (
                      <motion.div key="s5" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.18}}>

                        {/* Primary image */}
                        <div className="media-title">Primary Cover Image</div>
                        {editProduct.image_id ? (
                          <div className="img-preview-box" style={{ marginBottom:"1.5rem" }}>
                            <GlobalImage src={getImgUrl(editProduct.image_id)} alt="Primary Image" mode="contain" aspectRatio="3/4" />
                            <button type="button" className="del-btn" onClick={removeMainImage} title="Remove Primary Image">✕</button>
                            {isUploading && <div className="uploading-overlay"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:"spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>}
                          </div>
                        ) : (
                          <div className="img-drop" style={{ marginBottom:"1.5rem" }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <p>Click to upload primary image</p>
                            <small>PNG, JPG up to 5 MB</small>
                            {isUploading && <div className="uploading-overlay"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:"spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Uploading…</div>}
                            <input type="file" accept="image/*" className="file-hidden" onChange={handleMainImageUpload} disabled={isUploading} />
                          </div>
                        )}

                        {/* Gallery */}
                        <div className="media-title">Gallery Images (optional — up to 8)</div>
                        <div className="img-drop">
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          <p>Click to upload multiple images</p>
                          <small>Hold Ctrl / Cmd to select several at once</small>
                          {isUploading && <div className="uploading-overlay"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:"spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Uploading…</div>}
                          <input type="file" accept="image/*" multiple className="file-hidden" onChange={handleGalleryUpload} disabled={isUploading} />
                        </div>

                        {(editProduct.gallery_images?.length ?? 0) > 0 && (
                          <div className="gallery-grid">
                            {editProduct.gallery_images!.map((imgId, idx) => (
                              <div key={idx} className="gallery-item">
                                <GlobalImage src={getImgUrl(imgId)} alt={`Gallery ${idx+1}`} mode="contain" aspectRatio="3/4" />
                                <button type="button" className="del-btn" onClick={() => removeGalleryImage(idx)} title="Remove Gallery Image">✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                  </div>

                  {/* Footer */}
                  <div className="wm-footer">
                    <button className="btn-ghost" onClick={() => activeStep > 1 ? setActiveStep(s => s-1) : closeModal()}>
                      {activeStep > 1 ? "← Back" : "Cancel"}
                    </button>
                    <div className="wm-footer-info">
                      Step {activeStep} of {STEPS.length}
                    </div>
                    {activeStep < STEPS.length ? (
                      <button className="btn-add" onClick={() => setActiveStep(s => s+1)}>
                        Continue →
                      </button>
                    ) : (
                      <button className="btn-add" onClick={saveProduct} disabled={isSaving||isUploading}>
                        {isSaving
                          ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:"spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Saving…</>
                          : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Save Product</>
                        }
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}