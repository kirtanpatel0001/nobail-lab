// FILE: src/app/home/sections/StatsSectionWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const StatsSection = dynamic(() => import("./StatsSection"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        background: "linear-gradient(135deg, #2C4A5C 0%, #1e3545 100%)",
        height: "160px",
      }}
    />
  ),
});

export default function StatsSectionWrapper() {
  return <StatsSection />;
}