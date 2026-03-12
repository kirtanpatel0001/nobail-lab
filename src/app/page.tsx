// FILE: src/app/page.tsx
import HeroSection          from "./home/sections/HeroSection";
import AboutSection         from "./home/sections/AboutSection";
import ProductsSection      from "./home/sections/ProductsSection";
import VisionMissionSection from "./home/sections/VisionMissionSection";
import WhyChooseSection     from "./home/sections/WhyChooseSection";
import BlogSection          from "./home/sections/BlogSection";
import StatsSectionWrapper  from "./home/sections/StatsSectionWrapper"; // Changed

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <StatsSectionWrapper />
      <ProductsSection />
      <VisionMissionSection />
      <WhyChooseSection />
      <BlogSection />
    </main>
  );
}