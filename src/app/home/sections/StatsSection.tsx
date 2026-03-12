"use client";
import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#2C4A5C",
  accent:  "#5BA3C4",
};

// ─── Count-up hook ────────────────────────────────────────────────────────────
// "Ease-out cubic" curve: numbers fly up fast from 0 then decelerate
// smoothly as they approach the target — feels organic, not robotic.
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let raf: number;
    let startTime: number | null = null;

    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed  = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out: 1 - (1-t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setCount(target); // land exactly on the target
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);

  return count;
}

// ─── Single stat card ─────────────────────────────────────────────────────────
function StatCard({
  value,
  suffix,
  label,
  icon,
  started,
  delay,
}: {
  value:   number;
  suffix:  string;
  label:   string;
  icon:    React.ReactNode;
  started: boolean;
  delay:   number;
}) {
  // Each card begins counting after its own staggered delay,
  // so they roll in one after another left-to-right.
  const [delayedStart, setDelayedStart] = useState(false);
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setDelayedStart(true), delay);
    return () => clearTimeout(t);
  }, [started, delay]);

  const count = useCountUp(value, 2000, delayedStart);

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      alignItems:    "center",
      textAlign:     "center",
      padding:       "0 48px",
    }}>

      {/* Small icon badge above the number */}
      <div style={{
        width:          "46px",
        height:         "46px",
        borderRadius:   "12px",
        background:     "rgba(255,255,255,0.07)",
        border:         "1px solid rgba(255,255,255,0.13)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        marginBottom:   "18px",
      }}>
        {icon}
      </div>

      {/* The animated number — uses toLocaleString() so 1000 → "1,000" */}
      <div style={{
        fontFamily:    "'DM Serif Display', serif",
        fontSize:      "clamp(2.4rem, 4.5vw, 3.4rem)",
        fontWeight:    400,
        color:         "#fff",
        lineHeight:    1,
        letterSpacing: "-0.02em",
        minWidth:      "4ch",   // holds layout steady as digit count changes
        // Soft accent glow that appears once the number starts moving
        textShadow:    delayedStart ? "0 0 48px rgba(91,163,196,0.40)" : "none",
        transition:    "text-shadow 0.5s ease",
      }}>
        {count.toLocaleString()}{suffix}
      </div>

      {/* Accent underline that "grows in" when counting starts */}
      <div style={{
        height:          "2px",
        width:           delayedStart ? "36px" : "0px",
        background:      `linear-gradient(90deg, ${C.accent}, transparent)`,
        borderRadius:    "99px",
        margin:          "12px 0 10px",
        transition:      "width 0.7s cubic-bezier(0.22,1,0.36,1)",
        transitionDelay: `${delay}ms`,
      }}/>

      {/* Label — uppercase, muted */}
      <div style={{
        fontFamily:    "'DM Sans', sans-serif",
        fontSize:      "11.5px",
        fontWeight:    600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color:         "rgba(255,255,255,0.50)",
        lineHeight:    1.45,
        maxWidth:      "120px",
      }}>
        {label}
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Fire once when 30 % of the section enters the viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const STATS = [
    {
      value:  500,
      suffix: "+",
      label:  "Quality Products",
      delay:  0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"
            stroke="rgba(255,255,255,0.70)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      value:  10,
      suffix: "+",
      label:  "Years of Experience",
      delay:  150,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.70)" strokeWidth="1.8"/>
          <path d="M12 7v5l3 3" stroke="rgba(255,255,255,0.70)" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      value:  1000,
      suffix: "+",
      label:  "Healthcare Partners",
      delay:  300,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            stroke="rgba(255,255,255,0.70)" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="9" cy="7" r="4" stroke="rgba(255,255,255,0.70)" strokeWidth="1.8"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
            stroke="rgba(255,255,255,0.70)" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      value:  3,
      suffix: "",
      label:  "Therapeutic Segments",
      delay:  450,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="rgba(255,255,255,0.70)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <section
      ref={ref}
      style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, #1a3244 50%, #0f2535 100%)`,
        padding:    "80px 2rem",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

        /* Dot-grid atmosphere behind the numbers */
        .ss-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(91,163,196,0.11) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        /* Vignette fades dots at edges so they don't compete with numbers */
        .ss-dots::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(15,37,53,0.85) 100%);
        }

        /* Gradient vertical dividers between stats */
        .ss-div {
          width: 1px; height: 64px; flex-shrink: 0;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.18), transparent);
        }

        @media(max-width: 768px) {
          .ss-row { flex-wrap: wrap !important; gap: 44px !important; justify-content: center !important; }
          .ss-div  { display: none !important; }
          .ss-cell { padding: 0 24px !important; }
        }
      `}</style>

      {/* Dot grid */}
      <div className="ss-dots" />

      {/* Soft top-centre radial glow */}
      <div style={{
        position:      "absolute",
        top:           "-80px",
        left:          "50%",
        transform:     "translateX(-50%)",
        width:         "640px",
        height:        "320px",
        background:    "radial-gradient(ellipse at 50% 0%, rgba(91,163,196,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>

      <div
        className="ss-row"
        style={{
          maxWidth:       "1340px",
          margin:         "0 auto",
          display:        "flex",
          justifyContent: "center",
          alignItems:     "center",
          position:       "relative",
        }}
      >
        {STATS.map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
            <div className="ss-cell" style={{ padding: "0 48px" }}>
              <StatCard {...s} started={inView} />
            </div>
            {i < STATS.length - 1 && <div className="ss-div" />}
          </div>
        ))}
      </div>
    </section>
  );
}