import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayoutManager from "./ClientLayoutManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Premium SEO & Favicon Integration
export const metadata: Metadata = {
  title: {
    template: "%s | Nobil Laboratories",
    default: "Nobil Laboratories | Premium Healthcare Solutions",
  },
  description: "Pioneering healthcare with purpose. High-quality ophthalmic and dermatologic formulations.",
  icons: {
    icon: "/LOGO/NOBAIL1.png", // Uses your icon logo for the browser tab
    apple: "/LOGO/NOBAIL1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ 
          background: "#FFFFFF",  // Replaced dark mode #080808 with brand premium white
          color: "#1A2E38",       // Deep Ink text color for high-end readability
          margin: 0, 
          padding: 0,
          WebkitFontSmoothing: "antialiased"
        }}
      >
        <ClientLayoutManager>
          {children}
        </ClientLayoutManager>
      </body>
    </html>
  );
}