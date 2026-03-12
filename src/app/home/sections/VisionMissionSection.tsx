"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { TbMountain, TbEye, TbDiamond, TbTargetArrow } from "react-icons/tb";

const INFOGRAPHIC_DATA = [
  {
    id: "01",
    label: "Infographic",
    title: "Mission",
    desc: "Deliver high-quality pharmaceutical products that comply with strict regulatory standards and improve global health.",
    colors: { 
      main: "#12C2E9", 
      dark: "#0F9AB9", 
      arrowEnd: "#00F2FE",
      chevron: "#0E88A4"
    },
    icon: <TbMountain size={40} color="#FFFFFF" strokeWidth={1.5} />
  },
  {
    id: "02",
    label: "Infographic",
    title: "Vision",
    desc: "To be the most trusted global provider of advanced dermatologic and ophthalmic pharmaceutical solutions.",
    colors: { 
      main: "#FF8C00", 
      dark: "#E65100", 
      arrowEnd: "#FFA500",
      chevron: "#D84315" 
    },
    icon: <TbEye size={40} color="#FFFFFF" strokeWidth={1.5} />
  },
  {
    id: "03",
    label: "Infographic",
    title: "Value",
    desc: "Unwavering commitment to patient safety, ethical business practices, and continuous R&D innovation in every batch.",
    colors: { 
      main: "#E100FF", 
      dark: "#B400CC", 
      arrowEnd: "#FF007F",
      chevron: "#9000A3"
    },
    icon: <TbDiamond size={40} color="#FFFFFF" strokeWidth={1.5} />
  },
  {
    id: "04",
    label: "Infographic",
    title: "Goals",
    desc: "Expand global reach, uphold zero-defect manufacturing, and lead the market in accessible, effective medicine.",
    colors: { 
      main: "#004FF9", 
      dark: "#003FC6", 
      arrowEnd: "#00C9FF",
      chevron: "#002F94"
    },
    icon: <TbTargetArrow size={40} color="#FFFFFF" strokeWidth={1.5} />
  }
];

export default function VisionMissionInfographic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, 
        { opacity: 0, y: -20 }, 
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
      
      gsap.fromTo(cardsRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)", delay: 0.2 }
      );

      gsap.fromTo(".info-arrow-path",
        { strokeDasharray: 300, strokeDashoffset: 300 },
        { strokeDashoffset: 0, duration: 1.2, stagger: 0.15, ease: "power2.out", delay: 0.5 }
      );
      
      gsap.fromTo(".info-arrow-head",
        { opacity: 0, scale: 0.5, transformOrigin: "center" },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.15, ease: "back.out(2)", delay: 1.3 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} style={{ padding: "100px 2rem", background: "#FFFFFF", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        
        .info-header {
          text-align: center;
          margin-bottom: 80px;
        }
        
        .info-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 800;
          color: #2D3748;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0 0 10px 0;
        }

        .info-subtitle {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #718096;
          letter-spacing: 0.4em;
          text-transform: uppercase;
        }

        .info-grid {
          display: flex;
          justify-content: center;
          gap: 28px;
          max-width: 1240px;
          margin: 0 auto;
          flex-wrap: wrap;
        }

        .info-card-wrapper {
          position: relative;
          width: 270px;
          margin-top: 50px;
          margin-bottom: 30px;
        }

        .info-chevron {
          position: absolute;
          bottom: -24px;
          left: 0;
          width: 100%;
          height: 60px;
          clip-path: polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%);
          z-index: 1;
          border-radius: 0 0 12px 12px;
          transition: transform 0.3s ease;
        }

        .info-card {
          position: relative;
          background: #FFFFFF;
          border-radius: 20px;
          padding: 64px 24px 32px;
          text-align: center;
          z-index: 2;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .info-card-wrapper:hover .info-card {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
        }
        .info-card-wrapper:hover .info-chevron {
          transform: translateY(-5px);
        }

        .info-circle-wrap {
          position: absolute;
          top: -44px;
          left: 16px;
          z-index: 10;
        }

        .info-circle {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 3;
          box-shadow: inset 0 -4px 0 rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1);
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .info-card-wrapper:hover .info-circle {
          transform: scale(1.05) rotate(5deg);
        }

        .info-svg-arrow {
          position: absolute;
          top: 8px;
          left: -4px;
          z-index: 1;
          overflow: visible;
          pointer-events: none;
        }

        .info-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: #A0AEC0;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 8px;
        }

        .info-card-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #1A202C;
          margin: 0 0 16px 0;
        }

        .info-card-desc {
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          color: #718096;
          line-height: 1.6;
          margin: 0 0 24px 0;
          flex-grow: 1;
        }

        .info-divider {
          width: 100%;
          height: 1px;
          background: #E2E8F0;
          border: none;
          margin: 0 0 20px 0;
        }

        .info-number {
          font-family: 'Montserrat', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #2D3748;
        }

        @media (max-width: 1100px) {
          .info-svg-arrow { display: none; }
          .info-circle-wrap { left: 50%; transform: translateX(-50%); }
        }
      `}</style>

      <div className="info-header" ref={headerRef}>
        <h2 className="info-title">Our Mission</h2>
        <div className="info-subtitle">Infographic</div>
      </div>

      <div className="info-grid">
        {INFOGRAPHIC_DATA.map((d, i) => (
          <div 
            key={d.id} 
            className="info-card-wrapper"
            ref={(el) => { cardsRef.current[i] = el; }}
          >
            <div className="info-chevron" style={{ background: d.colors.chevron }} />
            
            <div className="info-card">
              <div className="info-circle-wrap">
                
                <svg className="info-svg-arrow" width="280" height="90" viewBox="0 0 280 90">
                  <defs>
                    <linearGradient id={`grad-${d.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={d.colors.main} />
                      <stop offset="100%" stopColor={d.colors.arrowEnd} />
                    </linearGradient>
                  </defs>
                  
                  <path 
                    className="info-arrow-path"
                    d="M 16 68 C 40 90, 80 85, 88 45 L 260 45" 
                    fill="none" 
                    stroke={`url(#grad-${d.id})`} 
                    strokeWidth="14" 
                    strokeLinecap="round" 
                  />
                  <polygon 
                    className="info-arrow-head"
                    points="253 32, 277 45, 253 58" 
                    fill={d.colors.arrowEnd} 
                  />
                </svg>

                <div 
                  className="info-circle" 
                  style={{ 
                    background: `linear-gradient(135deg, ${d.colors.main}, ${d.colors.dark})` 
                  }}
                >
                  {d.icon}
                </div>
              </div>

              <div className="info-label">{d.label}</div>
              <h3 className="info-card-title">{d.title}</h3>
              <p className="info-card-desc">{d.desc}</p>
              
              <hr className="info-divider" />
              <div className="info-number">{d.id}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}