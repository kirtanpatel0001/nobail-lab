"use client";
import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: "3px",
      zIndex: 9999, background: "rgba(44,74,92,0.08)",
    }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: "linear-gradient(to right, #2C4A5C, #5BA3C4)",
        transition: "width 0.1s linear",
      }} />
    </div>
  );
}