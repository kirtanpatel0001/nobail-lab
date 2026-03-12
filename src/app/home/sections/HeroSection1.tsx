// "use client";

// import { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import Link from "next/link";

// const T = {
//   primary:      "#2C4A5C",
//   primaryHover: "#3D6478",
//   primaryLight: "#EBF3F7",
//   accent:       "#5BA3C4",
//   accentDeep:   "#3D7FA0",
//   bg:           "#FFFFFF",
//   textPrimary:  "#1A2E38",
//   textMuted:    "#6B8A99",
//   textSubtle:   "#A8BEC8",
//   border:       "#DDE6EA",
//   easing:       [0.22, 1, 0.36, 1],
// };

// const stats = [
//   { val: "500+", label: "Products"  },
//   { val: "15+",  label: "Years"     },
//   { val: "GMP",  label: "Certified" },
//   { val: "WHO",  label: "Compliant" },
// ];

// function ParticleCanvas() {
//   const canvasRef = useRef(null);
//   const animRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     let time = 0;

//     const resize = () => {
//       canvas.width = canvas.offsetWidth;
//       canvas.height = canvas.offsetHeight;
//     };
//     resize();
//     window.addEventListener("resize", resize);

//     const draw = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       time += 0.015; // Rotation speed

//       // Position DNA on the right side (75% of screen width)
//       const centerX = canvas.width > 768 ? canvas.width * 0.75 : canvas.width * 0.5;
//       const centerY = canvas.height / 2;
      
//       // Scale helix size based on screen
//       const amplitude = Math.min(canvas.width * 0.12, 180); 
//       const ySpacing = 18; // Vertical gap between dots
//       const numDots = Math.floor(canvas.height / ySpacing) + 4;
//       const frequency = 0.035; // How tight the spiral is
//       const startY = (canvas.height - (numDots * ySpacing)) / 2;

//       for (let i = 0; i < numDots; i++) {
//         const y = startY + i * ySpacing;
//         const angle1 = time + i * frequency * Math.PI;
//         const angle2 = angle1 + Math.PI; // 180 degrees out of phase for second strand

//         // X positions
//         const x1 = centerX + Math.cos(angle1) * amplitude;
//         const x2 = centerX + Math.cos(angle2) * amplitude;
        
//         // Z positions (for 3D depth scaling)
//         const z1 = Math.sin(angle1);
//         const z2 = Math.sin(angle2);

//         // Calculate visual scale and opacity based on Z depth
//         const scale1 = (z1 + 1.5) / 2.5; 
//         const scale2 = (z2 + 1.5) / 2.5;
//         const alpha1 = Math.max(0.2, (z1 + 1) / 2);
//         const alpha2 = Math.max(0.2, (z2 + 1) / 2);

//         // Draw base pairs (connecting lines)
//         if (i % 2 === 0) {
//           ctx.beginPath();
//           ctx.moveTo(x1, y);
//           ctx.lineTo(x2, y);
//           // Fade connection lines when they rotate to the back
//           const lineAlpha = (alpha1 + alpha2) / 2 * 0.25; 
//           ctx.strokeStyle = `rgba(91,163,196,${lineAlpha})`;
//           ctx.lineWidth = 1.5;
//           ctx.stroke();
//         }

//         // Draw Strand 1 dots
//         ctx.beginPath();
//         ctx.arc(x1, y, 3.5 * scale1, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(91,163,196,${alpha1})`; // Accent color
//         ctx.fill();

//         // Draw Strand 2 dots
//         ctx.beginPath();
//         ctx.arc(x2, y, 3.5 * scale2, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(44,74,92,${alpha2})`; // Primary color
//         ctx.fill();
//       }

//       animRef.current = requestAnimationFrame(draw);
//     };
//     draw();

//     return () => {
//       cancelAnimationFrame(animRef.current);
//       window.removeEventListener("resize", resize);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         position: "absolute", inset: 0,
//         width: "100%", height: "100%",
//         pointerEvents: "none",
//         zIndex: 0,
//       }}
//     />
//   );
// }

// export default function HeroSection() {
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   return (
//     <section style={{
//       minHeight:   "72vh",
//       paddingTop:  60,
//       background:  T.bg,
//       display:     "flex",
//       alignItems:  "center",
//       position:    "relative",
//       overflow:    "hidden",
//     }}>
//       <style>{`
//         .h-btn-p {
//           display:inline-flex;align-items:center;gap:10px;padding:11px 24px;
//           background:${T.primary};color:#fff;border-radius:8px;
//           font-family:var(--font-geist-sans);font-weight:600;font-size:13px;
//           letter-spacing:0.02em;text-decoration:none;
//           box-shadow:0 4px 18px rgba(44,74,92,0.22);
//           transition:background 0.2s,transform 0.18s,box-shadow 0.2s;
//         }
//         .h-btn-p:hover{background:${T.primaryHover};transform:translateY(-2px);box-shadow:0 8px 28px rgba(44,74,92,0.28);}
//         .h-btn-g {
//           display:inline-flex;align-items:center;gap:10px;padding:10px 22px;
//           border:1.5px solid ${T.border};color:${T.textMuted};border-radius:8px;
//           font-family:var(--font-geist-sans);font-weight:600;font-size:13px;
//           text-decoration:none;background:transparent;
//           transition:border-color 0.18s,color 0.18s,background 0.18s,transform 0.18s;
//         }
//         .h-btn-g:hover{border-color:${T.accent};color:${T.primary};background:${T.primaryLight};transform:translateY(-2px);}
//       `}</style>

//       {/* Particle canvas — fills entire section */}
//       <ParticleCanvas />

//       {/* Radial glow overlay */}
//       <div aria-hidden style={{
//         position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
//         background:"radial-gradient(ellipse at 50% 0%, rgba(91,163,196,0.08) 0%, transparent 65%)",
//       }}/>

//       <div style={{
//         maxWidth: 1340, margin: "0 auto",
//         padding: "56px 2rem",
//         width: "100%", position: "relative", zIndex: 1,
//       }}>

//         {/* Eyebrow pill */}
//         <motion.div
//           initial={{ opacity:0, y:16 }}
//           animate={mounted ? { opacity:1, y:0 } : {}}
//           transition={{ duration:0.5, ease:T.easing }}
//           style={{
//             display:"inline-flex", alignItems:"center", gap:8,
//             padding:"4px 13px",
//             background:"rgba(91,163,196,0.09)",
//             border:"1px solid rgba(91,163,196,0.26)",
//             borderRadius:100, marginBottom:18,
//           }}
//         >
//           <span style={{ width:6, height:6, borderRadius:"50%", background:T.accent, display:"inline-block" }}/>
//           <span style={{
//             fontFamily:"var(--font-geist-sans)", fontSize:11, fontWeight:700,
//             color:T.accentDeep, letterSpacing:"0.10em", textTransform:"uppercase",
//           }}>Nobil Laboratories · Surat, India</span>
//         </motion.div>

//         {/* Headline */}
//         {[["Noble","Science."],["Trusted","Care."]].map((row, ri) => (
//           <div key={ri} style={{ marginBottom: ri === 0 ? 4 : 24 }}>
//             {row.map((word, wi) => (
//               <motion.span key={word}
//                 initial={{ opacity:0, y:40, skewY:3 }}
//                 animate={mounted ? { opacity:1, y:0, skewY:0 } : {}}
//                 transition={{ duration:0.68, delay:0.08+ri*0.22+wi*0.11, ease:T.easing }}
//                 style={{
//                   display:"inline-block", marginRight:12,
//                   fontFamily:"var(--font-geist-sans)",
//                   fontSize:"clamp(2.4rem, 5.5vw, 4.6rem)",
//                   fontWeight: ri===0 ? 800 : 300,
//                   letterSpacing: ri===0 ? "-0.04em" : "-0.02em",
//                   color: ri===0 ? T.textPrimary : T.accent,
//                   lineHeight:1.05,
//                 }}
//               >{word}</motion.span>
//             ))}
//           </div>
//         ))}

//         {/* Divider */}
//         <motion.div
//           initial={{ scaleX:0 }}
//           animate={mounted ? { scaleX:1 } : {}}
//           transition={{ duration:0.75, delay:0.54, ease:T.easing }}
//           style={{
//             height:2, background:"linear-gradient(90deg,#2C4A5C,#5BA3C4)",
//             borderRadius:2, marginBottom:22, transformOrigin:"left", maxWidth:280,
//           }}
//         />

//         {/* Body */}
//         <motion.p
//           initial={{ opacity:0, y:16 }}
//           animate={mounted ? { opacity:1, y:0 } : {}}
//           transition={{ duration:0.6, delay:0.62, ease:T.easing }}
//           style={{
//             fontFamily:"var(--font-geist-sans)", fontSize:15,
//             color:T.textMuted, lineHeight:1.75, marginBottom:32, maxWidth:480,
//           }}
//         >
//           Nobil Laboratories delivers safe, effective, and high-quality ophthalmic,
//           dermatologic, and therapeutic formulations — improving patient outcomes across India.
//         </motion.p>

//         {/* CTAs */}
//         <motion.div
//           initial={{ opacity:0, y:14 }}
//           animate={mounted ? { opacity:1, y:0 } : {}}
//           transition={{ duration:0.55, delay:0.72, ease:T.easing }}
//           style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:40 }}
//         >
//           <Link href="/products" className="h-btn-p">
//             Explore Products
//             <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//               <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//           </Link>
//           <Link href="/contact" className="h-btn-g">Contact Us</Link>
//         </motion.div>

//         {/* Trust marks + stats */}
//         <motion.div
//           initial={{ opacity:0 }}
//           animate={mounted ? { opacity:1 } : {}}
//           transition={{ duration:0.6, delay:0.82 }}
//         >
//           <div style={{ display:"flex", gap:20, flexWrap:"wrap", marginBottom:22 }}>
//             {["GMP Certified","WHO Guidelines","ISO Quality"].map(b => (
//               <div key={b} style={{ display:"flex", alignItems:"center", gap:7 }}>
//                 <div style={{
//                   width:19, height:19, borderRadius:"50%",
//                   background:T.primaryLight,
//                   display:"flex", alignItems:"center", justifyContent:"center",
//                 }}>
//                   <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
//                     <path d="M1.5 5L4 7.5L8.5 2.5" stroke={T.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 </div>
//                 <span style={{ fontFamily:"var(--font-geist-sans)", fontSize:12, color:T.textMuted, fontWeight:500 }}>{b}</span>
//               </div>
//             ))}
//           </div>

//           <div style={{ display:"flex", borderTop:`1px solid ${T.border}`, paddingTop:20, maxWidth:480 }}>
//             {stats.map((s, i) => (
//               <div key={s.val} style={{
//                 flex:1, paddingRight:14,
//                 borderRight: i < stats.length-1 ? `1px solid ${T.border}` : "none",
//                 marginRight: i < stats.length-1 ? 14 : 0,
//               }}>
//                 <div style={{
//                   fontFamily:"var(--font-geist-sans)", fontSize:"1.55rem",
//                   fontWeight:800, color:T.primary, letterSpacing:"-0.03em", lineHeight:1,
//                 }}>{s.val}</div>
//                 <div style={{
//                   fontFamily:"var(--font-geist-sans)", fontSize:10,
//                   color:T.textSubtle, marginTop:3,
//                   textTransform:"uppercase", letterSpacing:"0.08em",
//                 }}>{s.label}</div>
//               </div>
//             ))}
//           </div>
//         </motion.div>

//       </div>
//     </section>
//   );
// }