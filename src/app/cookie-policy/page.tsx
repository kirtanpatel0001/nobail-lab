// app/cookie-policy/page.tsx
export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#F4F8FA] py-16 px-8 font-sans">
      <div className="max-w-[800px] mx-auto bg-[#FFFFFF] rounded-[14px] shadow-[0_2px_8px_rgba(44,74,92,0.07)] border border-[#DDE6EA] p-8 md:p-12">
        <h1 className="text-[40px] leading-[1.1] font-bold text-[#2C4A5C] mb-4 tracking-[-0.04em]">
          Cookie Policy
        </h1>
        <p className="text-[15px] text-[#6B8A99] mb-8">Last updated: March 11, 2026</p>

        <div className="space-y-8 text-[15px] leading-[1.7] text-[#1A2E38]">
          <section>
            <h2 className="text-[22px] font-semibold text-[#2C4A5C] mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the site owners.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[#2C4A5C] mb-3">2. How We Use Cookies</h2>
            <p>
              Nobil Laboratories uses cookies to understand how you interact with our website, to remember your preferences, and to improve your overall browsing experience. We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device).
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[#2C4A5C] mb-3">3. Types of Cookies We Use</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Essential Cookies:</strong> Required for the basic operation of our site.</li>
              <li><strong>Analytical/Performance Cookies:</strong> Allow us to recognize and count the number of visitors and see how visitors move around our website.</li>
              <li><strong>Functionality Cookies:</strong> Used to recognize you when you return to our website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[#2C4A5C] mb-3">4. Managing Cookies</h2>
            <p>
              You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}