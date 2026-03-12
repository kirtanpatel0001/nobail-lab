import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <style>{`
        @keyframes nb-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes nb-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .nb-404-primary { display:inline-block; padding:13px 30px; background:#2C4A5C; color:#fff; border-radius:10px; text-decoration:none; font-size:15px; font-weight:600; font-family:var(--font-geist-sans); transition:background 0.2s, transform 0.15s; }
        .nb-404-primary:hover { background:#3D6478; transform:translateY(-2px); }
        .nb-404-ghost   { display:inline-block; padding:13px 30px; background:transparent; color:#6B8A99; border-radius:10px; text-decoration:none; font-size:15px; font-weight:500; border:1.5px solid #DDE6EA; font-family:var(--font-geist-sans); transition:all 0.2s; }
        .nb-404-ghost:hover { border-color:#5BA3C4; color:#2C4A5C; }
      `}</style>

      <div style={{
        minHeight:"100vh", background:"#F4F8FA",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        fontFamily:"var(--font-geist-sans)", padding:"2rem",
        position:"relative", overflow:"hidden",
      }}>
        {/* Subtle watermark */}
        <div style={{
          position:"absolute",
          fontSize:"clamp(140px, 30vw, 340px)",
          fontWeight:900, color:"rgba(91,163,196,0.07)",
          fontFamily:"var(--font-geist-mono)",
          userSelect:"none", letterSpacing:"-0.06em",
          lineHeight:1, zIndex:0, pointerEvents:"none",
        }}>404</div>

        {/* Fine dot grid */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"radial-gradient(circle, #B8D0DA 1.2px, transparent 1.2px)",
          backgroundSize:"28px 28px", opacity:0.5, zIndex:0,
        }} />

        {/* Floating logo */}
        <img
          src="/LOGO/NOBAIL1.png"
          alt=""
          style={{
            position:"relative", zIndex:1,
            height:"80px", width:"80px", objectFit:"contain",
            animation:"nb-float 3.5s ease-in-out infinite",
            marginBottom:"2rem", opacity:0.65,
          }}
        />

        <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:"520px" }}>
          {/* Pill badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            background:"rgba(91,163,196,0.12)", border:"1.5px solid rgba(91,163,196,0.28)",
            borderRadius:"100px", padding:"6px 18px", marginBottom:"1.75rem",
          }}>
            <span style={{
              width:"6px", height:"6px", borderRadius:"50%", background:"#5BA3C4",
              display:"inline-block", animation:"nb-blink 1.6s ease-in-out infinite",
            }} />
            <span style={{ fontSize:"12px", color:"#3D6478", fontFamily:"var(--font-geist-mono)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
              Error 404
            </span>
          </div>

          <h1 style={{
            fontSize:"clamp(34px, 5.5vw, 64px)", fontWeight:800, color:"#1A2E38",
            margin:"0 0 1rem", letterSpacing:"-0.04em", lineHeight:1.05,
          }}>
            Page not found.
          </h1>

          <p style={{ color:"#6B8A99", fontSize:"16px", lineHeight:1.75, margin:"0 0 2.5rem" }}>
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
            Let&apos;s navigate you back to familiar ground.
          </p>

          <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/" className="nb-404-primary">← Back to Home</Link>
            <Link href="/contact" className="nb-404-ghost">Contact Support</Link>
          </div>
        </div>
      </div>
    </>
  );
}