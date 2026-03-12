"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPin, Mail, Phone, Clock,
  ArrowRight, FlaskConical, Atom, Microscope, Dna,
  Instagram, Facebook, Twitter, CheckCircle2, Send, Package
} from "lucide-react";

const C = {
  primary:      "#2C4A5C",
  primaryHover: "#3D6478",
  primaryLight: "#EBF3F7",
  accent:       "#5BA3C4",
  bgDefault:    "#FFFFFF",
  bgSubtle:     "#F4F8FA",
  border:       "#DDE6EA",
  borderStrong: "#B8D0DA",
  textPrimary:  "#1A2E38",
  textMuted:    "#6B8A99",
  textSubtle:   "#A8BEC8",
};

const INFO = [
  { Icon: MapPin,  label:"Headquarters",  value:"A/218, Priyanka Intercity, PunaKumbhariya road, opp. Bhaktidham Mandir, Surat, Gujarat 395011",  sub:"Visit by appointment only" },
  { Icon: Mail,    label:"Email Us",       value:"contact@nobillaboratories.com",      sub:"We respond within 24 hours" },
  { Icon: Phone,   label:"Phone",          value:"+91 97267 46343",      sub:"Mon–Fri, 9:00 AM – 6:00 PM IST" },
  { Icon: Clock,   label:"Response Time",  value:"Within 24 Hours",           sub:"For all general enquiries" },
];

const SOCIALS = [
  // { Icon: Instagram, key:"ig", href:"#", label:"Instagram", hoverColor:"#E1306C" },
  { Icon: Facebook,  key:"fb", href:"https://www.facebook.com/nobillaboratories", label:"Facebook",  hoverColor:"#1877F2" },
  // { Icon: Twitter,   key:"tw", href:"#", label:"Twitter",   hoverColor:"#1DA1F2" },
];

const SUBJECTS = [
  "General Enquiry",
  "Product Information",
  "Research Collaboration",
  "Partnership Opportunity",
  "Media & Press",
  "Careers",
  "Other",
];

const FLOATING = [
  { Icon: Atom,         top:"10%", left:"4%",   size:48, op:0.20, delay:"0s",   dur:"7s"   },
  { Icon: FlaskConical, top:"25%", right:"6%",  size:52, op:0.28, delay:"1.5s", dur:"8s"   },
  { Icon: Dna,          top:"55%", left:"3%",   size:64, op:0.28, delay:"2s",   dur:"9s"   },
  { Icon: Microscope,   top:"65%", right:"5%",  size:90, op:0.27, delay:"0.8s", dur:"7.5s" },
];

function ContactForm() {
  const searchParams = useSearchParams();

  // Read URL query params from product page
  const qSubject  = searchParams.get("subject")  || "";
  const qProduct  = searchParams.get("product")  || "";
  const qSku      = searchParams.get("sku")      || "";
  const qCategory = searchParams.get("category") || "";

  // Build auto-filled message when coming from a product
  const autoMessage = qProduct
    ? `Hi,\n\nI would like to enquire about the following product:\n\nProduct: ${qProduct}\nSKU: ${qSku}${qCategory ? `\nCategory: ${qCategory}` : ""}\n\nPlease provide more information regarding availability, pricing, and any technical documentation.\n\nThank you.`
    : "";

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    subject: qSubject && SUBJECTS.includes(qSubject) ? qSubject : "",
    message: autoMessage,
  });
  const [sent, setSent]               = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused]         = useState<string | null>(null);

  // Sync if params arrive after hydration
  useEffect(() => {
    if (qProduct || qSubject) {
      setForm(f => ({
        ...f,
        subject: qSubject && SUBJECTS.includes(qSubject) ? qSubject : f.subject,
        message: f.message || autoMessage,
      }));
    }
  }, [qProduct, qSubject, autoMessage]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.subject || !form.message) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("https://formsubmit.co/ajax/nobilstatement@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...form,
          _subject: `New submission from ${form.name}`,
          _captcha: "false",
        }),
      });
      if (response.ok) { setSent(true); }
      else { alert("Something went wrong. Please try again."); }
    } catch {
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%", padding: "13px 16px",
    background: focused === field ? "#fff" : C.bgSubtle,
    border: `1.5px solid ${focused === field ? C.accent : C.border}`,
    borderRadius: "10px", color: C.textPrimary,
    fontSize: "14.5px", outline: "none",
    boxSizing: "border-box", fontFamily: "var(--font-geist-sans)",
    transition: "all 0.18s ease",
    boxShadow: focused === field ? `0 0 0 3px rgba(91,163,196,0.10)` : "none",
  });

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "11px", fontWeight: 700,
    color: C.textMuted, letterSpacing: "0.1em",
    textTransform: "uppercase", fontFamily: "var(--font-geist-mono)",
    marginBottom: "7px",
  };

  // Product context banner — shown when redirected from product page
  const fromProduct = Boolean(qProduct);

  return (
    <>
      <style>{`
        @keyframes floatY {
          0%,100% { transform:translateY(0px); }
          50%      { transform:translateY(-15px); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position:200% center; }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow:0 0 0 0 rgba(91,163,196,0.3); }
          50%      { box-shadow:0 0 0 8px rgba(91,163,196,0); }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .nb-info-card {
          display:flex; align-items:flex-start; gap:16px;
          padding:16px 18px; border-radius:14px;
          background:#fff; border:1.5px solid ${C.border};
          transition:all 0.25s cubic-bezier(0.22,1,0.36,1); cursor:default;
        }
        .nb-info-card:hover {
          border-color:${C.accent};
          transform:translateX(7px);
          box-shadow:0 4px 22px rgba(91,163,196,0.12);
        }
        .nb-social-btn {
          width:56px; height:56px; border-radius:14px;
          display:inline-flex; align-items:center; justify-content:center;
          text-decoration:none;
          border:1.5px solid ${C.border};
          background:#fff; color:${C.textMuted};
          transition:all 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        .nb-submit {
          width:100%; padding:15px 24px;
          background:${C.primary}; color:#fff;
          border:none; border-radius:10px;
          font-weight:700; font-size:15px; cursor:pointer;
          font-family:var(--font-geist-sans); letter-spacing:0.02em;
          display:flex; align-items:center; justify-content:center; gap:10px;
          transition:all 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        .nb-submit:hover:not(:disabled) {
          background:${C.primaryHover};
          transform:translateY(-2px);
          box-shadow:0 10px 30px rgba(44,74,92,0.24);
        }
        .nb-submit:disabled { opacity:0.7; cursor:not-allowed; }

        /* Product banner */
        .product-banner {
          display:flex; align-items:center; gap:12px;
          padding:13px 16px; border-radius:12px;
          background:${C.primaryLight};
          border:1.5px solid ${C.borderStrong};
          margin-bottom:1.5rem;
          animation:slideDown 0.35s ease;
        }
        .product-banner-icon {
          width:36px; height:36px; border-radius:9px;
          background:${C.primary}; color:#fff;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }

        /* Subject highlight when auto-selected */
        .subject-highlight {
          border-color:${C.accent} !important;
          background:#fff !important;
          box-shadow:0 0 0 3px rgba(91,163,196,0.10) !important;
        }

        select { cursor:pointer; appearance:none; }
        select option { color:${C.textPrimary}; background:#fff; }

        @media(max-width:880px){
          .nb-main-grid { grid-template-columns:1fr !important; }
          .nb-two-col   { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div style={{ fontFamily:"var(--font-geist-sans)" }}>

        {/* ══ HERO ══ */}
        <div style={{ background:C.primary, position:"relative", overflow:"hidden", padding:"5.5rem 2rem 5rem" }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:`repeating-linear-gradient(-52deg, transparent, transparent 44px, rgba(91,163,196,0.04) 44px, rgba(91,163,196,0.04) 45px)` }} />
          <div style={{ position:"absolute", top:"-80px", right:"-100px", width:"580px", height:"580px", borderRadius:"50%", background:"radial-gradient(circle, rgba(91,163,196,0.14) 0%, transparent 65%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-80px", left:"-60px", width:"380px", height:"380px", borderRadius:"50%", background:"radial-gradient(circle, rgba(44,74,92,0.5) 0%, transparent 70%)", pointerEvents:"none" }} />
          {FLOATING.map(({ Icon, top, left, right, size, op, delay, dur }: any, i) => (
            <div key={i} style={{ position:"absolute", top, left, right, color:C.accent, opacity:op, animation:`floatY ${dur} ease-in-out infinite`, animationDelay:delay, pointerEvents:"none" }}>
              <Icon size={size} strokeWidth={1.1} />
            </div>
          ))}
          <div style={{ maxWidth:"1340px", margin:"0 auto", position:"relative", zIndex:1 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"9px", background:"rgba(91,163,196,0.10)", border:"1px solid rgba(91,163,196,0.28)", borderRadius:"100px", padding:"5px 16px", marginBottom:"1.75rem" }}>
              <FlaskConical size={12} color={C.accent} strokeWidth={2} />
              <span style={{ fontSize:"11px", color:C.accent, fontFamily:"var(--font-geist-mono)", fontWeight:600, letterSpacing:"0.13em", textTransform:"uppercase" }}>
                Contact Nobil Laboratories
              </span>
            </div>
            <h1 style={{ fontSize:"clamp(40px,5.5vw,70px)", fontWeight:800, color:"#fff", letterSpacing:"-0.04em", lineHeight:1.02, margin:"0 0 1.25rem" }}>
              Let&apos;s build something<br />
              <span style={{ background:"linear-gradient(90deg, #5BA3C4, #a8d8f0, #5BA3C4)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"shimmer 4s linear infinite" }}>
                extraordinary.
              </span>
            </h1>
            <p style={{ color:"rgba(255,255,255,0.52)", fontSize:"17px", lineHeight:1.78, maxWidth:"500px", margin:0, fontWeight:300 }}>
              Whether it&apos;s a research collaboration, a product enquiry, or a partnership — our team is ready to engage seriously.
            </p>
          </div>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg, transparent, rgba(91,163,196,0.35) 40%, rgba(91,163,196,0.35) 60%, transparent)" }} />
        </div>

        {/* ══ BODY ══ */}
        <div style={{ background:C.bgSubtle, paddingBottom:"5rem" }}>
          <div style={{ maxWidth:"1340px", margin:"0 auto", padding:"4rem 2rem 0" }}>
            <div className="nb-main-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:"3.5rem", alignItems:"start" }}>

              {/* ── LEFT ── */}
              <div style={{ display:"flex", flexDirection:"column", gap:"11px" }}>
                <p style={{ color:C.textMuted, fontSize:"14.5px", lineHeight:1.8, marginBottom:"6px" }}>
                  We take every message seriously. Fill in the form or reach us directly through the channels below.
                </p>
                {INFO.map(({ Icon, label, value, sub }, i) => (
                  <div key={i} className="nb-info-card">
                    <div style={{ width:"44px", height:"44px", borderRadius:"11px", background:C.primaryLight, color:C.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${C.border}` }}>
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div style={{ ...labelStyle, marginBottom:"2px" }}>{label}</div>
                      <div style={{ fontSize:"15px", lineHeight:1.4, fontWeight:600, color:C.textPrimary, marginBottom:"2px" }}>{value}</div>
                      <div style={{ fontSize:"12.5px", color:C.textMuted }}>{sub}</div>
                    </div>
                  </div>
                ))}
                <div style={{ height:"1px", background:C.border, margin:"8px 0" }} />
                <div>
                  <p style={{ ...labelStyle, marginBottom:"16px" }}>Follow Us</p>
                  <div style={{ display:"flex", gap:"12px" }}>
                    {SOCIALS.map(({ Icon, key, href, label, hoverColor }) => (
                      <div key={key} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
                        <a href={href} title={label} className="nb-social-btn"
                          onMouseEnter={e => { e.currentTarget.style.borderColor=hoverColor; e.currentTarget.style.color=hoverColor; e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 8px 24px ${hoverColor}35`; e.currentTarget.style.background=`${hoverColor}0a`; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textMuted; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.background="#fff"; }}
                        >
                          <Icon size={24} strokeWidth={1.7} />
                        </a>
                        <span style={{ fontSize:"11px", color:C.textSubtle, letterSpacing:"0.04em" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Form ── */}
              <div style={{ background:C.bgDefault, border:`1.5px solid ${C.border}`, borderRadius:"20px", padding:"2.75rem", boxShadow:"0 4px 48px rgba(44,74,92,0.08)", animation:"fadeSlideUp 0.5s ease" }}>
                {sent ? (
                  <div style={{ textAlign:"center", padding:"4rem 1rem" }}>
                    <div style={{ width:"74px", height:"74px", borderRadius:"50%", background:C.primaryLight, border:`2px solid ${C.accent}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem", animation:"pulseGlow 2s ease-in-out infinite" }}>
                      <CheckCircle2 size={30} color={C.primary} strokeWidth={1.8} />
                    </div>
                    <h3 style={{ fontSize:"24px", fontWeight:800, color:C.textPrimary, letterSpacing:"-0.03em", margin:"0 0 0.75rem" }}>Message received.</h3>
                    <p style={{ color:C.textMuted, fontSize:"15px", lineHeight:1.7, maxWidth:"300px", margin:"0 auto 2rem" }}>
                      Thank you for reaching out. Our team will be in touch within 24 hours.
                    </p>
                    <button
                      onClick={() => { setSent(false); setForm({ name:"", email:"", phone:"", company:"", subject:"", message:"" }); }}
                      style={{ padding:"11px 28px", background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:"9px", color:C.textMuted, fontSize:"14px", cursor:"pointer", fontFamily:"var(--font-geist-sans)", transition:"all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=C.accent; e.currentTarget.style.color=C.primary; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textMuted; }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Form header */}
                    <div style={{ marginBottom:"1.75rem", paddingBottom:"1.5rem", borderBottom:`1px solid ${C.border}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"5px" }}>
                        <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:C.primaryLight, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Send size={15} color={C.primary} strokeWidth={1.8} />
                        </div>
                        <h2 style={{ fontSize:"21px", fontWeight:800, color:C.textPrimary, letterSpacing:"-0.03em", margin:0 }}>
                          Send us a message
                        </h2>
                      </div>
                      <p style={{ color:C.textMuted, fontSize:"13.5px", margin:"8px 0 0" }}>
                        All fields marked <span style={{ color:C.accent, fontWeight:700 }}>*</span> are required.
                      </p>
                    </div>

                    {/* ── Product context banner ── */}
                    {fromProduct && (
                      <div className="product-banner">
                        <div className="product-banner-icon">
                          <Package size={17} strokeWidth={1.8} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.textMuted, fontFamily:"var(--font-geist-mono)", marginBottom:"2px" }}>
                            Product Enquiry
                          </div>
                          <div style={{ fontSize:"14px", fontWeight:700, color:C.textPrimary, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {qProduct}
                          </div>
                          <div style={{ fontSize:"12px", color:C.textMuted, fontFamily:"var(--font-geist-mono)", marginTop:"1px" }}>
                            SKU: {qSku}{qCategory ? ` · ${qCategory}` : ""}
                          </div>
                        </div>
                        {/* Clear product context */}
                        <button
                          onClick={() => setForm(f => ({ ...f, subject:"", message:"" }))}
                          title="Clear product context"
                          style={{ background:"none", border:"none", cursor:"pointer", color:C.textSubtle, padding:4, flexShrink:0, transition:"color .15s" }}
                          onMouseEnter={e => e.currentTarget.style.color=C.textMuted}
                          onMouseLeave={e => e.currentTarget.style.color=C.textSubtle}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    )}

                    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

                      {/* Name + Email */}
                      <div className="nb-two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                        {[
                          { key:"name",  label:"Full Name",     type:"text",  ph:"Dr. Jane Smith",        req:true },
                          { key:"email", label:"Email Address", type:"email", ph:"jane@organisation.com", req:true },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={labelStyle}>{f.label} {f.req && <span style={{ color:C.accent }}>*</span>}</label>
                            <input
                              type={f.type} placeholder={f.ph} value={(form as any)[f.key]}
                              onChange={e => set(f.key, e.target.value)}
                              onFocus={() => setFocused(f.key)} onBlur={() => setFocused(null)}
                              style={inputStyle(f.key)}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Phone + Company */}
                      <div className="nb-two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                        <div>
                          <label style={labelStyle}>Phone Number <span style={{ color:C.accent }}>*</span></label>
                          <div style={{ display:"flex", gap:"8px" }}>
                            <div style={{ display:"flex", alignItems:"center", padding:"0 12px", background: focused==="phone" ? "#fff" : C.bgSubtle, border:`1.5px solid ${focused==="phone" ? C.accent : C.border}`, borderRadius:"10px", flexShrink:0, transition:"all 0.18s ease" }}>
                              <span style={{ fontSize:"13px", color:C.textMuted, fontWeight:600, whiteSpace:"nowrap" }}>🇮🇳 +91</span>
                            </div>
                            <input type="tel" placeholder="98765 43210" value={form.phone}
                              onChange={e => set("phone", e.target.value)}
                              onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
                              style={{ ...inputStyle("phone"), flex:1 }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={labelStyle}>Organisation / Company</label>
                          <input type="text" placeholder="Nobil Laboratories" value={form.company}
                            onChange={e => set("company", e.target.value)}
                            onFocus={() => setFocused("company")} onBlur={() => setFocused(null)}
                            style={inputStyle("company")}
                          />
                        </div>
                      </div>

                      {/* Subject — auto-selected when coming from product */}
                      <div>
                        <label style={labelStyle}>
                          Subject <span style={{ color:C.accent }}>*</span>
                          {fromProduct && form.subject === "Product Information" && (
                            <span style={{ marginLeft:8, fontSize:"10px", fontWeight:700, color:C.accent, background:`${C.accent}18`, border:`1px solid ${C.accent}30`, padding:"2px 8px", borderRadius:100, letterSpacing:"0.05em", textTransform:"uppercase", verticalAlign:"middle" }}>
                              Auto-selected
                            </span>
                          )}
                        </label>
                        <div style={{ position:"relative" }}>
                          <select
                            value={form.subject}
                            onChange={e => set("subject", e.target.value)}
                            onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
                            className={fromProduct && form.subject === "Product Information" ? "subject-highlight" : ""}
                            style={{
                              ...inputStyle("subject"),
                              paddingRight:"40px",
                            }}
                          >
                            <option value="">Select a subject…</option>
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {/* Custom chevron */}
                          <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:C.textMuted }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                          </div>
                        </div>
                      </div>

                      {/* Message — pre-filled when coming from product */}
                      <div>
                        <label style={labelStyle}>
                          Message <span style={{ color:C.accent }}>*</span>
                          {fromProduct && (
                            <span style={{ marginLeft:8, fontSize:"10px", fontWeight:700, color:C.accent, background:`${C.accent}18`, border:`1px solid ${C.accent}30`, padding:"2px 8px", borderRadius:100, letterSpacing:"0.05em", textTransform:"uppercase", verticalAlign:"middle" }}>
                              Pre-filled
                            </span>
                          )}
                        </label>
                        <textarea
                          rows={6}
                          placeholder="Describe your enquiry in detail…"
                          value={form.message}
                          onChange={e => set("message", e.target.value)}
                          onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                          style={{ ...inputStyle("message"), resize:"vertical", minHeight:"150px" }}
                        />
                      </div>

                      <p style={{ fontSize:"12.5px", color:C.textMuted, lineHeight:1.65, margin:0 }}>
                        By submitting this form you agree to our{" "}
                        <a href="#" style={{ color:C.primary, textDecoration:"underline", fontWeight:500 }}>Privacy Policy</a>.
                        {" "}We never share your information with third parties.
                      </p>

                      <button className="nb-submit" disabled={isSubmitting} onClick={handleSubmit}>
                        <span>{isSubmitting ? "Sending…" : "Submit Enquiry"}</span>
                        {!isSubmitting && <ArrowRight size={16} strokeWidth={2.2} />}
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F8FA" }}>
        Loading Contact Form...
      </div>
    }>
      <ContactForm />
    </Suspense>
  );
}