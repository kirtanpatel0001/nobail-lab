"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScrollProvider from "./components/SmoothScrollProvider";

export default function ClientLayoutManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // Admin Route: No Navbar, No Footer, No Top Padding
  if (isAdmin) {
    return <main>{children}</main>;
  }

  // Public Route: Premium Layout with Smooth Scroll
  return (
    <SmoothScrollProvider>
      <Navbar />
      <main style={{ paddingTop: "72px", minHeight: "100vh" }}>{children}</main>
      <Footer />
    </SmoothScrollProvider>
  );
}