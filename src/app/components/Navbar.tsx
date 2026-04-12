"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Brand colours ────────────────────────────────────────────────────────────
const C = {
  primary:  "#2C4A5C",
  accent:   "#5BA3C4",
  hover:    "#3D6478",
  bg:       "#FFFFFF",
  border:   "#DDE6EA",
  muted:    "#6B8A99",
  text:     "#1A2E38",
};

const NAV_LINKS = [
  { label: "Home", href: "/", sub: [] },
  {
    label: "Products", href: "/products",
    sub: [
      { label: "Ophthalmic (Eye Care)",    href: "/products?category=Ophthalmic" },
      { label: "Dermatologic (Skin Care)", href: "/products?category=Dermatology" },
      { label: "General Therapeutics",     href: "/products?category=General Therapeutics" },
      { label: "All Products",             href: "/products" },
    ],
  },
  { label: "About Us", href: "/about", sub: [] },
  {
    label: "Company", href: "/about",
    sub: [
      { label: "Vision & Mission", href: "/vision-mission" },
      { label: "Blog",             href: "/blog" },
    ],
  },
];

export default function Navbar() {
  const pathname      = usePathname();
  const [scrolled, setScrolled]         = useState(false);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const [openMobileMenu,  setOpenMobileMenu]  = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleMouseEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDesktopMenu(label);
  };
  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenDesktopMenu(null), 150);
  };

  return (
    <>
      <style>{`
        .nb-nl { position:relative; display:inline-flex; align-items:center; gap:5px;
          padding:8px 12px; border-radius:6px; font-size:13.5px; font-weight:500;
          color:${C.muted}; text-decoration:none; font-family:var(--font-geist-sans);
          transition:color 0.18s, background 0.18s; white-space:nowrap; cursor:pointer; }
        .nb-nl:hover, .nb-nl.active { color:${C.primary}; background:rgba(44,74,92,0.07); }
        .nb-nl svg { transition:transform 0.2s; }
        .nb-nl.active::after { content:""; position:absolute; bottom:2px; left:50%;
          transform:translateX(-50%); width:18px; height:2px; background:${C.accent};
          border-radius:2px; }

        .nb-drop { position:absolute; top:calc(100% + 8px); left:50%; transform:translateX(-50%);
          min-width:220px; background:#fff; border:1px solid ${C.border};
          border-radius:12px; padding:6px; box-shadow:0 8px 32px rgba(44,74,92,0.13);
          z-index:200; animation:nb-fade-in 0.15s ease; }
        .nb-drop-link { display:flex; align-items:center; gap:8px; padding:9px 14px;
          border-radius:8px; color:${C.text}; font-size:13px; text-decoration:none;
          font-family:var(--font-geist-sans); transition:background 0.15s, color 0.15s; }
        .nb-drop-link:hover { background:rgba(44,74,92,0.07); color:${C.primary}; }
        .nb-drop-link::before { content:""; width:5px; height:5px; border-radius:50%;
          background:${C.accent}; flex-shrink:0; }

        .nb-cta { padding:9px 20px; border-radius:7px; font-size:13.5px; font-weight:600;
          color:#fff; text-decoration:none; background:${C.primary};
          font-family:var(--font-geist-sans); transition:background 0.18s, transform 0.15s;
          display:inline-block; white-space:nowrap; }
        .nb-cta:hover { background:${C.hover}; transform:translateY(-1px); }

        .nb-overlay { position:fixed; inset:0; background:rgba(26,46,56,0.45);
          z-index:300; backdrop-filter:blur(3px); animation:nb-fade-in 0.2s; }
        .nb-drawer { position:fixed; top:0; right:0; height:100vh; width:min(340px,88vw);
          background:#fff; z-index:301; box-shadow:-8px 0 40px rgba(26,46,56,0.18);
          display:flex; flex-direction:column; animation:nb-slide-in 0.28s cubic-bezier(.22,1,.36,1); }
        .nb-m-link { display:flex; align-items:center; justify-content:space-between;
          padding:13px 20px; font-size:15px; font-weight:500; color:${C.text};
          text-decoration:none; font-family:var(--font-geist-sans); border-radius:8px;
          transition:background 0.15s, color 0.15s; cursor:pointer; }
        .nb-m-link:hover, .nb-m-link.active { background:rgba(44,74,92,0.07); color:${C.primary}; }
        .nb-m-sub { display:flex; align-items:center; gap:8px; padding:10px 20px 10px 32px;
          font-size:13.5px; color:${C.muted}; text-decoration:none;
          font-family:var(--font-geist-sans); border-radius:8px; transition:color 0.15s, background 0.15s; }
        .nb-m-sub:hover { color:${C.primary}; background:rgba(44,74,92,0.05); }
        .nb-m-sub::before { content:""; width:4px; height:4px; border-radius:50%;
          background:${C.accent}; flex-shrink:0; }

        @keyframes nb-fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes nb-slide-in { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @media(max-width:980px){ .nb-desktop-nav{display:none!important;} .nb-ham{display:flex!important;} }
        @media(min-width:981px){ .nb-ham{display:none!important;} }
      `}</style>

      <header style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: scrolled ? "rgba(255,255,255,0.97)" : "#fff",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom:`1px solid ${scrolled ? C.border : "transparent"}`,
        transition:"border-color 0.3s, box-shadow 0.3s",
        boxShadow: scrolled ? "0 2px 20px rgba(44,74,92,0.08)" : "none",
      }}>
        <nav style={{
          maxWidth:"1340px", margin:"0 auto", padding:"0 2rem",
          height:"70px", display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
            <img src="/LOGO/NOBAIL1.png" alt="Nobil Laboratories icon" style={{ height:"42px", width:"42px", objectFit:"contain" }} />
            <img src="/LOGO/NOBIL 02.png" alt="Nobil Laboratories" style={{ height:"22px", objectFit:"contain", maxWidth:"220px" }} />
          </Link>

          {/* Desktop nav */}
          <div className="nb-desktop-nav" style={{ display:"flex", alignItems:"center", gap:"1px", marginLeft:"auto", marginRight:"16px" }}>
            {NAV_LINKS.map((link) => {
              const hasSub  = link.sub.length > 0;
              const isOpen  = openDesktopMenu === link.label;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <div
                  key={link.label}
                  style={{ position:"relative" }}
                  onMouseEnter={() => hasSub && handleMouseEnter(link.label)}
                  onMouseLeave={() => hasSub && handleMouseLeave()}
                >
                  <Link href={link.href} className={`nb-nl${isActive ? " active" : ""}`}>
                    {link.label}
                    {hasSub && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                        style={{ transform: isOpen ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}>
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </Link>

                  {hasSub && isOpen && (
                    <div
                      className="nb-drop"
                      onMouseEnter={() => handleMouseEnter(link.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {link.sub.map((s) => (
                        <Link key={s.label} href={s.href} className="nb-drop-link">{s.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <Link href="/contact" className="nb-cta nb-desktop-nav" style={{ display:"inline-block" }}>
            Contact Us →
          </Link>

          {/* Hamburger */}
          <button
            className="nb-ham"
            onClick={() => setDrawerOpen(true)}
            style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", flexDirection:"column", gap:"5px" }}
            aria-label="Open menu"
          >
            {[0,1,2].map((i) => (
              <span key={i} style={{ display:"block", width:"24px", height:"2px", background:C.primary, borderRadius:"2px" }} />
            ))}
          </button>
        </nav>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div className="nb-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="nb-drawer">
            <div style={{
              padding:"0 20px", height:"70px", display:"flex", alignItems:"center",
              justifyContent:"space-between", borderBottom:`1px solid ${C.border}`, flexShrink:0,
            }}>
              <Link href="/" style={{ display:"flex", alignItems:"center", gap:"8px", textDecoration:"none" }} onClick={() => setDrawerOpen(false)}>
                <img src="/LOGO/NOBAIL1.png" alt="" style={{ height:"36px", width:"36px", objectFit:"contain" }} />
                <img src="/LOGO/NOBIL 02.png" alt="Nobil Laboratories" style={{ height:"18px", objectFit:"contain", maxWidth:"180px" }} />
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", color:C.muted, fontSize:"22px", lineHeight:1 }}
                aria-label="Close menu"
              >✕</button>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>
              {NAV_LINKS.map((link) => {
                const hasSub    = link.sub.length > 0;
                const isActive  = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const mobileOpen = openMobileMenu === link.label;

                return (
                  <div key={link.label}>
                    {hasSub ? (
                      <button
                        className={`nb-m-link${isActive ? " active" : ""}`}
                        style={{ width:"100%", background:mobileOpen ? "rgba(44,74,92,0.06)" : "transparent", border:"none", color: isActive ? C.primary : C.text }}
                        onClick={() => setOpenMobileMenu(mobileOpen ? null : link.label)}
                      >
                        <span>{link.label}</span>
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none"
                          style={{ transform: mobileOpen ? "rotate(180deg)" : "none", transition:"transform 0.22s", flexShrink:0 }}>
                          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`nb-m-link${isActive ? " active" : ""}`}
                        style={{ color: isActive ? C.primary : C.text }}
                        onClick={() => setDrawerOpen(false)}
                      >
                        {link.label}
                      </Link>
                    )}
                    {hasSub && mobileOpen && (
                      <div style={{ paddingBottom:"4px" }}>
                        {link.sub.map((s) => (
                          <Link key={s.label} href={s.href} className="nb-m-sub" onClick={() => setDrawerOpen(false)}>
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                href="/about#vision"
                className="nb-m-link"
                style={{ color: pathname === "/about" ? C.primary : C.text, marginTop:"4px",
                  background:"rgba(91,163,196,0.08)", borderLeft:`3px solid ${C.accent}`, borderRadius:"0 8px 8px 0" }}
                onClick={() => setDrawerOpen(false)}
              >
                Vision &amp; Mission
              </Link>
            </div>

            <div style={{ padding:"16px 20px", borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
              <Link
                href="/contact"
                onClick={() => setDrawerOpen(false)}
                style={{
                  display:"block", padding:"13px", textAlign:"center",
                  background:C.primary, color:"#fff", borderRadius:"10px",
                  fontWeight:600, fontSize:"15px", textDecoration:"none",
                  fontFamily:"var(--font-geist-sans)",
                }}
              >
                Contact Us →
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}