"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Github, MapPin, Mail, Phone, X } from "lucide-react";

const C = {
  primary: "#2C4A5C",
  accent:  "#5BA3C4",
  border:  "#DDE6EA",
  muted:   "#6B8A99",
};

const COLS = {
  COMPANY: [
    { label: "About Us", href: "/about" },
    { label: "Blog",     href: "/blog" },
    { label: "Contact Us", href: "/contact" },
  ],
  PRODUCTS: [
    { label: "Core Platform",   href: "/products#core" },
    { label: "Edge Solutions",  href: "/products#edge" },
    { label: "Analytics Suite", href: "/products#analytics" },
  ],
  LEGAL: [
    { label: "Privacy Policy",   href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy",    href: "/cookie-policy" },
  ],
};

const SOCIALS = [
  { key: "fb", label: "Facebook", href: "https://www.facebook.com/nobillaboratories", Icon: Facebook },
  { key: "in", label: "LinkedIn", href: "#", Icon: Linkedin },
  { key: "tw", label: "Twitter",  href: "#", Icon: Twitter },
  { key: "gh", label: "GitHub",   href: "#", Icon: Github },
];

export default function Footer() {
  const [isCreatorPopupOpen, setIsCreatorPopupOpen] = useState(false);

  return (
    <>
      <style>{`
        .nb-fl {
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          text-decoration: none;
          font-family: var(--font-geist-sans);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s ease, gap 0.2s ease;
          position: relative;
        }
        .nb-fl::after {
          content: "";
          position: absolute;
          bottom: -2px; left: 0;
          width: 0%;
          height: 1.5px;
          background: #5BA3C4;
          border-radius: 2px;
          transition: width 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .nb-fl::before {
          content: "";
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          display: inline-block;
          flex-shrink: 0;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .nb-fl:hover { color: #fff; gap: 10px; }
        .nb-fl:hover::after  { width: 100%; }
        .nb-fl:hover::before { background: #5BA3C4; transform: scale(1.6); }

        .nb-fsoc {
          width: 38px; height: 38px;
          border-radius: 9px;
          border: 1.5px solid rgba(255,255,255,0.12);
          display: inline-flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        .nb-fsoc:hover {
          border-color: #5BA3C4;
          color: #5BA3C4;
          background: rgba(91,163,196,0.10);
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(91,163,196,0.18);
        }
        
        .nb-contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,0.6);
          font-size: 14px;
          margin-bottom: 12px;
        }
        .nb-contact-item svg {
          color: #5BA3C4;
        }

        .nb-credit {
          color: rgba(255,255,255,0.25);
          font-size: 13px;
          text-decoration: none;
          font-family: var(--font-geist-mono);
          letter-spacing: 0.04em;
          transition: color 0.2s ease;
          position: relative;
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .nb-credit::after {
          content: "";
          position: absolute;
          bottom: -2px; left: 0;
          width: 0%;
          height: 1px;
          background: #5BA3C4;
          border-radius: 2px;
          transition: width 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .nb-credit:hover { color: #5BA3C4; }
        .nb-credit:hover::after { width: 100%; }

        .nb-logo-link {
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1rem;
          opacity: 1;
          transition: opacity 0.2s ease;
        }
        .nb-logo-link:hover { opacity: 0.85; }

        /* Popup Styles */
        .nb-popup-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 25, 31, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          animation: nb-fade-in 0.2s forwards ease-out;
        }
        .nb-popup-content {
          background: #2C4A5C;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 2rem;
          width: 90%;
          max-width: 380px;
          position: relative;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          transform: translateY(20px);
          animation: nb-slide-up 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nb-popup-close {
          position: absolute;
          top: 12px; right: 12px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          transition: all 0.2s;
        }
        .nb-popup-close:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
        }

        @keyframes nb-fade-in { to { opacity: 1; } }
        @keyframes nb-slide-up { to { transform: translateY(0); } }

        @media(max-width:880px){ .nb-fgrid{ grid-template-columns:1fr 1fr !important; } }
        @media(max-width:480px){ .nb-fgrid{ grid-template-columns:1fr !important; } }
      `}</style>

      <div style={{
        background: `linear-gradient(170deg, #F4F8FA 45%, #2C4A5C 45%)`,
        height: "50px",
      }} />

      <footer style={{ background: "#2C4A5C", color: "#fff", fontFamily: "var(--font-geist-sans)" }}>
        <div style={{ maxWidth: "1340px", margin: "0 auto", padding: "2.5rem 2rem 0" }}>

          <div className="nb-fgrid" style={{
            display: "grid",
            gridTemplateColumns: "1.8fr 1fr 1fr 1fr",
            gap: "2rem",
            paddingBottom: "2rem",
            borderBottom: "1px solid rgba(255,255,255,0.10)",
          }}>

            <div>
              <Link href="/" className="nb-logo-link">
                <img src="/LOGO/NOBAIL1.png" alt="Nobil icon" style={{ height: "40px", width: "40px", objectFit: "contain" }} />
                <img src="/LOGO/NOBIL 02.png" alt="Nobil Laboratories" style={{ height: "22px", objectFit: "contain", maxWidth: "200px", filter: "brightness(0) invert(1)" }} />
              </Link>

              <p style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.6,
                marginBottom: "1.25rem",
                maxWidth: "280px",
              }}>
                Advancing science and engineering through rigorous research, precision products, and a commitment to lasting impact.
              </p>

              <div style={{ marginBottom: "1.5rem", maxWidth: "280px" }}>
                <div className="nb-contact-item" style={{ alignItems: "flex-start" }}>
                  <MapPin size={16} style={{ marginTop: "3px", flexShrink: 0 }} />
                  <span style={{ lineHeight: 1.4 }}>A/218, Priyanka Intercity, PunaKumbhariya road, opp. Bhaktidham Mandir, Surat, Gujarat 395011</span>
                </div>
                <div className="nb-contact-item">
                  <Mail size={16} />
                  <span>contact@nobillaboratories.com</span>
                </div>
                <div className="nb-contact-item">
                  <Phone size={16} />
                  <span>+91 97267 46343</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {SOCIALS.map(({ key, href, label, Icon }) => (
                  <a key={key} href={href} title={label} className="nb-fsoc">
                    <Icon size={18} strokeWidth={2} />
                  </a>
                ))}
              </div>
            </div>

            {Object.entries(COLS).map(([section, items]) => (
              <div key={section}>
                <h4 style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#5BA3C4",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-geist-mono)",
                  margin: "0 0 1rem",
                }}>
                  {section}
                </h4>
                <ul style={{
                  listStyle: "none", padding: 0, margin: 0,
                  display: "flex", flexDirection: "column", gap: "10px",
                }}>
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="nb-fl">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "1rem",
            padding: "1rem 0",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                © {new Date().getFullYear()} Nobil Laboratories. All rights reserved.
              </span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
                Built with precision engineering and advanced research.
              </span>
            </div>
            
            <button onClick={() => setIsCreatorPopupOpen(true)} className="nb-credit">
               Made by Kirtan Patel
            </button>
          </div>

        </div>
      </footer>

      {/* Creator Popup Modal */}
      {isCreatorPopupOpen && (
        <div className="nb-popup-overlay" onClick={() => setIsCreatorPopupOpen(false)}>
          <div className="nb-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="nb-popup-close" onClick={() => setIsCreatorPopupOpen(false)}>
              <X size={20} />
            </button>
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ 
                width: "48px", height: "48px", 
                background: "rgba(91,163,196,0.15)", 
                borderRadius: "50%", 
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem",
                color: "#5BA3C4"
              }}>
                <Phone size={24} />
              </div>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "18px", fontWeight: 600, color: "#fff" }}>
                Website Creator Contact
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
                For web development and technical inquiries:
              </p>
            </div>
            <a 
              href="tel:+919925650012" 
              style={{
                display: "inline-block",
                background: "#5BA3C4",
                color: "#0F191F",
                textDecoration: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "15px",
                marginTop: "0.5rem",
                transition: "opacity 0.2s"
              }}
             onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              +91 99256 50012
            </a>
          </div>
        </div>
      )}
    </>
  );
}