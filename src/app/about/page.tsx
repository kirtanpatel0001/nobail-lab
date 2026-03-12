"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Target, ShieldCheck, Lightbulb, 
  Eye, Droplets, Pill, FlaskConical, 
  Award, CheckCircle2, Wind, ThermometerSun, LucideIcon
} from "lucide-react";

// Add "as const" so TS knows these are readonly literals and exact tuples
const T = {
  primary:      "#2C4A5C",
  primaryHover: "#3D6478",
  primaryLight: "#EBF3F7",
  accent:       "#5BA3C4",
  accentDeep:   "#3D7FA0",
  bg:           "#FFFFFF",
  bgAlt:        "#F4F8FA",
  textPrimary:  "#1A2E38",
  textMuted:    "#6B8A99",
  textSubtle:   "#A8BEC8",
  border:       "#DDE6EA",
  easing:       [0.22, 1, 0.36, 1] as const, 
};

// --- Hero Only Floating Particles ---
function FloatingParticles() {
  // Explicitly type the ref as HTMLCanvasElement
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // Ensure canvas and its parent exist before running logic
    if (!canvas || !canvas.parentElement) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 150 };

    const resize = () => {
      // TypeScript now knows parentElement exists because of the early return check
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
        // Assert canvas exists for the compiler
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

// Interfaces for structured data
interface ValueProp {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const storyMilestones = [
  { year: "2011", title: "The Inception", desc: "Founded in Surat, Gujarat with a singular focus on high-precision ophthalmic formulations to address critical eye care needs." },
  { year: "2016", title: "Expanding Horizons", desc: "Commissioned our first Class 100 cleanroom, successfully scaling production into dermatology and general therapeutics." },
  { year: "2021", title: "Global Standards", desc: "Achieved WHO-GMP certification, standardizing strict batch-to-batch consistency across a growing portfolio of 120+ formulations." },
  { year: "Today", title: "Pioneering the Future", desc: "Operating a state-of-the-art R&D pipeline dedicated to novel drug delivery systems and enhanced bioavailability." }
];

const values: ValueProp[] = [
  { icon: Target, title: "Precision", desc: "Rigorous quality control in every formulation we develop, ensuring batch-to-batch consistency." },
  { icon: ShieldCheck, title: "Integrity", desc: "Transparent processes, ethical sourcing, and uncompromising standards in patient care." },
  { icon: Lightbulb, title: "Innovation", desc: "Advanced R&D driving next-generation therapeutic and ophthalmic solutions." },
];

const therapeutics = [
  { id: "oph", icon: Eye, title: "Ophthalmic Care", desc: "Sterile eye drops, ointments, and advanced ocular therapeutics designed to treat infections, glaucoma, and dry eye syndromes with high bioavailability.", span: "col-span-2 row-span-2", bg: "linear-gradient(135deg, #2C4A5C 0%, #1A2E38 100%)", color: "#fff" },
  { id: "der", icon: Droplets, title: "Dermatology", desc: "Topical creams, gels, and lotions formulated for optimal skin penetration and rapid relief.", span: "col-span-1 row-span-1", bg: T.bg, color: T.primary },
  { id: "gen", icon: Pill, title: "General Therapeutics", desc: "Oral solids and liquid formulations addressing broad-spectrum healthcare needs.", span: "col-span-1 row-span-1", bg: T.bg, color: T.primary },
  { id: "rnd", icon: FlaskConical, title: "R&D Pipeline", desc: "Continuous investment in novel drug delivery systems and sustained-release formulations.", span: "col-span-2 row-span-1", bg: T.primaryLight, color: T.primary },
];

const qualityFeatures = [
  { icon: Award, title: "WHO-GMP Compliant", desc: "Adhering to strict global manufacturing practices." },
  { icon: CheckCircle2, title: "ISO 9001:2015", desc: "Certified quality management systems across all plants." },
  { icon: Wind, title: "Class 100 Cleanrooms", desc: "Ultra-sterile environments for ophthalmic production." },
  { icon: ThermometerSun, title: "In-house Stability", desc: "Real-time shelf-life testing in diverse climatic zones." }
];

const stats = [
  { label: "Years of Excellence", value: "15+" },
  { label: "Formulations", value: "120+" },
  { label: "Global Partners", value: "40+" },
];

function SpotlightCard({ v }: { v: ValueProp }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      style={{
        background: T.bg, padding: "40px 32px", borderRadius: 24,
        border: `1px solid ${T.border}`, position: "relative",
        overflow: "hidden", display: "flex", flexDirection: "column",
        cursor: "default", zIndex: 1
      }}
      whileHover={{ y: -6, borderColor: T.accent, boxShadow: "0 20px 40px rgba(44,74,92,0.08)" }}
      transition={{ duration: 0.3, ease: T.easing }}
    >
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity,
        background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(91,163,196,0.08), transparent 40%)`,
        transition: "opacity 0.4s ease"
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: T.primaryLight,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
          color: T.accentDeep
        }}>
          <v.icon size={28} strokeWidth={1.8} />
        </div>
        <h3 style={{
          fontFamily:"var(--font-geist-sans)", fontSize: 22, fontWeight: 800,
          color: T.textPrimary, marginBottom: 12, letterSpacing: "-0.02em"
        }}>{v.title}</h3>
        <p style={{
          fontFamily:"var(--font-geist-sans)", fontSize: 15, color: T.textMuted, lineHeight: 1.7
        }}>{v.desc}</p>
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  const [activeQuality, setActiveQuality] = useState(0);

  useEffect(() => setMounted(true), []);

  // Explicitly type the Framer Motion variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: T.easing } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const staggerBento: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  if (!mounted) return null;

  return (
    <main style={{ background: T.bg, position: "relative", overflow: "hidden" }}>
      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 240px;
          gap: 24px;
        }
        .bento-card {
          border-radius: 24px; padding: 40px; position: relative;
          overflow: hidden; display: flex; flexDirection: column;
          border: 1px solid ${T.border};
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
        }
        .bento-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 24px 48px rgba(44,74,92,0.12);
          border-color: ${T.accent}40;
        }
        .col-span-2 { grid-column: span 2; }
        .col-span-1 { grid-column: span 1; }
        .row-span-2 { grid-row: span 2; }
        .row-span-1 { grid-row: span 1; }
        
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: 1fr; grid-auto-rows: auto; }
          .col-span-2, .col-span-1 { grid-column: span 1; }
          .row-span-2, .row-span-1 { grid-row: auto; }
          .bento-card { padding: 32px; min-height: 240px; }
          .story-grid { grid-template-columns: 1fr !important; }
        }

        .gradient-text {
          background: linear-gradient(90deg, ${T.primary}, ${T.accent});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* SECTION 1: Hero */}
      <section style={{ position: "relative", padding: "160px 2rem 80px", textAlign: "center", overflow: "hidden" }}>
        
        {/* Interactive Canvas Background - Scoped to Hero */}
        <FloatingParticles />

        <div style={{ position: "absolute", top: -150, left: "50%", transform: "translateX(-50%)", width: 800, height: 800, background: `radial-gradient(circle, ${T.primaryLight} 0%, transparent 70%)`, opacity: 0.6, zIndex: 0, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${T.border} 1px, transparent 1px), linear-gradient(90deg, ${T.border} 1px, transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.3, zIndex: 0, pointerEvents: "none", maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)" }} />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", pointerEvents: "none" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", background: "#fff", border: `1px solid ${T.border}`, color: T.accentDeep, borderRadius: 100, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 32, boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, display: "inline-block" }} />
            About Nobil Laboratories
          </span>
          <h1 style={{
            fontFamily:"var(--font-geist-sans)", fontSize:"clamp(3rem, 6vw, 5rem)",
            fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 32
          }}>
            Pioneering Healthcare <br />
            <span className="gradient-text">With Purpose.</span>
          </h1>
          <p style={{
            fontFamily:"var(--font-geist-sans)", fontSize: 18, color: T.textMuted,
            lineHeight: 1.7, maxWidth: 700, margin: "0 auto 48px"
          }}>
            Based in Surat, Gujarat, Nobil Laboratories bridges the gap between scientific innovation and accessible healthcare. We engineer high-efficacy pharmaceutical formulations trusted by medical professionals.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "3vw", flexWrap: "wrap", pointerEvents: "auto" }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: T.primary, fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.03em" }}>{stat.value}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: Our Story / Origin */}
      <section style={{ padding: "80px 2rem 120px", background: T.bg, borderTop: `1px solid ${T.border}`, position: "relative", zIndex: 1 }}>
        <div className="story-grid" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
          
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: T.easing }}>
            <h2 style={{
              fontFamily:"var(--font-geist-sans)", fontSize:"clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 32
            }}>
              Our Journey <br />
              <span style={{ color: T.textMuted, fontWeight: 400 }}>From Vision to Reality</span>
            </h2>
            
            <div style={{ position: "relative", paddingLeft: 24, borderLeft: `2px solid ${T.border}` }}>
              {storyMilestones.map((milestone, idx) => (
                <div key={idx} style={{ position: "relative", marginBottom: idx === storyMilestones.length - 1 ? 0 : 40 }}>
                  <div style={{ position: "absolute", left: -31, top: 4, width: 12, height: 12, borderRadius: "50%", background: T.accent, border: `3px solid ${T.bg}` }} />
                  <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 14, fontWeight: 700, color: T.accent, letterSpacing: "0.05em" }}>{milestone.year}</span>
                  <h4 style={{ fontFamily: "var(--font-geist-sans)", fontSize: 20, fontWeight: 800, color: T.textPrimary, marginTop: 4, marginBottom: 8 }}>{milestone.title}</h4>
                  <p style={{ fontFamily: "var(--font-geist-sans)", fontSize: 15, color: T.textMuted, lineHeight: 1.6 }}>{milestone.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: T.easing }}>
             <div style={{
                width: "100%", aspectRatio: "4/5", background: T.bgAlt, borderRadius: 24,
                border: `1px solid ${T.border}`, overflow: "hidden", position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(91,163,196,0.1) 0%, transparent 70%)" }} />
                <p style={{ fontFamily:"var(--font-geist-sans)", fontSize: 14, color: T.textMuted, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  [ Replace with Image ]
                </p>
             </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 3: Core Values */}
      <section style={{ background: T.bgAlt, padding: "120px 2rem", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}
          >
            {values.map((v, i) => (
              <motion.div key={i} variants={fadeUp}>
                <SpotlightCard v={v} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: Therapeutic Focus (Bento Grid) */}
      <section style={{ padding: "120px 2rem", background: T.bg, position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ marginBottom: 64 }}>
            <h2 style={{
              fontFamily:"var(--font-geist-sans)", fontSize:"clamp(2.5rem, 4vw, 3.5rem)",
              fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.04em", lineHeight: 1.1
            }}>
              Therapeutic Focus
            </h2>
            <p style={{ fontFamily:"var(--font-geist-sans)", fontSize: 18, color: T.textMuted, marginTop: 16, maxWidth: 600, lineHeight: 1.6 }}>
              Specialized divisions engineered to target distinct medical requirements with uncompromising precision and bioavailability.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerBento}
            className="bento-grid"
          >
            {therapeutics.map((item) => (
              <motion.div 
                key={item.id} variants={fadeUp} className={`bento-card ${item.span}`}
                style={{ background: item.bg, color: item.color }}
              >
                <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: item.id === 'oph' ? "rgba(255,255,255,0.1)" : T.bgAlt, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "auto" }}>
                    <item.icon size={24} color={item.id === 'oph' ? "#fff" : T.accentDeep} strokeWidth={2} />
                  </div>
                  <div style={{ marginTop: 32 }}>
                    <h3 style={{
                      fontFamily:"var(--font-geist-sans)", fontSize: item.id === 'oph' ? 32 : 22, 
                      fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em"
                    }}>{item.title}</h3>
                    <p style={{
                      fontFamily:"var(--font-geist-sans)", fontSize: 16, opacity: item.id === 'oph' ? 0.9 : 0.7, 
                      lineHeight: 1.6, maxWidth: item.id === 'oph' ? "85%" : "100%"
                    }}>{item.desc}</p>
                  </div>
                </div>
                {item.id === 'oph' && (
                  <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(91,163,196,0.3) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }} />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: Manufacturing & Quality */}
      <section style={{ padding: "120px 2rem", background: T.bgAlt, position: "relative", zIndex: 1 }}>
        <div style={{
          maxWidth: 1240, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 80, alignItems: "center"
        }}>
          <motion.div 
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} transition={{ duration: 0.8, ease: T.easing }}
            style={{ flex: "1 1 450px" }}
          >
            <h2 style={{
              fontFamily:"var(--font-geist-sans)", fontSize:"clamp(2.5rem, 4vw, 3.5rem)",
              fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.04em", marginBottom: 32, lineHeight: 1.1
            }}>
              Uncompromising <br/>Quality Standards
            </h2>
            <p style={{
              fontFamily:"var(--font-geist-sans)", fontSize: 18, color: T.textMuted, lineHeight: 1.7, marginBottom: 40
            }}>
              Hover over our core capabilities below to see how our Surat-based facilities comply strictly with global guidelines and automated traceability.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {qualityFeatures.map((item, i) => (
                <div 
                  key={i} 
                  onMouseEnter={() => setActiveQuality(i)}
                  style={{ 
                    display: "flex", alignItems: "center", gap: 20, padding: "20px 24px",
                    background: activeQuality === i ? T.bg : "transparent",
                    border: `1px solid ${activeQuality === i ? T.accent : "transparent"}`,
                    borderRadius: 16, cursor: "pointer", transition: "all 0.3s ease",
                    boxShadow: activeQuality === i ? "0 12px 32px rgba(44,74,92,0.08)" : "none"
                  }}
                >
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 12, 
                    background: activeQuality === i ? T.primary : T.primaryLight,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: activeQuality === i ? "#fff" : T.primary,
                    transition: "all 0.3s ease"
                  }}>
                    <item.icon size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontFamily:"var(--font-geist-sans)", fontSize: 17, color: T.textPrimary, fontWeight: 800, letterSpacing: "-0.01em" }}>{item.title}</div>
                    <div style={{ fontFamily:"var(--font-geist-sans)", fontSize: 14, color: T.textMuted, marginTop: 4 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} transition={{ duration: 0.8, ease: T.easing }}
            style={{ flex: "1 1 500px", position: "relative" }}
          >
            <div style={{
              width: "100%", aspectRatio: "4/4", background: T.bg, borderRadius: 32,
              border: `1px solid ${T.border}`, overflow: "hidden", position: "relative",
              boxShadow: "0 24px 64px rgba(44,74,92,0.12)", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.4, background: "radial-gradient(circle at 50% 50%, rgba(91,163,196,0.2) 0%, transparent 60%)" }} />
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeQuality}
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
                  transition={{ duration: 0.4, ease: T.easing }}
                  style={{
                    position: "absolute", inset: 0, display: "flex", flexDirection: "column", 
                    alignItems: "center", justifyContent: "center", textAlign: "center", padding: 48
                  }}
                >
                  <div style={{ width: 120, height: 120, borderRadius: "50%", background: T.primaryLight, marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "center", color: T.accentDeep, boxShadow: `0 0 0 16px ${T.bgAlt}` }}>
                    {(() => {
                      const Icon = qualityFeatures[activeQuality].icon;
                      return <Icon size={56} strokeWidth={1.5} />;
                    })()}
                  </div>
                  <h4 style={{ fontFamily:"var(--font-geist-sans)", fontSize: 28, fontWeight: 800, color: T.textPrimary, marginBottom: 16, letterSpacing: "-0.03em" }}>
                    {qualityFeatures[activeQuality].title}
                  </h4>
                  <p style={{ fontFamily:"var(--font-geist-sans)", fontSize: 16, color: T.textMuted, lineHeight: 1.7, maxWidth: 300 }}>
                    {qualityFeatures[activeQuality].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}