"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface AdminUser {
  username: string;
  role: string;
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setAdmin(data.admin); setLoading(false); })
      .catch(() => router.push("/admin"));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  const navItems = [
    {
      id: "blog", label: "Blog Console", href: "/admin/blog",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: "products", label: "Product Catalog", href: "/admin/products",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )
    },
  ];

  const activeId = navItems.find(n => pathname?.startsWith(n.href))?.id || "blog";

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F4F8FA"}}>
      <div style={{width:40,height:40,border:"3px solid #E2E8F0",borderTopColor:"#2C4A5C",borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --brand-primary: #2C4A5C;
          --brand-accent: #5BA3C4;
          --bg-canvas: #F4F8FA;
          --bg-surface: #FFFFFF;
          --bg-hover: #F8FAFC;
          --border-light: #E2E8F0;
          --text-strong: #0F172A;
          --text-base: #334155;
          --text-muted: #64748B;
          --shadow-sm: 0 2px 4px rgba(0,0,0,0.02);
          --shadow-md: 0 4px 12px rgba(44,74,92,0.06);
          --font-body: var(--font-geist-sans), 'Inter', sans-serif;
        }

        body { 
          font-family: var(--font-body); 
          background: var(--bg-canvas); 
          color: var(--text-base); 
          -webkit-font-smoothing: antialiased;
        }
        
        a { text-decoration: none; color: inherit; }

        .admin-shell { display: flex; min-height: 100vh; }

        /* TACTILE SIDEBAR */
        .sidebar {
          width: 280px;
          flex-shrink: 0;
          background: var(--bg-canvas);
          border-right: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 20;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 24px 32px 24px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0 16px;
          flex: 1;
        }

        .nav-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
          padding-left: 12px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-base);
          border: 1px solid transparent;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-link:hover:not(.active) {
          background: rgba(255,255,255,0.5);
          border-color: rgba(226, 232, 240, 0.6);
        }

        /* Card-style Active State */
        .nav-link.active {
          background: var(--bg-surface);
          border-color: var(--border-light);
          box-shadow: var(--shadow-sm);
          color: var(--brand-primary);
          font-weight: 600;
        }

        .nav-link.active svg { color: var(--brand-accent); }

        .active-indicator {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--brand-accent);
          box-shadow: 0 0 0 3px rgba(91,163,196,0.15);
        }

        /* STRUCTURED FOOTER */
        .sidebar-footer {
          padding: 24px 16px;
        }

        .profile-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border-radius: 16px;
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }

        .profile-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .admin-avatar {
          width: 40px; height: 40px;
          background: var(--brand-primary);
          color: #fff;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1.1rem;
        }

        .admin-name { font-size: 0.9rem; font-weight: 700; color: var(--text-strong); letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .admin-role { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }

        .logout-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid var(--border-light);
          background: var(--bg-canvas);
          color: var(--text-muted);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: #FEF2F2;
          border-color: #FCA5A5;
          color: #DC2626;
        }

        /* MAIN AREA */
        .main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--bg-surface); }

        .topbar {
          height: 76px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-light);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem;
          position: sticky; top: 0; z-index: 10;
        }

        .topbar-title { font-size: 1.25rem; font-weight: 700; color: var(--text-strong); letter-spacing: -0.02em; }
        
        .status-badge {
          display: flex; align-items: center; gap: 8px;
          background: #F8FAFC;
          border: 1px solid var(--border-light);
          border-radius: 8px; color: var(--text-base);
          font-size: 0.8rem; font-weight: 600; padding: 6px 14px;
        }

        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; }

        .page-content { flex: 1; padding: 2.5rem; max-width: 1400px; margin: 0 auto; width: 100%; }

        .mob-toggle { display: none; background: var(--bg-canvas); border: 1px solid var(--border-light); border-radius: 8px; cursor: pointer; color: var(--text-strong); padding: 8px; }

        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'};
            transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            box-shadow: ${sidebarOpen ? '20px 0 40px rgba(0,0,0,0.1)' : 'none'};
          }
          .mob-toggle { display: flex; }
          .topbar { padding: 0 1.5rem; }
          .page-content { padding: 1.5rem; }
        }
      `}</style>

      <div className="admin-shell">
        <aside className="sidebar">
          {/* Logo Integration */}
          <div className="sidebar-logo">
            <Image 
              src="/LOGO/NOBAIL1.png" 
              alt="Nobil Icon" 
              width={36} 
              height={36} 
              style={{ objectFit: 'contain' }}
              priority
            />
            <Image 
              src="/LOGO/NOBIL 02.png" 
              alt="Nobil Wordmark" 
              width={130} 
              height={28} 
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          <nav className="sidebar-nav">
            <div className="nav-label">Workspace</div>
            {navItems.map(item => {
              const isActive = activeId === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="nav-link-content">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="active-indicator" />}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="profile-card">
              <div className="profile-info">
                <div className="admin-avatar">
                  {admin?.username?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <div className="admin-name">{admin?.username || "Admin"}</div>
                  <div className="admin-role">{admin?.role || "System"}</div>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout} aria-label="Sign Out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
              </button>
            </div>
          </div>
        </aside>

        <div className="main-area">
          <header className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button className="mob-toggle" onClick={() => setSidebarOpen(v => !v)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
              </button>
              <h1 className="topbar-title">
                {navItems.find(n => n.id === activeId)?.label}
              </h1>
            </div>
            
            <div className="status-badge">
              <span className="status-dot" />
              Connected
            </div>
          </header>

          <main className="page-content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}