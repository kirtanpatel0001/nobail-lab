"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../layout-client";
import { supabase } from "@/lib/supabase/server";
import { Post, Category, Author } from "@/types/blog";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, title: "Basic Info",    desc: "Title, Slug, Category & Author" },
  { id: 2, title: "Editor",        desc: "Markdown / HTML Article Body" },
  { id: 3, title: "Media",         desc: "Cover & Thumbnail Images" },
  { id: 4, title: "SEO & Publish", desc: "Meta tags & Status" },
];

const CAT_COLORS = [
  "#5BA3C4","#2C4A5C","#1A8A5E","#D4820A","#9B5DE5","#E84855","#3D7EC8","#6B8A99",
];

export default function BlogAdminPage() {
  const [posts,      setPosts]      = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors,    setAuthors]    = useState<Author[]>([]);

  const [isLoading,  setIsLoading]  = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState<"all"|"published"|"draft"|"archived">("all");

  // post modal
  const [showModal,  setShowModal]  = useState(false);
  const [editPost,   setEditPost]   = useState<Partial<Post> & { thumbnail_url?: string|null } | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [isUploading, setIsUploading] = useState<"cover"|"thumbnail"|false>(false);
  const [isSaving,   setIsSaving]   = useState(false);

  // inline author
  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  const [newAuthorName,  setNewAuthorName]  = useState("");

  // category manager
  const [showCatMgr,    setShowCatMgr]    = useState(false);
  const [newCatName,    setNewCatName]    = useState("");
  const [newCatSlug,    setNewCatSlug]    = useState("");
  const [newCatColor,   setNewCatColor]   = useState(CAT_COLORS[0]);
  const [isSavingCat,   setIsSavingCat]   = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string|null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setIsLoading(true);
    const [postsRes, catsRes, authorsRes] = await Promise.all([
      supabase.from("posts").select("*, category:categories(*), author:authors(*)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("authors").select("*").order("name"),
    ]);
    if (!postsRes.error  && postsRes.data)   setPosts(postsRes.data as Post[]);
    if (!catsRes.error   && catsRes.data)    setCategories(catsRes.data as Category[]);
    if (!authorsRes.error && authorsRes.data) setAuthors(authorsRes.data as Author[]);
    setIsLoading(false);
  }

  // ── category CRUD ──────────────────────────────────────────
  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    setIsSavingCat(true);
    const slug = newCatSlug.trim() || newCatName.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
    const { data, error } = await supabase.from("categories").insert([{ name: newCatName.trim(), slug, color: newCatColor }]).select().single();
    setIsSavingCat(false);
    if (!error && data) {
      setCategories(prev => [...prev, data as Category].sort((a,b) => a.name.localeCompare(b.name)));
      setNewCatName(""); setNewCatSlug(""); setNewCatColor(CAT_COLORS[0]);
    } else {
      alert("Failed to create category: " + error?.message);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Delete this category? Posts using it will have no category.")) return;
    setDeletingCatId(id);
    await supabase.from("posts").update({ category_id: null }).eq("category_id", id);
    const { error } = await supabase.from("categories").delete().eq("id", id);
    setDeletingCatId(null);
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id));
    } else {
      alert("Failed to delete: " + error.message);
    }
  }

  // ── author ────────────────────────────────────────────────
  async function handleCreateAuthor() {
    if (!newAuthorName.trim()) return;
    const { data, error } = await supabase.from("authors").insert([{ name: newAuthorName }]).select().single();
    if (!error && data) {
      setAuthors(prev => [...prev, data as Author]);
      setEditPost(p => ({ ...p!, author_id: data.id }));
      setIsAddingAuthor(false); setNewAuthorName("");
    } else {
      alert("Failed to create author: " + error?.message);
    }
  }

  // ── image upload ──────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, target: "cover"|"thumbnail") {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(target);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method:"POST", body:fd });
      const data = await res.json();
      if (data.secure_url) {
        if (target === "cover")     setEditPost(p => ({ ...p!, cover_url:     data.secure_url }));
        if (target === "thumbnail") setEditPost(p => ({ ...p!, thumbnail_url: data.secure_url }));
      } else {
        alert("Upload failed: " + (data.error?.message ?? "unknown"));
      }
    } catch { alert(`Failed to upload ${target} image.`); }
    finally   { setIsUploading(false); }
  }

  // ── save post ─────────────────────────────────────────────
  async function savePost() {
    if (!editPost?.title) return alert("Post title is required.");
    setIsSaving(true);
    const rawSlug  = editPost.slug || editPost.title;
    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");
    const payload = {
      title:            editPost.title,
      slug:             cleanSlug,
      excerpt:          editPost.excerpt          || null,
      content:          editPost.content          || "",
      cover_url:        editPost.cover_url        || null,
      thumbnail_url:    editPost.thumbnail_url    || null,
      status:           editPost.status           || "draft",
      featured:         editPost.featured         || false,
      read_time:        editPost.read_time        || 5,
      author_id:        editPost.author_id        || null,
      category_id:      editPost.category_id      || null,
      meta_title:       editPost.meta_title       || null,
      meta_description: editPost.meta_description || null,
      published_at: editPost.status === "published" && !editPost.published_at
        ? new Date().toISOString()
        : editPost.published_at,
    };
    let dbError;
    if (editPost.id) {
      const { error } = await supabase.from("posts").update(payload).eq("id", editPost.id);
      dbError = error;
    } else {
      const { error } = await supabase.from("posts").insert([payload]);
      dbError = error;
    }
    setIsSaving(false);
    if (dbError) { alert(`Database Error: ${dbError.message}`); return; }
    fetchData(); closeModal();
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    await supabase.from("post_tags").delete().eq("post_id", id);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) setPosts(p => p.filter(x => x.id !== id));
    else alert("Failed to delete: " + error.message);
  }

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  function openNew()      { setEditPost({ title:"", slug:"", content:"", status:"draft", featured:false, read_time:5 }); setActiveStep(1); setShowModal(true); }
  function openEdit(p: Post) { setEditPost({ ...p }); setActiveStep(1); setShowModal(true); }
  function closeModal()   { setShowModal(false); setIsAddingAuthor(false); setTimeout(() => setEditPost(null), 300); }
  function fmt(d: string|null) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }); }

  return (
    <AdminLayout>
      <style>{`
        .adm {
          --bg:#FFFFFF; --surf:#F8FAFC; --bdr:#E2E8F0; --bdr-f:#5BA3C4;
          --txt:#0F172A; --mut:#64748B; --pri:#2C4A5C; --acc:#5BA3C4;
          font-family: var(--font-geist-sans), sans-serif; color: var(--txt);
        }

        /* header */
        .adm-hdr { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:2rem; }
        .adm-title { font-size:1.8rem; font-weight:700; letter-spacing:-.03em; margin-bottom:.25rem; }
        .adm-sub { font-size:.8rem; color:var(--mut); text-transform:uppercase; letter-spacing:.08em; font-weight:600; }
        .hdr-btns { display:flex; gap:10px; }
        .btn-pri { background:var(--pri); color:#fff; border:none; border-radius:8px; padding:.7rem 1.2rem; font-size:.875rem; font-weight:600; cursor:pointer; transition:.2s; white-space:nowrap; }
        .btn-pri:hover { background:#1A2E38; transform:translateY(-1px); }
        .btn-sec { background:var(--bg); color:var(--pri); border:1px solid var(--bdr); border-radius:8px; padding:.7rem 1.2rem; font-size:.875rem; font-weight:600; cursor:pointer; transition:.2s; white-space:nowrap; }
        .btn-sec:hover { background:var(--surf); border-color:var(--acc); }

        /* filters */
        .filters { display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .srch { flex:1; max-width:360px; min-width:200px; position:relative; }
        .srch svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--mut); }
        .srch input { width:100%; padding:.65rem 1rem .65rem 2.5rem; border-radius:8px; border:1px solid var(--bdr); background:var(--bg); font-size:.9rem; outline:none; }
        .tabs { display:flex; background:var(--surf); border:1px solid var(--bdr); border-radius:8px; padding:4px; }
        .tab { background:transparent; border:none; padding:.4rem 1rem; border-radius:6px; font-size:.85rem; font-weight:500; color:var(--mut); cursor:pointer; text-transform:capitalize; }
        .tab.on { background:var(--bg); color:var(--pri); font-weight:600; box-shadow:0 1px 3px rgba(0,0,0,.05); }

        /* table */
        .t-card { background:var(--bg); border:1px solid var(--bdr); border-radius:12px; overflow:hidden; }
        table { width:100%; border-collapse:collapse; text-align:left; }
        th { padding:.9rem 1.5rem; font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--mut); border-bottom:1px solid var(--bdr); background:var(--surf); }
        td { padding:.9rem 1.5rem; border-bottom:1px solid var(--bdr); font-size:.875rem; vertical-align:middle; }
        tr:last-child td { border-bottom:none; }
        tr:hover td { background:var(--surf); }
        .t-prod { display:flex; align-items:center; gap:12px; }
        .t-img { width:64px; height:44px; border-radius:6px; border:1px solid var(--bdr); object-fit:cover; background:var(--surf); flex-shrink:0; }
        .t-name { font-weight:600; display:block; margin-bottom:2px; max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .t-slug { font-family:monospace; font-size:.72rem; color:var(--mut); }
        .feat-tag { background:#FEF9C3; color:#854D0E; font-size:.6rem; padding:2px 6px; border-radius:4px; font-weight:700; margin-left:8px; text-transform:uppercase; }
        .act-btn { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border-radius:6px; border:1px solid var(--bdr); background:var(--bg); cursor:pointer; color:var(--mut); margin-right:6px; transition:.2s; }
        .act-btn:hover { border-color:var(--acc); color:var(--acc); }
        .act-btn.del:hover { border-color:#EF4444; color:#EF4444; background:#FEF2F2; }
        .status-pill { display:inline-flex; align-items:center; gap:.35rem; font-size:.7rem; font-weight:600; padding:.22rem .65rem; border-radius:100px; border:1px solid; text-transform:capitalize; }
        .status-pill::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }
        .status-pill.published { background:rgba(30,138,94,.1); color:#1E8A5E; border-color:rgba(30,138,94,.2); }
        .status-pill.draft     { background:rgba(212,130,10,.1); color:#D4820A; border-color:rgba(212,130,10,.2); }
        .status-pill.archived  { background:rgba(100,116,139,.1); color:#64748B; border-color:rgba(100,116,139,.2); }
        .cat-chip { display:inline-block; font-size:.7rem; font-weight:600; padding:.2rem .65rem; border-radius:100px; border:1px solid; }

        /* ── CATEGORY MANAGER MODAL ── */
        .cm-overlay { position:fixed; inset:0; background:rgba(15,23,42,.55); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:center; justify-content:center; padding:2rem; }
        .cm-box { width:100%; max-width:560px; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 24px 48px rgba(0,0,0,.2); }
        .cm-head { padding:1.5rem 1.75rem; border-bottom:1px solid var(--bdr); display:flex; justify-content:space-between; align-items:center; }
        .cm-head h2 { font-size:1.1rem; font-weight:700; color:var(--txt); }
        .cm-close { width:32px; height:32px; border:none; background:var(--surf); border-radius:8px; cursor:pointer; font-size:1rem; color:var(--mut); display:flex; align-items:center; justify-content:center; }
        .cm-body { padding:1.5rem 1.75rem; max-height:60vh; overflow-y:auto; }
        .cm-add { display:flex; gap:8px; margin-bottom:1.5rem; flex-wrap:wrap; }
        .cm-add input { flex:1; min-width:120px; padding:.6rem .9rem; border-radius:8px; border:1px solid var(--bdr); font-size:.875rem; outline:none; }
        .cm-add input:focus { border-color:var(--acc); }
        .cm-colors { display:flex; gap:6px; align-items:center; }
        .cm-color-dot { width:22px; height:22px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition:.15s; flex-shrink:0; }
        .cm-color-dot.sel { border-color:#fff; box-shadow:0 0 0 3px currentColor; }
        .cat-list { display:flex; flex-direction:column; gap:8px; }
        .cat-row { display:flex; align-items:center; gap:10px; padding:.75rem 1rem; border:1px solid var(--bdr); border-radius:8px; background:var(--surf); }
        .cat-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        .cat-row-name { flex:1; font-weight:600; font-size:.875rem; }
        .cat-row-slug { font-size:.75rem; color:var(--mut); font-family:monospace; }
        .cat-del { width:28px; height:28px; border:none; background:transparent; border-radius:6px; cursor:pointer; color:var(--mut); display:flex; align-items:center; justify-content:center; transition:.2s; }
        .cat-del:hover { background:#FEF2F2; color:#EF4444; }

        /* ── WIZARD MODAL ── */
        .wm-overlay { position:fixed; inset:0; background:rgba(15,23,42,.6); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:center; justify-content:center; padding:2rem; }
        .wm-box { width:100%; max-width:1240px; height:88vh; background:var(--bg); border-radius:16px; display:flex; overflow:hidden; box-shadow:0 24px 48px rgba(0,0,0,.2); }
        .wm-side { width:260px; background:var(--surf); border-right:1px solid var(--bdr); padding:2rem; flex-shrink:0; }
        .wm-logo { font-size:1.15rem; font-weight:700; margin-bottom:2rem; color:var(--pri); letter-spacing:-.02em; }
        .step-item { display:flex; gap:12px; position:relative; padding-bottom:2.5rem; cursor:pointer; opacity:.5; transition:.2s; }
        .step-item.active,.step-item.done { opacity:1; }
        .step-item:last-child { padding-bottom:0; }
        .step-item:not(:last-child)::after { content:''; position:absolute; left:13px; top:32px; bottom:8px; width:2px; background:var(--bdr); }
        .step-item.done:not(:last-child)::after { background:var(--acc); }
        .step-circle { width:28px; height:28px; border-radius:50%; border:2px solid var(--bdr); background:var(--surf); display:flex; align-items:center; justify-content:center; font-size:.8rem; font-weight:700; z-index:2; transition:.2s; flex-shrink:0; }
        .step-item.active .step-circle { border-color:var(--acc); background:var(--acc); color:#fff; box-shadow:0 0 0 4px rgba(91,163,196,.2); }
        .step-item.done   .step-circle { border-color:var(--acc); background:var(--bg); color:var(--acc); }
        .step-text h4 { font-size:.9rem; font-weight:600; margin-bottom:2px; color:var(--txt); }
        .step-text p  { font-size:.72rem; color:var(--mut); line-height:1.4; }
        .wm-main { flex:1; display:flex; flex-direction:column; min-width:0; }
        .wm-body { flex:1; padding:2.5rem; overflow-y:auto; }
        .wm-foot { padding:1.25rem 2.5rem; border-top:1px solid var(--bdr); display:flex; justify-content:space-between; align-items:center; background:#FAFAFA; }

        /* form */
        .fg { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
        .fc { display:flex; flex-direction:column; gap:.5rem; }
        .fc.full { grid-column:span 2; }
        label { font-size:.8rem; font-weight:600; color:var(--txt); }
        input[type=text],input[type=number],input[type=email],select,textarea {
          width:100%; padding:.7rem 1rem; border-radius:8px; border:1px solid var(--bdr);
          background:var(--bg); font-family:inherit; font-size:.9rem; outline:none; transition:.2s;
        }
        input:focus,select:focus,textarea:focus { border-color:var(--acc); box-shadow:0 0 0 3px rgba(91,163,196,.12); }

        /* editor */
        .editor-wrap { border:1px solid var(--bdr); border-radius:8px; overflow:hidden; display:flex; flex-direction:column; min-height:440px; }
        .editor-bar { background:var(--surf); border-bottom:1px solid var(--bdr); padding:.5rem 1rem; display:flex; gap:1rem; font-size:.78rem; color:var(--mut); font-weight:600; flex-wrap:wrap; }
        .editor-ta { flex:1; border:none; border-radius:0; padding:1.5rem; font-family:'Courier New',monospace; font-size:.9rem; line-height:1.7; resize:none; background:#FAFAFA; min-height:400px; outline:none; }
        .editor-ta:focus { background:#fff; }

        /* image upload */
        .img-zone {
          position:relative; border:2px dashed var(--bdr); border-radius:12px;
          background:var(--surf); cursor:pointer; transition:.2s; overflow:hidden;
          display:flex; align-items:center; justify-content:center;
        }
        .img-zone:hover { border-color:var(--acc); background:rgba(91,163,196,.03); }
        .img-zone.cover-zone { min-height:240px; }
        .img-zone.thumb-zone { min-height:200px; }
        .img-zone img { width:100%; height:100%; object-fit:cover; display:block; }
        .img-zone.has-img { border-style:solid; border-color:var(--bdr); }
        .img-placeholder { display:flex; flex-direction:column; align-items:center; gap:10px; color:var(--mut); padding:2rem; text-align:center; }
        .img-placeholder svg { opacity:.4; }
        .img-placeholder span { font-size:.875rem; font-weight:500; }
        .img-placeholder small { font-size:.75rem; opacity:.6; }
        .file-hidden { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
        .img-uploading { position:absolute; inset:0; background:rgba(255,255,255,.85); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:.875rem; color:var(--pri); }
        .img-clear { position:absolute; top:8px; right:8px; width:28px; height:28px; border-radius:6px; background:rgba(0,0,0,.5); border:none; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:.9rem; z-index:2; }

        /* buttons */
        .btn-ghost { background:transparent; border:1px solid var(--bdr); padding:.65rem 1.25rem; border-radius:8px; font-weight:600; cursor:pointer; color:var(--txt); transition:.2s; font-family:inherit; font-size:.875rem; }
        .btn-ghost:hover { background:var(--surf); }
        .btn-add  { background:var(--pri); color:#fff; border:none; border-radius:8px; padding:.7rem 1.4rem; font-size:.875rem; font-weight:600; cursor:pointer; transition:.2s; font-family:inherit; }
        .btn-add:hover { background:#1A2E38; }
        .btn-add:disabled { opacity:.6; cursor:not-allowed; }
      `}</style>

      <div className="adm">

        {/* ── header ── */}
        <div className="adm-hdr">
          <div>
            <div className="adm-sub">Content</div>
            <h1 className="adm-title">Blog &amp; Research</h1>
          </div>
          <div className="hdr-btns">
            <button className="btn-sec" onClick={() => setShowCatMgr(true)}>
              ⊞ Manage Categories
            </button>
            <button className="btn-pri" onClick={openNew}>+ New Publication</button>
          </div>
        </div>

        {/* ── filters ── */}
        <div className="filters">
          <div className="srch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input placeholder="Search title or slug..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tabs">
            {(["all","published","draft","archived"] as const).map(f => (
              <button key={f} className={`tab ${filter===f?"on":""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        {/* ── table ── */}
        <div className="t-card">
          <table>
            <thead>
              <tr>
                <th>Post Details</th><th>Category</th><th>Author</th>
                <th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign:"center", padding:"3rem", color:"var(--mut)" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign:"center", padding:"3rem", color:"var(--mut)" }}>No posts found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="t-prod">
                      <img src={p.cover_url || p.thumbnail_url || "/placeholder.png"} alt="" className="t-img" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display="none"; }} />
                      <div>
                        <span className="t-name">{p.title} {p.featured && <span className="feat-tag">Featured</span>}</span>
                        <span className="t-slug">/{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {p.category
                      ? <span className="cat-chip" style={{ color:p.category.color, background:`${p.category.color}15`, borderColor:`${p.category.color}30` }}>{p.category.name}</span>
                      : <span style={{ color:"var(--mut)" }}>—</span>}
                  </td>
                  <td style={{ fontSize:".85rem" }}>{p.author?.name || "—"}</td>
                  <td><span className={`status-pill ${p.status}`}>{p.status}</span></td>
                  <td style={{ color:"var(--mut)", fontSize:".82rem" }}>{fmt(p.status==="published" ? p.published_at : p.created_at)}</td>
                  <td>
                    <button className="act-btn" onClick={() => openEdit(p)} title="Edit">✎</button>
                    <button className="act-btn del" onClick={() => deletePost(p.id)} title="Delete">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── CATEGORY MANAGER ── */}
        <AnimatePresence>
          {showCatMgr && (
            <div className="cm-overlay" onClick={e => { if (e.target===e.currentTarget) setShowCatMgr(false); }}>
              <motion.div initial={{ opacity:0, scale:.97, y:8 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:.97, y:8 }} transition={{ duration:.18 }} className="cm-box">
                <div className="cm-head">
                  <h2>Manage Categories</h2>
                  <button className="cm-close" onClick={() => setShowCatMgr(false)}>✕</button>
                </div>
                <div className="cm-body">
                  {/* add form */}
                  <div style={{ marginBottom:"1.25rem" }}>
                    <label style={{ display:"block", marginBottom:8 }}>Add New Category</label>
                    <div className="cm-add">
                      <input placeholder="Category name e.g. Research" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                      <input placeholder="Slug (optional)" value={newCatSlug} onChange={e => setNewCatSlug(e.target.value)} style={{ maxWidth:160 }} />
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}>
                      <div className="cm-colors">
                        <span style={{ fontSize:".75rem", color:"var(--mut)", marginRight:6 }}>Color:</span>
                        {CAT_COLORS.map(c => (
                          <div key={c} className={`cm-color-dot ${newCatColor===c?"sel":""}`} style={{ background:c, color:c }} onClick={() => setNewCatColor(c)} />
                        ))}
                      </div>
                      <button className="btn-add" style={{ padding:".5rem 1rem" }} onClick={handleAddCategory} disabled={isSavingCat || !newCatName.trim()}>
                        {isSavingCat ? "Adding…" : "+ Add"}
                      </button>
                    </div>
                  </div>

                  <div style={{ borderTop:"1px solid var(--bdr)", paddingTop:"1.25rem" }}>
                    <label style={{ display:"block", marginBottom:10 }}>Existing Categories ({categories.length})</label>
                    {categories.length === 0
                      ? <p style={{ color:"var(--mut)", fontSize:".875rem" }}>No categories yet. Add one above.</p>
                      : <div className="cat-list">
                          {categories.map(c => (
                            <div key={c.id} className="cat-row">
                              <div className="cat-dot" style={{ background:c.color }} />
                              <span className="cat-row-name">{c.name}</span>
                              <span className="cat-row-slug">{c.slug}</span>
                              <button className="cat-del" onClick={() => handleDeleteCategory(c.id)} disabled={deletingCatId===c.id}>
                                {deletingCatId===c.id ? "…" : "✕"}
                              </button>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── POST WIZARD ── */}
        <AnimatePresence>
          {showModal && editPost && (
            <div className="wm-overlay" onClick={e => { if (e.target===e.currentTarget) closeModal(); }}>
              <motion.div initial={{ opacity:0, scale:.98, y:10 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:.98, y:10 }} transition={{ duration:.2 }} className="wm-box">
                
                {/* sidebar */}
                <div className="wm-side">
                  <div className="wm-logo">{editPost.id ? "Edit Post" : "New Post"}</div>
                  {STEPS.map(step => {
                    const isActive    = activeStep === step.id;
                    const isCompleted = activeStep > step.id;
                    return (
                      <div key={step.id} className={`step-item ${isActive?"active":""} ${isCompleted?"done":""}`} onClick={() => setActiveStep(step.id)}>
                        <div className="step-circle">{isCompleted ? "✓" : step.id}</div>
                        <div className="step-text"><h4>{step.title}</h4><p>{step.desc}</p></div>
                      </div>
                    );
                  })}
                </div>

                {/* content */}
                <div className="wm-main">
                  <div className="wm-body">

                    {/* step 1 – basic info */}
                    {activeStep === 1 && (
                      <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} className="fg">
                        <div className="fc full">
                          <label>Post Title</label>
                          <input value={editPost.title||""} onChange={e => setEditPost(p => ({ ...p!, title:e.target.value }))} placeholder="e.g. Advancements in Ophthalmic Solutions" style={{ fontSize:"1.1rem", fontWeight:600 }} />
                        </div>
                        <div className="fc full">
                          <label>URL Slug <span style={{ fontWeight:400, color:"var(--mut)" }}>(Leave blank to auto-generate)</span></label>
                          <input value={editPost.slug||""} onChange={e => setEditPost(p => ({ ...p!, slug:e.target.value }))} placeholder="advancements-in-ophthalmic-solutions" />
                        </div>
                        <div className="fc">
                          <label>Category</label>
                          <div style={{ display:"flex", gap:8 }}>
                            <select style={{ flex:1 }} value={editPost.category_id||""} onChange={e => setEditPost(p => ({ ...p!, category_id:e.target.value }))}>
                              <option value="">Select category…</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button type="button" className="btn-ghost" style={{ padding:"0 10px", fontSize:".8rem" }} onClick={() => { closeModal(); setShowCatMgr(true); }} title="Manage categories">⊞</button>
                          </div>
                        </div>
                        <div className="fc">
                          <label>Author</label>
                          {!isAddingAuthor ? (
                            <div style={{ display:"flex", gap:8 }}>
                              <select style={{ flex:1 }} value={editPost.author_id||""} onChange={e => setEditPost(p => ({ ...p!, author_id:e.target.value }))}>
                                <option value="">Select author…</option>
                                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                              </select>
                              <button type="button" className="btn-ghost" style={{ padding:"0 10px" }} onClick={() => setIsAddingAuthor(true)}>+</button>
                            </div>
                          ) : (
                            <div style={{ display:"flex", gap:8 }}>
                              <input style={{ flex:1 }} placeholder="New author name…" value={newAuthorName} onChange={e => setNewAuthorName(e.target.value)} />
                              <button type="button" className="btn-add" style={{ padding:"0 14px" }} onClick={handleCreateAuthor}>Add</button>
                              <button type="button" className="btn-ghost" style={{ padding:"0 10px" }} onClick={() => setIsAddingAuthor(false)}>✕</button>
                            </div>
                          )}
                        </div>
                        <div className="fc full">
                          <label>Excerpt <span style={{ fontWeight:400, color:"var(--mut)" }}>(Short Summary)</span></label>
                          <textarea value={editPost.excerpt||""} onChange={e => setEditPost(p => ({ ...p!, excerpt:e.target.value }))} placeholder="Brief summary for the blog listing page…" style={{ minHeight:90 }} />
                        </div>
                      </motion.div>
                    )}

                    {/* step 2 – editor */}
                    {activeStep === 2 && (
                      <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} style={{ height:"100%" }}>
                        <div className="editor-wrap">
                          <div className="editor-bar">
                            <span>Markdown Supported</span>
                            <span># Heading 1</span><span>## Heading 2</span>
                            <span>**Bold**</span><span>*Italic*</span>
                            <span>[Link](url)</span><span>![Image](url)</span>
                          </div>
                          <textarea className="editor-ta" value={editPost.content||""} onChange={e => setEditPost(p => ({ ...p!, content:e.target.value }))} placeholder="Start writing your research article…" />
                        </div>
                      </motion.div>
                    )}

                    {/* step 3 – media */}
                    {activeStep === 3 && (
                      <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} style={{ display:"flex", flexDirection:"column", gap:"2rem" }}>
                        {/* cover */}
                        <div>
                          <label style={{ display:"block", marginBottom:10 }}>Primary Cover Image</label>
                          <div className={`img-zone cover-zone ${editPost.cover_url?"has-img":""}`}>
                            {editPost.cover_url ? (
                              <>
                                <img src={editPost.cover_url} alt="Cover" />
                                <button className="img-clear" onClick={() => setEditPost(p => ({ ...p!, cover_url:null }))} title="Remove">✕</button>
                              </>
                            ) : (
                              <div className="img-placeholder">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                <span>Click to upload Main Cover Image</span>
                                <small>Recommended: 1400×600px · JPG or PNG</small>
                              </div>
                            )}
                            {isUploading === "cover" && <div className="img-uploading">Uploading…</div>}
                            <input type="file" accept="image/*" className="file-hidden" onChange={e => handleImageUpload(e,"cover")} disabled={!!isUploading} />
                          </div>
                        </div>

                        {/* thumbnail */}
                        <div>
                          <label style={{ display:"block", marginBottom:10 }}>
                            Secondary / Content Thumbnail&nbsp;
                            <span style={{ fontWeight:400, color:"var(--mut)" }}>*Optional — injected mid-article</span>
                          </label>
                          <div className={`img-zone thumb-zone ${editPost.thumbnail_url?"has-img":""}`}>
                            {editPost.thumbnail_url ? (
                              <>
                                <img src={editPost.thumbnail_url} alt="Thumbnail" />
                                <button className="img-clear" onClick={() => setEditPost(p => ({ ...p!, thumbnail_url:null }))} title="Remove">✕</button>
                              </>
                            ) : (
                              <div className="img-placeholder">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                <span>Click to upload Secondary Thumbnail</span>
                                <small>Recommended: 900×600px · JPG or PNG</small>
                              </div>
                            )}
                            {isUploading === "thumbnail" && <div className="img-uploading">Uploading…</div>}
                            <input type="file" accept="image/*" className="file-hidden" onChange={e => handleImageUpload(e,"thumbnail")} disabled={!!isUploading} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* step 4 – seo & publish */}
                    {activeStep === 4 && (
                      <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} className="fg">
                        <div className="fc full">
                          <label>Meta Title (SEO)</label>
                          <input value={editPost.meta_title||""} onChange={e => setEditPost(p => ({ ...p!, meta_title:e.target.value }))} placeholder="Optimized title for search engines" />
                        </div>
                        <div className="fc full">
                          <label>Meta Description (SEO)</label>
                          <textarea value={editPost.meta_description||""} onChange={e => setEditPost(p => ({ ...p!, meta_description:e.target.value }))} placeholder="Optimized description for search engines" style={{ minHeight:80 }} />
                        </div>
                        <div className="fc">
                          <label>Publish Status</label>
                          <select value={editPost.status||"draft"} onChange={e => setEditPost(p => ({ ...p!, status:e.target.value as Post["status"] }))}>
                            <option value="draft">Draft (Hidden)</option>
                            <option value="published">Published (Live)</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                        <div className="fc">
                          <label>Read Time (Minutes)</label>
                          <input type="number" value={editPost.read_time||5} onChange={e => setEditPost(p => ({ ...p!, read_time:parseInt(e.target.value)||5 }))} min={1} />
                        </div>
                        <div className="fc full" style={{ flexDirection:"row", alignItems:"center", gap:10, paddingTop:4 }}>
                          <input type="checkbox" style={{ width:18, height:18, cursor:"pointer" }} checked={editPost.featured||false} onChange={e => setEditPost(p => ({ ...p!, featured:e.target.checked }))} id="feat" />
                          <label htmlFor="feat" style={{ margin:0, cursor:"pointer" }}>Mark as Featured Article</label>
                        </div>
                      </motion.div>
                    )}

                  </div>

                  {/* footer nav */}
                  <div className="wm-foot">
                    <button className="btn-ghost" onClick={() => activeStep > 1 ? setActiveStep(s => s-1) : closeModal()}>
                      {activeStep > 1 ? "← Back" : "Cancel"}
                    </button>
                    {activeStep < 4 ? (
                      <button className="btn-add" onClick={() => setActiveStep(s => s+1)}>
                        Continue to {STEPS[activeStep].title} →
                      </button>
                    ) : (
                      <button className="btn-add" onClick={savePost} disabled={isSaving || !!isUploading}>
                        {isSaving ? "Saving…" : editPost.id ? "Save Changes" : "Publish Post"}
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