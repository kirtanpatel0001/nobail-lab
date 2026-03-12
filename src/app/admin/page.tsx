"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin/products");
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        :root {
          --brand-dark: #1A2E38;
          --brand-primary: #2C4A5C;
          --brand-accent: #5BA3C4;
          --bg-base: #F4F8FA;
          --card-bg: rgba(255, 255, 255, 0.85);
          --border-subtle: rgba(44, 74, 92, 0.08);
          --text-main: #0F172A;
          --text-muted: #64748B;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-geist-sans), sans-serif; background: var(--bg-base); overflow: hidden; }

        .admin-layout {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .ambient-bg {
          position: absolute; inset: 0; z-index: 0; overflow: hidden;
          background: #FFFFFF;
        }
        .ambient-blob {
          position: absolute; border-radius: 50%; filter: blur(80px);
          animation: float 20s infinite alternate ease-in-out;
          opacity: 0.4;
        }
        .blob-1 { top: -10%; left: -10%; width: 50vw; height: 50vw; background: #EBF3F7; animation-delay: 0s; }
        .blob-2 { bottom: -20%; right: -10%; width: 60vw; height: 60vw; background: #D4EAF5; animation-delay: -5s; }
        .blob-3 { top: 40%; left: 60%; width: 40vw; height: 40vw; background: rgba(91,163,196,0.15); animation-delay: -10s; }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(10%, 15%) scale(1.1); }
        }

        .auth-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 400px;
          background: var(--card-bg);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow: 0 24px 48px rgba(26, 46, 56, 0.08), inset 0 1px 0 rgba(255,255,255,0.8);
          border-radius: 24px;
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .logo-wrapper {
          width: 64px; height: 64px;
          background: #fff;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(26, 46, 56, 0.12);
          border: 1px solid rgba(44, 74, 92, 0.05);
          overflow: hidden;
          position: relative;
        }

        .auth-title { font-size: 1.5rem; font-weight: 700; color: var(--brand-dark); letter-spacing: -0.03em; margin-bottom: 6px; }
        .auth-subtitle { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 32px; }

        .form-container { width: 100%; text-align: left; }

        .input-group { position: relative; margin-bottom: 16px; }
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.5);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 0.95rem; color: var(--text-main);
          outline: none; transition: all 0.2s ease;
        }
        .input-field::placeholder { color: #94A3B8; }
        .input-field:focus {
          background: #fff;
          border-color: var(--brand-accent);
          box-shadow: 0 0 0 4px rgba(91,163,196,0.1);
        }

        .auth-btn {
          width: 100%; padding: 14px; margin-top: 8px;
          background: var(--brand-dark); color: #fff;
          border: none; border-radius: 12px;
          font-size: 0.95rem; font-weight: 600;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(26, 46, 56, 0.2);
        }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .error-toast {
          background: rgba(254, 242, 242, 0.8);
          border: 1px solid rgba(248, 113, 113, 0.4);
          color: #B91C1C;
          padding: 12px 16px; border-radius: 12px;
          font-size: 0.85rem; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px; backdrop-filter: blur(10px);
        }
      `}</style>

      <div className="admin-layout">
        <div className="ambient-bg">
          <div className="ambient-blob blob-1" />
          <div className="ambient-blob blob-2" />
          <div className="ambient-blob blob-3" />
        </div>

        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="logo-wrapper">
            {/* Replace /logo.png with your actual logo path in the public folder */}
            <Image 
              src="/LOGO/NOBAIL1.png" 
              alt="Nobil Logo" 
              width={48} 
              height={48} 
              style={{ objectFit: 'contain' }}
              priority 
            />
          </div>
          
          <h1 className="auth-title">Nobil Workspace</h1>
          <p className="auth-subtitle">Secure admin authentication.</p>

          <form className="form-container" onSubmit={handleLogin} autoComplete="off">
            <div className="input-group">
              <input
                type="text"
                className="input-field"
                placeholder="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="input-group">
              <input
                type={showPass ? "text" : "password"}
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 14, top: 14, background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a2 2 0 1 1 2.83 2.83L1 1l22 22"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }} 
                  animate={{ opacity: 1, height: "auto", y: 0 }} 
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="error-toast"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
}