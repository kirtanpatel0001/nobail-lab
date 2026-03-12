export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes nb-spin   { to { transform: rotate(360deg); } }
        @keyframes nb-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.55;transform:scale(0.88)} }
        @keyframes nb-bounce { 0%,80%,100%{transform:translateY(0);opacity:0.35} 40%{transform:translateY(-10px);opacity:1} }
        @keyframes nb-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{
        minHeight:"100vh", background:"#F4F8FA",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        fontFamily:"var(--font-geist-sans)", gap:"1.75rem",
        animation:"nb-fadein 0.4s ease",
      }}>
        {/* Spinner ring + logo */}
        <div style={{ position:"relative", width:"80px", height:"80px" }}>
          {/* Outer ring */}
          <div style={{
            position:"absolute", inset:0, borderRadius:"50%",
            border:"2.5px solid #DDE6EA",
            borderTopColor:"#2C4A5C",
            borderRightColor:"#5BA3C4",
            animation:"nb-spin 1s linear infinite",
          }} />
          {/* Logo in centre */}
          <div style={{
            position:"absolute", inset:"12px",
            display:"flex", alignItems:"center", justifyContent:"center",
            animation:"nb-pulse 1.6s ease-in-out infinite",
          }}>
            <img
              src="/LOGO/NOBAIL1.png"
              alt=""
              style={{ width:"100%", height:"100%", objectFit:"contain" }}
            />
          </div>
        </div>

        {/* Bouncing dots */}
        <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
          {[0,1,2].map((i) => (
            <span key={i} style={{
              width:"7px", height:"7px", borderRadius:"50%",
              background: i === 1 ? "#5BA3C4" : "#2C4A5C",
              display:"inline-block",
              animation:`nb-bounce 1.3s ease-in-out ${i*0.22}s infinite`,
            }} />
          ))}
        </div>

        {/* Label */}
        <p style={{
          color:"#A8BEC8", fontSize:"12px",
          letterSpacing:"0.18em", textTransform:"uppercase",
          fontFamily:"var(--font-geist-mono)", margin:0,
        }}>
          Loading...
        </p>
      </div>
    </>
  );
}