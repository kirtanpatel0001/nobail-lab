"use client";

import { useEffect, useState, useRef } from "react";
import { motion, Variants } from "framer-motion";

// Ensure 'as const' is used for the easing array so TypeScript types it as a tuple
const T = {
  primary:      "#2C4A5C",
  primaryLight: "#EBF3F7",
  accent:       "#5BA3C4",
  bg:           "#FFFFFF",
  bgAlt:        "#F8FAFC",
  textPrimary:  "#1A2E38",
  textMuted:    "#6B8A99",
  border:       "#DDE6EA",
  easing:       [0.22, 1, 0.36, 1] as const,
};

// --- Hero Floating Particles ---
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 150 };

    const resize = () => {
      canvas.width = canvas.parentElement!.offsetWidth;
      canvas.height = canvas.parentElement!.offsetHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 3.5 + 1; 
        this.speedX = (Math.random() - 0.5) * 0.7;
        this.speedY = (Math.random() - 0.5) * 0.7;
        this.opacity = Math.random() * 0.6 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas!.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.speedY *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= forceDirectionX * force * 2;
            this.y -= forceDirectionY * force * 2;
          }
        }
      }

      draw() {
        ctx!.fillStyle = `rgba(91,163,196,${this.opacity})`;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 18000); 
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', resize);
    canvas.parentElement.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (canvas && canvas.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
        canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
}

// Expanded Data Structures
const principles = [
  { id: "01", title: "Scientific Excellence", desc: "Rigorous R&D and analytical testing at every stage to ensure unmatched pharmacological efficacy." },
  { id: "02", title: "Patient First", desc: "Every formulation is designed with the ultimate goal of improving patient outcomes and quality of life." },
  { id: "03", title: "Ethical Integrity", desc: "Unwavering commitment to transparency, WHO-GMP compliance, and responsible manufacturing practices." },
  { id: "04", title: "Sustainable Practices", desc: "Dedicated to eco-friendly manufacturing processes and minimizing our environmental footprint in Surat." },
  { id: "05", title: "Collaborative Innovation", desc: "Partnering with global healthcare professionals to develop targeted, need-based therapeutics." },
  { id: "06", title: "Regulatory Precision", desc: "Exceeding international standards with continuous audits, cleanroom protocols, and automated traceability." }
];

const objectives = [
  { phase: "01", title: "R&D Expansion", desc: "Scaling our analytical laboratories in Gujarat to pioneer novel drug delivery systems." },
  { phase: "02", title: "Advanced Formulations", desc: "Focusing heavily on sustained-release ophthalmic and highly-bioavailable dermatological solutions." },
  { phase: "03", title: "Global Penetration", desc: "Expanding our therapeutic reach across pan-India and penetrating emerging international healthcare markets." }
];

export default function VisionMissionPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: T.easing } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  if (!mounted) return null;

  return (
    <main style={{ background: T.bg, overflow: "hidden" }}>
      <style>{`
        .vm-hero {
          position: relative;
          padding: 160px 2rem 100px;
          text-align: center;
          background: radial-gradient(ellipse at top, rgba(91,163,196,0.08) 0%, transparent 70%);
          overflow: hidden;
        }
        
        .vm-hero-inner {
          position: relative;
          z-index: 1;
          pointer-events: none;
        }

        .vm-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: #fff;
          border: 1px solid ${T.border};
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${T.primary};
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          pointer-events: auto;
        }

        .vm-hero-title {
          font-family: var(--font-geist-sans), serif;
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 800;
          color: ${T.textPrimary};
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin-bottom: 1.5rem;
        }

        .gradient-text {
          background: linear-gradient(90deg, ${T.primary}, ${T.accent});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .vm-hero-sub {
          font-size: 1.15rem;
          color: ${T.textMuted};
          line-height: 1.7;
          max-width: 650px;
          margin: 0 auto;
        }

        /* Split Sections */
        .split-section {
          padding: 120px 2rem;
          position: relative;
          z-index: 1;
        }

        .split-grid {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 5rem;
          align-items: center;
        }
        
        .split-grid.reverse {
          grid-template-columns: 1.2fr 1fr;
        }

        .split-content h2 {
          font-size: clamp(2rem, 3.5vw, 3.5rem);
          font-weight: 800;
          color: ${T.primary};
          margin-bottom: 1.5rem;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .split-content p {
          font-size: 1.15rem;
          color: ${T.textMuted};
          line-height: 1.8;
        }

        .split-visual {
          position: relative;
          aspect-ratio: 4/4;
          border-radius: 32px;
          background: ${T.bg};
          border: 1px solid ${T.border};
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(44,74,92,0.12);
        }

        .visual-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.6;
        }

        /* Quote Section */
        .quote-section {
          padding: 100px 2rem;
          background: ${T.primary};
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .quote-text {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          color: #fff;
          line-height: 1.4;
          font-style: italic;
          max-width: 900px;
          margin: 0 auto 2rem;
          position: relative;
          z-index: 1;
        }

        /* Pillars */
        .pillars-section {
          padding: 120px 2rem;
          background: ${T.bgAlt};
          border-top: 1px solid ${T.border};
          position: relative;
          z-index: 1;
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          max-width: 1240px;
          margin: 4rem auto 0;
        }

        .pillar-card {
          background: ${T.bg};
          border: 1px solid ${T.border};
          border-radius: 24px;
          padding: 3rem 2.5rem;
          position: relative;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
        }

        .pillar-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 24px 48px rgba(44,74,92,0.12);
          border-color: ${T.accent}40;
        }

        .pillar-num {
          font-size: 3.5rem;
          font-weight: 800;
          color: ${T.primaryLight};
          line-height: 1;
          margin-bottom: 1.25rem;
          letter-spacing: -0.05em;
          transition: color 0.3s;
        }
        
        .pillar-card:hover .pillar-num {
          color: rgba(91,163,196,0.2);
        }

        .pillar-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: ${T.primary};
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .pillar-desc {
          font-size: 1.05rem;
          color: ${T.textMuted};
          line-height: 1.7;
        }

        /* Objectives Section */
        .objectives-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1240px;
          margin: 4rem auto 0;
        }

        .objective-step {
          position: relative;
          padding-top: 2rem;
          border-top: 2px solid ${T.border};
        }

        .objective-step::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 0;
          width: 10px;
          height: 10px;
          background: ${T.accent};
          border-radius: 50%;
          box-shadow: 0 0 0 4px ${T.bg};
        }

        @media (max-width: 900px) {
          .split-grid { grid-template-columns: 1fr; gap: 4rem; text-align: center; }
          .split-grid.reverse .split-content { order: 1; }
          .split-grid.reverse .split-visual { order: 2; }
          .split-visual { aspect-ratio: 4/3; }
          .objectives-grid { grid-template-columns: 1fr; }
          .objective-step { border-top: none; border-left: 2px solid ${T.border}; padding-top: 0; padding-left: 2.5rem; padding-bottom: 2.5rem; }
          .objective-step::before { top: 0; left: -6px; }
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="vm-hero">
        <FloatingParticles />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="vm-hero-inner">
          <motion.div variants={fadeUp}>
            <span className="vm-eyebrow">
              <span style={{ width: 8, height: 8, background: T.accent, borderRadius: "50%" }} />
              Purpose & Direction
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="vm-hero-title">
            Shaping the Future <br />
            <span className="gradient-text">of Healthcare.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="vm-hero-sub">
            At Nobil Laboratories, our foundation is built on scientific integrity and an unwavering commitment to improving human life through advanced, zero-defect formulations.
          </motion.p>
        </motion.div>
      </section>

      {/* THE VISION */}
      <section className="split-section">
        <div className="split-grid">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="split-content"
          >
            <div style={{ color: T.accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", fontSize: "0.8rem" }}>Our Vision</div>
            <h2>To be India's premier partner in advanced therapeutics.</h2>
            <p>
              We envision a world where high-quality, specialized healthcare is universally accessible. By bridging the gap between cutting-edge research and scalable manufacturing, Nobil Laboratories aims to set the global benchmark for ophthalmic and dermatologic excellence.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="split-visual"
          >
            <div className="visual-blob" style={{ background: T.accent, width: "60%", height: "60%", top: "10%", left: "20%" }} />
            <div className="visual-blob" style={{ background: T.primary, width: "50%", height: "50%", bottom: "10%", right: "10%" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: T.textPrimary, fontWeight: 600, background: "rgba(255,255,255,0.4)", backdropFilter: "blur(20px)" }}>
              [ Vision Abstract / Lab Image ]
            </div>
          </motion.div>
        </div>
      </section>

      {/* LEADERSHIP QUOTE */}
      <section className="quote-section">
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 150%, rgba(91,163,196,0.3) 0%, transparent 60%)` }} />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div style={{ width: 40, height: 40, margin: "0 auto 1.5rem", color: T.accent }}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
          </div>
          <p className="quote-text">
            "True innovation in healthcare is achieved when uncompromising scientific rigor meets an unwavering dedication to patient well-being. That is the standard we uphold every day."
          </p>
          <div style={{ color: T.accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.85rem" }}>
            The Nobil Commitment
          </div>
        </motion.div>
      </section>

      {/* THE MISSION */}
      <section className="split-section" style={{ background: T.bgAlt, borderBottom: `1px solid ${T.border}` }}>
        <div className="split-grid reverse">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="split-visual"
          >
            <div className="visual-blob" style={{ background: T.primary, width: "60%", height: "60%", top: "20%", left: "10%" }} />
            <div className="visual-blob" style={{ background: T.accent, width: "40%", height: "40%", bottom: "20%", right: "20%", opacity: 0.4 }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: T.textPrimary, fontWeight: 600, background: "rgba(255,255,255,0.4)", backdropFilter: "blur(20px)" }}>
              [ Mission Abstract / Facility Image ]
            </div>
          </motion.div>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="split-content"
          >
            <div style={{ color: T.primary, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", fontSize: "0.8rem" }}>Our Mission</div>
            <h2>Engineering solutions with uncompromising quality.</h2>
            <p>
              Our daily mission is to research, develop, and manufacture pharmaceutical formulations that strictly adhere to WHO-GMP guidelines. We commit to delivering zero-defect medicines to healthcare professionals, ensuring safety, efficacy, and absolute trust in every batch produced.
            </p>
          </motion.div>
        </div>
      </section>

      {/* GUIDING PRINCIPLES (6 Cards) */}
      <section className="pillars-section">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}
        >
          <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 800, color: T.textPrimary, marginBottom: "1rem", letterSpacing: "-0.04em" }}>
            Our Core Pillars
          </h2>
          <p style={{ color: T.textMuted, fontSize: "1.15rem" }}>
            The fundamental values that dictate our processes, our culture, and our commitment to advancing public health.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          className="pillars-grid"
        >
          {principles.map((p) => (
            <motion.div key={p.id} variants={fadeUp} className="pillar-card">
              <div className="pillar-num">{p.id}</div>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-desc">{p.desc}</p>
              
              <div style={{ position: "absolute", bottom: -20, right: -20, width: "140px", height: "140px", background: `radial-gradient(circle at 100% 100%, ${T.primaryLight}, transparent)`, opacity: 0.5, pointerEvents: "none" }} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* STRATEGIC OBJECTIVES */}
      <section style={{ padding: "120px 2rem", background: T.bg }}>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          style={{ maxWidth: "1240px", margin: "0 auto" }}
        >
          <div style={{ color: T.accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", fontSize: "0.8rem" }}>Strategic Roadmap</div>
          <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 800, color: T.textPrimary, marginBottom: "1rem", letterSpacing: "-0.04em" }}>
            Future Objectives
          </h2>
          <p style={{ color: T.textMuted, fontSize: "1.15rem", maxWidth: "600px" }}>
            A structured approach to expanding our capabilities, increasing our footprint, and delivering continuous innovation.
          </p>

          <motion.div variants={staggerContainer} className="objectives-grid">
            {objectives.map((obj, i) => (
              <motion.div key={i} variants={fadeUp} className="objective-step">
                <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: "1.2rem", fontWeight: 700, color: T.accent, marginBottom: "0.5rem" }}>{obj.phase}</div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: T.primary, marginBottom: "1rem" }}>{obj.title}</h3>
                <p style={{ color: T.textMuted, lineHeight: 1.7 }}>{obj.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

    </main>
  );
}