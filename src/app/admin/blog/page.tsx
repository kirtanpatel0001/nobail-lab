"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../layout-client";
import { supabase } from "@/lib/supabase/server"; 
import { Post, Category, Author } from "@/types/blog";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, title: "Basic Info", desc: "Title, Slug, Category & Author" },
  { id: 2, title: "Editor", desc: "Markdown / HTML Article Body" },
  { id: 3, title: "Media", desc: "Cover & Thumbnail Images" },
  { id: 4, title: "SEO & Publish", desc: "Meta tags & Status" }
];

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState<(Partial<Post> & { thumbnail_url?: string | null }) | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [isUploading, setIsUploading] = useState<"cover" | "thumbnail" | false>(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const [postsRes, catsRes, authorsRes] = await Promise.all([
      supabase.from("posts").select("*, category:categories(*), author:authors(*)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*"),
      supabase.from("authors").select("*")
    ]);

    if (!postsRes.error && postsRes.data) setPosts(postsRes.data as Post[]);
    if (!catsRes.error && catsRes.data) setCategories(catsRes.data as Category[]);
    if (!authorsRes.error && authorsRes.data) setAuthors(authorsRes.data as Author[]);
    setIsLoading(false);
  }

  async function handleCreateAuthor() {
    if (!newAuthorName.trim()) return;
    const { data, error } = await supabase.from("authors").insert([{ name: newAuthorName }]).select().single();
    if (!error && data) {
      setAuthors(prev => [...prev, data as Author]);
      setEditPost(p => ({ ...p!, author_id: data.id }));
      setIsAddingAuthor(false);
      setNewAuthorName("");
    } else {
      alert("Failed to create author. Check RLS policies.");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, target: "cover" | "thumbnail") {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(target);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST", body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        if (target === "cover") setEditPost(p => ({ ...p!, cover_url: data.secure_url }));
        if (target === "thumbnail") setEditPost(p => ({ ...p!, thumbnail_url: data.secure_url }));
      }
    } catch (err) {
      alert(`Failed to upload ${target} image.`);
    } finally {
      setIsUploading(false);
    }
  }

  async function savePost() {
    if (!editPost?.title) return alert("Post title is required.");
    setIsSaving(true);

    const rawSlug = editPost.slug || editPost.title;
    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const payload = {
      title: editPost.title,
      slug: cleanSlug,
      excerpt: editPost.excerpt || null,
      content: editPost.content || "",
      cover_url: editPost.cover_url || null,
      thumbnail_url: editPost.thumbnail_url || null,
      status: editPost.status || "draft",
      featured: editPost.featured || false,
      read_time: editPost.read_time || 5,
      author_id: editPost.author_id ? editPost.author_id : null,
      category_id: editPost.category_id ? editPost.category_id : null,
      meta_title: editPost.meta_title || null,
      meta_description: editPost.meta_description || null,
      published_at: editPost.status === 'published' && !editPost.published_at ? new Date().toISOString() : editPost.published_at,
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

    if (dbError) {
      console.error("Supabase Error:", dbError);
      alert(`Database Error: ${dbError.message}\n\nPlease check your Supabase RLS policies.`);
      return;
    }

    fetchData();
    closeModal();
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    
    await supabase.from("post_tags").delete().eq("post_id", id);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    
    if (!error) {
      setPosts(p => p.filter(x => x.id !== id));
    } else {
      alert("Failed to delete post: " + error.message);
    }
  }

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  function openNew() {
    setEditPost({ title: "", slug: "", content: "", status: "draft", featured: false, read_time: 5 });
    setActiveStep(1);
    setShowModal(true);
  }

  function openEdit(p: Post) {
    setEditPost({ ...p });
    setActiveStep(1);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setIsAddingAuthor(false);
    setTimeout(() => setEditPost(null), 300);
  }

  function fmt(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <AdminLayout>
      <style>{`
        .admin-wrapper {
          --c-bg: #FFFFFF; --c-surface: #F8FAFC; --c-border: #E2E8F0; --c-border-focus: #5BA3C4;
          --c-text: #0F172A; --c-muted: #64748B; --c-primary: #2C4A5C; --c-accent: #5BA3C4;
          font-family: var(--font-geist-sans), sans-serif; color: var(--c-text);
        }

        .pt-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .pt-title { font-size: 1.8rem; font-weight: 700; letter-spacing: -0.03em; color: var(--c-text); margin-bottom: 0.25rem; }
        .pt-sub { font-size: 0.85rem; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
        .btn-add { background: var(--c-primary); color: #fff; border: none; border-radius: 8px; padding: 0.75rem 1.25rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(44,74,92,0.15); transition: 0.2s; }
        .btn-add:hover { background: #1A2E38; transform: translateY(-1px); }

        .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .search-box { flex: 1; max-width: 360px; position: relative; min-width: 200px; }
        .search-box svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--c-muted); }
        .search-box input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.5rem; border-radius: 8px; border: 1px solid var(--c-border); background: var(--c-bg); font-size: 0.9rem; outline: none; }
        
        .tab-group { display: flex; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 8px; padding: 4px; }
        .tab-btn { background: transparent; border: none; padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 500; color: var(--c-muted); cursor: pointer; text-transform: capitalize; }
        .tab-btn.active { background: var(--c-bg); color: var(--c-primary); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

        .table-card { background: var(--c-bg); border: 1px solid var(--c-border); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--c-muted); border-bottom: 1px solid var(--c-border); background: var(--c-surface); }
        td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--c-border); font-size: 0.9rem; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: var(--c-surface); }
        
        .t-prod { display: flex; align-items: center; gap: 12px; }
        .t-img { width: 60px; height: 40px; border-radius: 6px; border: 1px solid var(--c-border); object-fit: contain; background: var(--c-surface); }
        .t-name { font-weight: 600; color: var(--c-text); display: block; margin-bottom: 2px; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .t-sku { font-family: monospace; font-size: 0.75rem; color: var(--c-muted); }
        .feat-tag { background: #FEF9C3; color: #854D0E; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 8px; text-transform: uppercase; }

        .act-btn { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid var(--c-border); background: var(--c-bg); cursor: pointer; color: var(--c-muted); margin-right: 6px; transition: 0.2s; }
        .act-btn:hover { border-color: var(--c-accent); color: var(--c-accent); }
        .act-btn.del:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }

        .status-pill { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; font-weight: 600; padding: 0.22rem 0.65rem; border-radius: 100px; border: 1px solid; text-transform: capitalize; }
        .status-pill::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .status-pill.published { background: rgba(30,138,94,0.1); color: #1E8A5E; border-color: rgba(30,138,94,0.2); }
        .status-pill.draft { background: rgba(212,130,10,0.1); color: #D4820A; border-color: rgba(212,130,10,0.2); }
        .status-pill.archived { background: rgba(100,116,139,0.1); color: #64748B; border-color: rgba(100,116,139,0.2); }

        .cat-chip { display: inline-block; font-size: 0.7rem; font-weight: 600; padding: 0.18rem 0.6rem; border-radius: 100px; border: 1px solid; }

        /* WIZARD MODAL */
        .wm-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .wm-box { width: 100%; max-width: 1300px; height: 85vh; background: var(--c-bg); border-radius: 16px; display: flex; overflow: hidden; box-shadow: 0 24px 48px rgba(0,0,0,0.2); }
        
        .wm-sidebar { width: 280px; background: var(--c-surface); border-right: 1px solid var(--c-border); padding: 2rem; flex-shrink: 0; }
        .wm-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 2rem; color: var(--c-primary); letter-spacing: -0.02em; }
        
        .step-item { display: flex; gap: 12px; position: relative; padding-bottom: 2.5rem; cursor: pointer; opacity: 0.5; transition: 0.2s; }
        .step-item.active, .step-item.completed { opacity: 1; }
        .step-item:last-child { padding-bottom: 0; }
        .step-item:not(:last-child)::after { content: ''; position: absolute; left: 13px; top: 32px; bottom: 8px; width: 2px; background: var(--c-border); }
        .step-item.completed:not(:last-child)::after { background: var(--c-accent); }
        
        .step-circle { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--c-border); background: var(--c-surface); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; z-index: 2; transition: 0.2s; }
        .step-item.active .step-circle { border-color: var(--c-accent); background: var(--c-accent); color: #fff; box-shadow: 0 0 0 4px rgba(91,163,196,0.2); }
        .step-item.completed .step-circle { border-color: var(--c-accent); background: var(--c-bg); color: var(--c-accent); }
        
        .step-text h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 2px; color: var(--c-text); }
        .step-text p { font-size: 0.75rem; color: var(--c-muted); line-height: 1.4; }

        .wm-content { flex: 1; display: flex; flex-direction: column; background: var(--c-bg); min-width: 0; }
        .wm-body { flex: 1; padding: 2.5rem; overflow-y: auto; }
        .wm-footer { padding: 1.25rem 2.5rem; border-top: 1px solid var(--c-border); display: flex; justify-content: space-between; align-items: center; background: #FAFAFA; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-col { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-col.full { grid-column: span 2; }
        
        label { font-size: 0.8rem; font-weight: 600; color: var(--c-text); }
        input, select, textarea { width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--c-border); background: var(--c-bg); font-family: inherit; font-size: 0.95rem; outline: none; transition: 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(91,163,196,0.15); }
        
        .editor-wrap { border: 1px solid var(--c-border); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; height: 100%; min-height: 480px; }
        .editor-toolbar { background: var(--c-surface); border-bottom: 1px solid var(--c-border); padding: 0.5rem 1rem; display: flex; gap: 1rem; font-size: 0.8rem; color: var(--c-muted); font-weight: 600; }
        .editor-textarea { flex: 1; border: none; border-radius: 0; padding: 1.5rem; font-family: 'Courier New', monospace; font-size: 0.95rem; line-height: 1.7; resize: none; background: #FAFAFA; }
        .editor-textarea:focus { box-shadow: none; background: #FFFFFF; }

        .img-drop { border: 2px dashed var(--c-border); border-radius: 12px; padding: 1rem; text-align: center; cursor: pointer; position: relative; background: var(--c-surface); transition: 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 140px; }
        .img-drop:hover { border-color: var(--c-accent); background: rgba(91,163,196,0.02); }
        .file-hidden { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

        .btn-ghost { background: transparent; border: 1px solid var(--c-border); padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; color: var(--c-text); transition: 0.2s; }
        .btn-ghost:hover { background: var(--c-surface); }
      `}</style>

      <div className="admin-wrapper">
        <div className="pt-header">
          <div>
            <div className="pt-sub">Content</div>
            <h1 className="pt-title">Blog & Research</h1>
          </div>
          <button className="btn-add" onClick={openNew}>+ New Publication</button>
        </div>

        <div className="filters">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search title or slug..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tab-group">
            {(["all", "published", "draft", "archived"] as const).map(f => (
              <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Post Details</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="t-prod">
                      {/* Priority to thumbnail in admin list, fallback to cover */}
                      <img src={p.thumbnail_url || p.cover_url || "/placeholder.png"} alt="" className="t-img" onError={e => e.currentTarget.style.display='none'} />
                      <div>
                        <span className="t-name">{p.title} {p.featured && <span className="feat-tag">Featured</span>}</span>
                        <span className="t-sku">/{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {p.category ? (
                      <span className="cat-chip" style={{ color: p.category.color, backgroundColor: `${p.category.color}15`, borderColor: `${p.category.color}30` }}>
                        {p.category.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{p.author?.name || '—'}</td>
                  <td>
                    <span className={`status-pill ${p.status}`}>{p.status}</span>
                  </td>
                  <td style={{ color: "var(--c-muted)", fontSize: "0.85rem" }}>
                    {p.status === 'published' ? fmt(p.published_at) : fmt(p.created_at)}
                  </td>
                  <td>
                    <button className="act-btn" onClick={() => openEdit(p)}>✎</button>
                    <button className="act-btn del" onClick={() => deletePost(p.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {showModal && editPost && (
            <div className="wm-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={{ duration: 0.2 }} className="wm-box"
              >
                <div className="wm-sidebar">
                  <div className="wm-title">{editPost.id ? "Edit Post" : "New Post"}</div>
                  <div className="timeline">
                    {STEPS.map((step) => {
                      const isActive = activeStep === step.id;
                      const isCompleted = activeStep > step.id;
                      return (
                        <div key={step.id} className={`step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`} onClick={() => setActiveStep(step.id)}>
                          <div className="step-circle">{isCompleted ? "✓" : step.id}</div>
                          <div className="step-text">
                            <h4>{step.title}</h4>
                            <p>{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="wm-content">
                  <div className="wm-body" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    
                    {activeStep === 1 && (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="form-grid">
                        <div className="form-col full">
                          <label>Post Title</label>
                          <input value={editPost.title || ""} onChange={e => setEditPost(p => ({ ...p!, title: e.target.value }))} placeholder="e.g. Advancements in Ophthalmic Solutions" style={{ fontSize: "1.2rem", fontWeight: 600 }} />
                        </div>
                        <div className="form-col full">
                          <label>URL Slug (Leave blank to auto-generate)</label>
                          <input value={editPost.slug || ""} onChange={e => setEditPost(p => ({ ...p!, slug: e.target.value }))} placeholder="advancements-in-ophthalmic-solutions" />
                        </div>
                        <div className="form-col">
                          <label>Category</label>
                          <select value={editPost.category_id || ""} onChange={e => setEditPost(p => ({ ...p!, category_id: e.target.value }))}>
                            <option value="">Select category...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="form-col">
                          <label>Author</label>
                          {!isAddingAuthor ? (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <select style={{ flex: 1 }} value={editPost.author_id || ""} onChange={e => setEditPost(p => ({ ...p!, author_id: e.target.value }))}>
                                <option value="">Select author...</option>
                                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                              </select>
                              <button type="button" className="btn-ghost" style={{ padding: "0 10px" }} onClick={() => setIsAddingAuthor(true)}>+</button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <input style={{ flex: 1 }} placeholder="New author name..." value={newAuthorName} onChange={e => setNewAuthorName(e.target.value)} />
                              <button type="button" className="btn-add" style={{ padding: "0 14px" }} onClick={handleCreateAuthor}>Add</button>
                              <button type="button" className="btn-ghost" style={{ padding: "0 10px" }} onClick={() => setIsAddingAuthor(false)}>✕</button>
                            </div>
                          )}
                        </div>
                        <div className="form-col full">
                          <label>Excerpt (Short Summary)</label>
                          <textarea value={editPost.excerpt || ""} onChange={e => setEditPost(p => ({ ...p!, excerpt: e.target.value }))} placeholder="Brief summary for the blog listing page..." style={{ minHeight: "80px" }} />
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 2 && (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <div className="editor-wrap">
                          <div className="editor-toolbar">
                            <span>Markdown Supported</span>
                            <span># Heading 1</span>
                            <span>## Heading 2</span>
                            <span>**Bold**</span>
                            <span>*Italic*</span>
                            <span>[Link](url)</span>
                            <span>![Image](url)</span>
                          </div>
                          <textarea 
                            className="editor-textarea"
                            value={editPost.content || ""} 
                            onChange={e => setEditPost(p => ({ ...p!, content: e.target.value }))} 
                            placeholder="Start writing your research article..." 
                          />
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 3 && (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="form-grid">
                        <div className="form-col full">
                          <label>Primary Cover Image</label>
                          <div className="img-drop">
                            {editPost.cover_url ? (
                              <img src={editPost.cover_url} style={{ maxHeight: 240, borderRadius: 8, objectFit: "contain", width: "100%" }} alt="Cover" />
                            ) : (
                              <div style={{ color: "var(--c-muted)", padding: "2rem" }}>Click to upload Main Cover Image</div>
                            )}
                            {isUploading === "cover" && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>Uploading...</div>}
                            <input type="file" accept="image/*" className="file-hidden" onChange={e => handleImageUpload(e, "cover")} disabled={!!isUploading} />
                          </div>
                        </div>

                        <div className="form-col full">
                          <label>Secondary / Content Thumbnail <span style={{fontWeight:400, color:"var(--c-muted)"}}>*Optional</span></label>
                          <div className="img-drop">
                            {editPost.thumbnail_url ? (
                              <img src={editPost.thumbnail_url} style={{ maxHeight: 140, borderRadius: 8, objectFit: "contain", width: "100%" }} alt="Thumbnail" />
                            ) : (
                              <div style={{ color: "var(--c-muted)", padding: "1.5rem" }}>Click to upload Secondary Thumbnail</div>
                            )}
                            {isUploading === "thumbnail" && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>Uploading...</div>}
                            <input type="file" accept="image/*" className="file-hidden" onChange={e => handleImageUpload(e, "thumbnail")} disabled={!!isUploading} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 4 && (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="form-grid">
                        <div className="form-col full">
                          <label>Meta Title (SEO)</label>
                          <input value={editPost.meta_title || ""} onChange={e => setEditPost(p => ({ ...p!, meta_title: e.target.value }))} placeholder="Optimized title for search engines" />
                        </div>
                        <div className="form-col full">
                          <label>Meta Description (SEO)</label>
                          <textarea value={editPost.meta_description || ""} onChange={e => setEditPost(p => ({ ...p!, meta_description: e.target.value }))} placeholder="Optimized description for search engines" style={{ minHeight: "80px" }} />
                        </div>
                        <div className="form-col">
                          <label>Publish Status</label>
                          <select value={editPost.status || "draft"} onChange={e => setEditPost(p => ({ ...p!, status: e.target.value as Post["status"] }))}>
                            <option value="draft">Draft (Hidden)</option>
                            <option value="published">Published (Live)</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                        <div className="form-col">
                          <label>Read Time (Minutes)</label>
                          <input type="number" value={editPost.read_time || 0} onChange={e => setEditPost(p => ({ ...p!, read_time: parseInt(e.target.value) || 0 }))} />
                        </div>
                        <div className="form-col full" style={{ flexDirection: "row", alignItems: "center", gap: "10px", padding: "10px 0" }}>
                          <input type="checkbox" style={{ width: 18, height: 18 }} checked={editPost.featured || false} onChange={e => setEditPost(p => ({ ...p!, featured: e.target.checked }))} />
                          <label style={{ margin: 0, cursor: "pointer" }}>Mark as Featured Article</label>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="wm-footer">
                    <button className="btn-ghost" onClick={() => activeStep > 1 ? setActiveStep(s => s - 1) : closeModal()}>
                      {activeStep > 1 ? "Back" : "Cancel"}
                    </button>
                    
                    {activeStep < 4 ? (
                      <button className="btn-add" onClick={() => setActiveStep(s => s + 1)}>Continue to {STEPS[activeStep].title}</button>
                    ) : (
                      <button className="btn-add" onClick={savePost} disabled={isSaving || !!isUploading}>
                        {isSaving ? "Publishing..." : "Publish Post"}
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