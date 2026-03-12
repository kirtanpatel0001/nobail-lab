// app/terms-of-service/page.tsx
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#F4F8FA] font-sans relative selection:bg-[#EBF3F7] selection:text-[#2C4A5C]">
      <div 
        className="absolute top-0 left-0 w-full h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(91,163,196,0.10) 0%, transparent 65%)' }}
      />

      <div className="max-w-[1340px] mx-auto px-[2rem] py-[64px] relative z-10">
        
        <header className="mb-[64px] max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[100px] bg-[rgba(44,74,92,0.08)] text-[#2C4A5C] text-[12px] leading-[1.5] font-semibold tracking-[0.12em] uppercase mb-[24px]">
            Legal Information
          </div>
          <h1 className="text-[64px] leading-[1.0] font-bold text-[#2C4A5C] tracking-[-0.04em] mb-[16px]">
            Terms of Service
          </h1>
          <p className="text-[22px] leading-[1.4] text-[#6B8A99] font-medium">
            Rules and guidelines for using Nobil Laboratories platforms.
          </p>
          <div className="mt-[24px] text-[13.5px] text-[#A8BEC8] flex items-center gap-4">
            <span>Effective Date: March 11, 2026</span>
            <span className="w-1 h-1 rounded-full bg-[#DDE6EA]"></span>
            <span>Version 1.0.0</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[40px] lg:gap-[64px] items-start">
          
          <aside className="lg:col-span-3 hidden lg:block sticky top-[40px]">
            <nav className="bg-[#FFFFFF] rounded-[14px] border border-[#DDE6EA] p-[24px] shadow-[0_2px_8px_rgba(44,74,92,0.07)]">
              <h4 className="text-[12px] font-bold text-[#6B8A99] uppercase tracking-[0.12em] mb-[16px]">
                Contents
              </h4>
              <ul className="space-y-[12px] text-[15px] leading-[1.7]">
                <li><a href="#acceptance" className="text-[#2C4A5C] font-medium hover:text-[#5BA3C4] transition-colors duration-150">1. Agreement to Terms</a></li>
                <li><a href="#responsibilities" className="text-[#6B8A99] hover:text-[#2C4A5C] transition-colors duration-150">2. Account Responsibilities</a></li>
                <li><a href="#intellectual-property" className="text-[#6B8A99] hover:text-[#2C4A5C] transition-colors duration-150">3. Intellectual Property</a></li>
                <li><a href="#liability" className="text-[#6B8A99] hover:text-[#2C4A5C] transition-colors duration-150">4. Limitation of Liability</a></li>
              </ul>
              <div className="mt-[24px] pt-[24px] border-t border-[#DDE6EA]">
                <h4 className="text-[12px] font-bold text-[#6B8A99] uppercase tracking-[0.12em] mb-[12px]">Other Policies</h4>
                <div className="flex flex-col gap-2 text-[13.5px]">
                  <Link href="/privacy-policy" className="text-[#6B8A99] hover:text-[#2C4A5C]">Privacy Policy</Link>
                  <Link href="/cookie-policy" className="text-[#6B8A99] hover:text-[#2C4A5C]">Cookie Policy</Link>
                </div>
              </div>
            </nav>
          </aside>

          <main className="lg:col-span-9 bg-[#FFFFFF] rounded-[20px] border border-[#DDE6EA] shadow-[0_4px_16px_rgba(44,74,92,0.10)] p-[32px] md:p-[64px]">
            <div className="prose prose-lg max-w-none text-[#1A2E38] space-y-[40px]">
              
              <section id="acceptance" className="scroll-mt-[40px]">
                <h2 className="text-[28px] leading-[1.25] font-bold text-[#2C4A5C] tracking-[-0.04em] mb-[16px]">
                  1. Agreement to Terms
                </h2>
                <p className="text-[17px] leading-[1.7]">
                  By accessing the Nobil Laboratories portal, integrating with our API, or utilizing our diagnostic reporting services, you agree to be bound by these Terms of Service. If you are accepting these terms on behalf of a clinic, hospital, or other legal entity, you represent that you have the authority to bind such entity.
                </p>
              </section>

              <hr className="border-[#DDE6EA]" />

              <section id="responsibilities" className="scroll-mt-[40px]">
                <h2 className="text-[28px] leading-[1.25] font-bold text-[#2C4A5C] tracking-[-0.04em] mb-[16px]">
                  2. Account Responsibilities
                </h2>
                <p className="text-[17px] leading-[1.7] mb-[16px]">
                  Access to diagnostic results and secure platforms requires credentialing. You are responsible for:
                </p>
                <ul className="list-none space-y-[12px] pl-0">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#5BA3C4] mt-2 shrink-0"></span>
                    <span className="text-[15px] leading-[1.7]">Maintaining the strict confidentiality of your authentication credentials.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#5BA3C4] mt-2 shrink-0"></span>
                    <span className="text-[15px] leading-[1.7]">Ensuring your usage complies with regional healthcare compliance frameworks (e.g., HIPAA, GDPR) relevant to your jurisdiction.</span>
                  </li>
                </ul>
              </section>

              <hr className="border-[#DDE6EA]" />

              <section id="intellectual-property" className="scroll-mt-[40px]">
                <h2 className="text-[28px] leading-[1.25] font-bold text-[#2C4A5C] tracking-[-0.04em] mb-[16px]">
                  3. Intellectual Property
                </h2>
                <div className="bg-[#F4F8FA] rounded-[10px] p-[24px] border border-[#DDE6EA]">
                  <p className="text-[15px] leading-[1.7] text-[#2C4A5C] font-medium m-0">
                    The "Nobil Laboratories" name, the Globe Blue icon, and all proprietary diagnostic software interfaces are exclusive trademarks and intellectual property of Nobil Laboratories.
                  </p>
                </div>
              </section>

              <hr className="border-[#DDE6EA]" />

              <section id="liability" className="scroll-mt-[40px]">
                <h2 className="text-[28px] leading-[1.25] font-bold text-[#2C4A5C] tracking-[-0.04em] mb-[16px]">
                  4. Limitation of Liability
                </h2>
                <p className="text-[17px] leading-[1.7] mb-[24px]">
                  While we strive for 99.99% uptime, Nobil Laboratories is not liable for indirect damages, data loss due to client-side breaches, or delays caused by circumstances beyond our direct control.
                </p>
                <div className="inline-flex items-center gap-[16px]">
                  <a href="mailto:legal@nobillaboratories.com" className="bg-[#2C4A5C] hover:bg-[#3D6478] text-[#FFFFFF] px-[24px] py-[10px] rounded-[8px] font-medium transition-colors duration-150 text-[15px]">
                    Contact Legal Team
                  </a>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}