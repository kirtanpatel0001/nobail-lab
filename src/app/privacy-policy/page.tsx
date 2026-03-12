// app/privacy-policy/page.tsx
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F4F8FA] py-16 px-8 font-sans">
      <div className="max-w-[800px] mx-auto bg-[#FFFFFF] rounded-[14px] shadow-[0_2px_8px_rgba(44,74,92,0.07)] border border-[#DDE6EA] p-8 md:p-12">
        <h1 className="text-[40px] leading-[1.1] font-bold text-[#2C4A5C] mb-4 tracking-[-0.04em]">
          Privacy Policy
        </h1>
        <p className="text-[15px] text-[#6B8A99] mb-8">Last updated: March 11, 2026</p>

        <div className="space-y-8 text-[15px] leading-[1.7] text-[#1A2E38]">
          <section>
            <h2 className="text-[22px] font-semibold text-[#2C4A5C] mb-3">1. Information We Collect</h2>
            <p>
              Nobil Laboratories collects information that identifies, relates to, describes, or could reasonably be linked to you. This includes identifiers such as your name, email address, IP address, and interaction data when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[#2C4A5C] mb-3">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to operate and improve our services, communicate with you, ensure security, and comply with legal obligations. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[#2C4A5C] mb-3">3. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is entirely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[#2C4A5C] mb-3">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@nobillaboratories.com" className="text-[#5BA3C4] hover:text-[#3D7FA0] transition-colors duration-150">privacy@nobillaboratories.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}