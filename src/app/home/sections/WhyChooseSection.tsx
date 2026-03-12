"use client";
import { useRef } from "react";
import gsap from "gsap";

const CARDS = [
  {
    id: 1,
    title: "Personalized care",
    desc: "Tailored solutions to match your unique healthcare needs, ensuring you receive the right treatment for your specific condition.",
    icon: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="28" r="14" stroke="#1B2A6B" strokeWidth="2.6"/>
        <path d="M34 72c0-14.4 11.6-26 26-26s26 11.6 26 26" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M22 88h76" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M30 88V80c0-2.2 1.8-4 4-4h52c2.2 0 4 1.8 4 4v8" stroke="#1B2A6B" strokeWidth="2.4" strokeLinecap="round"/>
        <path d="M44 68c-1.8-1.8-1.8-4.6 0-6.4 1.8-1.8 4.6-1.8 6.4 0 1.8-1.8 4.6-1.8 6.4 0 1.8 1.8 1.8 4.6 0 6.4L50 74l-6-6z" stroke="#1B2A6B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M64 62c-1.4-1.4-1.4-3.6 0-5 1.4-1.4 3.6-1.4 5 0 1.4-1.4 3.6-1.4 5 0 1.4 1.4 1.4 3.6 0 5L69 67l-5-5z" stroke="#1B2A6B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 2,
    title: "Cutting-edge solutions",
    desc: "Access to the latest advancements in pharmaceuticals, empowering you with the most effective and modern healthcare options.",
    icon: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <path d="M60 18c-16 0-28 12-28 28 0 10.6 5.8 19.8 14.4 24.8V82h27v-11.2C81.4 65.8 88 56.6 88 46c0-16-12-28-28-28z" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M46.4 82h27.2M48 91h24M52 100h16" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M60 8V2" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M88 20l4-4" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M98 46h6" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M88 72l4 4" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M32 20l-4-4" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M16 46h6" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M32 72l-4 4" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M60 68V52M52 58l8-8 8 8" stroke="#1B2A6B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 3,
    title: "Trusted quality",
    desc: "Our unwavering commitment to rigorous quality control guarantees the highest standards in every product we offer.",
    icon: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <path d="M60 14l-28 12v24c0 15.6 12 30.2 28 34 16-3.8 28-18.4 28-34V26L60 14z" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M48 50l9 9 18-18" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M30 88c0 0 10-6 18-6h24c4.4 0 8 3.6 8 8" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M28 96h64" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M32 88l-4 8h60l-4-8" stroke="#1B2A6B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 4,
    title: "Global reach",
    desc: "We proudly serve a worldwide community, making our top-tier pharmaceuticals accessible to all corners of the globe.",
    icon: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="36" stroke="#1B2A6B" strokeWidth="2.6"/>
        <path d="M60 24c0 0-18 12-18 36s18 36 18 36" stroke="#1B2A6B" strokeWidth="2.4" strokeLinecap="round"/>
        <path d="M60 24c0 0 18 12 18 36s-18 36-18 36" stroke="#1B2A6B" strokeWidth="2.4" strokeLinecap="round"/>
        <path d="M24 60h72" stroke="#1B2A6B" strokeWidth="2.4" strokeLinecap="round"/>
        <path d="M28 44h64M28 76h64" stroke="#1B2A6B" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="60" cy="10" r="5" stroke="#1B2A6B" strokeWidth="2.2"/>
        <circle cx="100" cy="32" r="5" stroke="#1B2A6B" strokeWidth="2.2"/>
        <circle cx="100" cy="88" r="5" stroke="#1B2A6B" strokeWidth="2.2"/>
        <circle cx="20" cy="32" r="5" stroke="#1B2A6B" strokeWidth="2.2"/>
        <circle cx="20" cy="88" r="5" stroke="#1B2A6B" strokeWidth="2.2"/>
        <path d="M60 15v9M96 35l-8 6M96 85l-8-6M24 35l8 6M24 85l8-6" stroke="#1B2A6B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 5,
    title: "Regulatory compliant",
    desc: "Fully aligned with WHO, GMP, and GDP guidelines ensuring complete safety and efficacy across every product line.",
    icon: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <path d="M60 16l-32 14v28c0 17.6 13.6 34 32 38 18.4-4 32-20.4 32-38V30L60 16z" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="60" cy="55" r="14" stroke="#1B2A6B" strokeWidth="2.4"/>
        <path d="M53 55l5 5 10-10" stroke="#1B2A6B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M44 84l-6 12h44l-6-12" stroke="#1B2A6B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M38 96h44" stroke="#1B2A6B" strokeWidth="2.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 6,
    title: "Expert team",
    desc: "Pharmaceutical professionals committed to ethical practices, continuous learning, and patient safety above all else.",
    icon: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="46" cy="36" r="14" stroke="#1B2A6B" strokeWidth="2.6"/>
        <circle cx="78" cy="36" r="12" stroke="#1B2A6B" strokeWidth="2.6"/>
        <path d="M18 96c0-15.4 12.6-28 28-28s28 12.6 28 28" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M74 68c3.8-1.3 7.9-2 12-2 13.2 0 24 10.8 24 24" stroke="#1B2A6B" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M60 52c4.2-1.3 8.6-2 13-2" stroke="#1B2A6B" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function WhyChooseSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 1 | -1) => {
    if (!scrollRef.current) return;
    
    const cardWidth = scrollRef.current.children[0]?.clientWidth || 0;
    const gap = 18;
    const scrollAmount = (cardWidth + gap) * direction;

    gsap.to(scrollRef.current, {
      scrollLeft: scrollRef.current.scrollLeft + scrollAmount,
      duration: 0.6,
      ease: "power3.inOut",
    });
  };

  return (
    <section style={{ background: "#fff", padding: "56px 48px 72px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .wc * { box-sizing: border-box; font-family: 'Inter', sans-serif; }

        .wc-top {
          display: flex; align-items: flex-start;
          justify-content: space-between; margin-bottom: 36px;
        }

        .wc-h1 {
          font-size: 2.5rem; font-weight: 800; color: #111C5D;
          margin: 0 0 10px; line-height: 1.1; letter-spacing: -0.5px;
        }
        .wc-sub {
          font-size: 14px; color: #555; line-height: 1.6;
          max-width: 360px; margin: 0; font-weight: 400;
        }

        .wc-nav { display: flex; align-items: center; gap: 8px; padding-top: 6px; flex-shrink: 0; }
        .wc-arrow {
          width: 44px; height: 44px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; background: transparent;
          border: none; color: #111C5D; font-size: 22px; line-height: 1;
          border-radius: 6px; transition: background 0.18s, color 0.18s;
          user-select: none; padding: 0;
        }
        .wc-arrow.boxed { border: 2px solid #111C5D; }
        .wc-arrow:hover { background: #EEF2FF; }

        .wc-grid {
          display: flex; gap: 18px; overflow-x: hidden; /* GSAP handles the scroll */
          padding-bottom: 10px; margin-bottom: -10px; /* Accounts for hover shadow */
        }

        .wc-card {
          flex: 0 0 calc(25% - 13.5px); /* Exactly 4 cards visible initially */
          background: #EBF1FA; border-radius: 18px;
          padding: 26px 22px 28px 22px;
          display: flex; flex-direction: column;
          min-height: 370px; border: 1.5px solid transparent;
          transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
          cursor: default;
        }
        
        .wc-card:hover {
          box-shadow: 0 10px 36px rgba(17,28,93,0.11);
          transform: translateY(-4px);
          border-color: rgba(17,28,93,0.13);
          background: #E4EEF8;
        }

        .wc-card-icon { flex: 1 1 auto; display: flex; align-items: flex-start; }
        .wc-card-title {
          font-size: 1.12rem; font-weight: 700; color: #111C5D;
          margin: 0 0 10px; line-height: 1.3;
        }
        .wc-card-desc {
          font-size: 13.5px; color: #4A4A5A; line-height: 1.65;
          margin: 0; font-weight: 400;
        }

        @media (max-width: 960px) { .wc-card { flex: 0 0 calc(50% - 9px); } }
        @media (max-width: 540px) {
          .wc-card { flex: 0 0 100%; }
          .wc-h1 { font-size: 1.8rem; }
          section { padding: 36px 20px 52px; }
        }
      `}</style>

      <div className="wc">
        <div className="wc-top">
          <div>
            <h2 className="wc-h1">Why Choose Nobil?</h2>
            <p className="wc-sub">Top tier pharmaceuticals, cosmeceuticals, and unwavering commitment to customer well-being.</p>
          </div>
          <div className="wc-nav">
            <button className="wc-arrow" onClick={() => handleScroll(-1)} aria-label="Previous">
              ‹
            </button>
            <button className="wc-arrow boxed" onClick={() => handleScroll(1)} aria-label="Next">
              ›
            </button>
          </div>
        </div>

        <div className="wc-grid" ref={scrollRef}>
          {CARDS.map((card) => (
            <div key={card.id} className="wc-card">
              <div className="wc-card-icon">{card.icon}</div>
              <h3 className="wc-card-title">{card.title}</h3>
              <p className="wc-card-desc">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}