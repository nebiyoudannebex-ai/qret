import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, FileText, Code, Instagram, Send, Phone, UserCheck, Award, CheckCircle2 } from "lucide-react";
import { PortalModal } from "./PortalModal";

interface LegalModalsProps {
  termsOpen: boolean;
  onCloseTerms: () => void;
  privacyOpen: boolean;
  onClosePrivacy: () => void;
  developerOpen: boolean;
  onCloseDeveloper: () => void;
  t: (key: string) => string;
}

export const LegalModals: React.FC<LegalModalsProps> = ({
  termsOpen,
  onCloseTerms,
  privacyOpen,
  onClosePrivacy,
  developerOpen,
  onCloseDeveloper,
  t
}) => {
  return (
    <>
      {/* Terms & Conditions Modal */}
      <AnimatePresence>
        {termsOpen && (
          <PortalModal
            open
            onClose={onCloseTerms}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col"
          >
              <button
                onClick={onCloseTerms}
                className="absolute top-5 right-5 text-gray-400 hover:text-white transition cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-800">
                <div className="p-2.5 bg-neon-emerald/10 border border-neon-emerald/20 rounded-2xl">
                  <FileText className="w-6 h-6 text-neon-emerald" />
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-xl text-white">
                    {t("Terms & Conditions")}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Platform Usage Guidelines & Merchant Obligations
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto pr-2 space-y-4 text-xs text-gray-300 leading-relaxed font-sans">
                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
                    1. Merchant Profile Provisioning
                  </h3>
                  <p>
                    Merchants registered on the Mobile Banking Directory platform are solely responsible for ensuring the accuracy of all bank account numbers, Telebirr accounts, and payment links provided in their portal.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
                    2. Digital Restaurant Menu Listings
                  </h3>
                  <p>
                    Merchants utilizing the digital menu module must maintain updated prices in Ethiopian Birr (ETB). The platform AI scanner assists in digitizing menus but requires merchant verification prior to customer publishing.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
                    3. Security & Zero-Trust Verification
                  </h3>
                  <p>
                    All administrative operations, password updates, and payment profile changes are cryptographically logged in system audit trails. Unmasked account accesses are rate-limited and monitored.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
                    4. Intellectual Property & License
                  </h3>
                  <p>
                    This application software, code architecture, and digital interfaces are engineered and licensed under the authority of <strong className="text-neon-emerald">Nebiyou Daniel</strong>. Authorized commercial use requires valid merchant account assignment.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-terracotta" />
                    5. Disclaimer of Warranties & No Liability
                  </h3>
                  <p>
                    The Mobile Banking Directory platform is provided strictly on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, accuracy, availability, or non-infringement.
                  </p>
                  <p>
                    The platform developer, operator, and licensor <strong className="text-white">Nebiyou Daniel</strong> shall bear <strong className="text-terracotta">NO responsibility, liability, or obligation whatsoever</strong> — whether legal, financial, criminal, or otherwise — for any payment made, transaction completed or failed, account transfer, fraud, theft, error, delay, loss of funds, or any other problem arising between merchants, customers, banks, mobile money operators, or any third party using or referencing this platform.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-terracotta" />
                    6. Release, Waiver & Full Indemnification
                  </h3>
                  <p>
                    By using this platform, every merchant, customer, staff member, and visitor unconditionally and irrevocably releases, waives, and forever discharges the platform developer from any and all claims, demands, damages, losses, lawsuits, or disputes of any kind. You agree to fully indemnify, defend, and hold harmless the developer against any third-party claim arising from your use of the platform.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-terracotta" />
                    7. Disputes Belong to the Merchant, Not the Developer
                  </h3>
                  <p>
                    Any complaint, dispute, refund request, payment problem, or issue regarding a product, service, menu item, price, bill, receipt, or transfer must be raised directly and exclusively with the merchant (the business owner). The platform is only a neutral technical directory that displays information entered by the merchant itself. <strong className="text-terracotta">No complaint should be brought to the platform developer</strong>, who has no control over, and is not a party to, any merchant-customer transaction.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-terracotta" />
                    8. Merchant-Supplied Data & Accuracy
                  </h3>
                  <p>
                    All bank account numbers, Telebirr numbers, payment links, menu items, prices, and descriptions are supplied and maintained by the merchant. The developer does not verify, guarantee, or endorse the correctness of any data displayed. Anyone relying on such data does so entirely at their own risk.
                  </p>
                </section>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-800 flex justify-end">
                <button
                  onClick={onCloseTerms}
                  className="px-6 py-2.5 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  {t("Close")}
                </button>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {privacyOpen && (
          <PortalModal
            open
            onClose={onClosePrivacy}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col"
          >
              <button
                onClick={onClosePrivacy}
                className="absolute top-5 right-5 text-gray-400 hover:text-white transition cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-800">
                <div className="p-2.5 bg-neon-emerald/10 border border-neon-emerald/20 rounded-2xl">
                  <ShieldCheck className="w-6 h-6 text-neon-emerald" />
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-xl text-white">
                    {t("Privacy Policy")}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Data Encryption & Storage Isolation Standards
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto pr-2 space-y-4 text-xs text-gray-300 leading-relaxed font-sans">
                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-neon-emerald" />
                    1. Account Number Encryption
                  </h3>
                  <p>
                    All merchant bank account numbers and sensitive payment credentials stored in database persistent storage are encrypted using standard AES algorithms. Account numbers are masked on public customer displays.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-neon-emerald" />
                    2. Zero Data Harvesting
                  </h3>
                  <p>
                    We do not track, sell, or collect customer personal payment data. When customers scan a QR code to copy payment account numbers, calculations and copy actions remain purely client-side.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-neon-emerald" />
                    3. AI Image Parsing Privacy
                  </h3>
                  <p>
                    Uploaded menu photos sent to the Gemini AI module are processed transiently to extract food item titles and prices. Images are not stored permanently after parsing completes.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-terracotta" />
                    4. No Responsibility for Third-Party Data
                  </h3>
                  <p>
                    This platform is not a bank, mobile money operator, payment processor, or financial institution. The developer does not hold, control, or have access to any customer funds, and is not responsible for how merchants or customers store, share, or use their own account information outside of this system.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-terracotta" />
                    5. Limitation of Liability & No Guarantee
                  </h3>
                  <p>
                    The developer provides this service for free convenience and makes no guarantee that it will be uninterrupted, error-free, secure, or fit for any purpose. Under no circumstances shall the developer be liable for any indirect, incidental, special, consequential, or punitive damages, including lost funds, lost profits, or data loss, arising from the use or inability to use this platform.
                  </p>
                  <p>
                    Any payment problem, fraud, loss, or dispute is a matter solely between the parties directly involved and must not be brought against the platform developer <strong className="text-white">Nebiyou Daniel</strong>.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-terracotta" />
                    6. User Conduct & Sole Responsibility
                  </h3>
                  <p>
                    Merchants are solely responsible for the lawfulness of their business, the accuracy of their displayed data, and their compliance with the rules of the banks and mobile money operators they use. Customers are solely responsible for confirming the recipient's account number before transferring money. Neither party may hold the developer responsible for any mistake or misconduct.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-terracotta" />
                    7. Acceptance of These Terms
                  </h3>
                  <p>
                    By continuing to access or use this platform in any way, you acknowledge that you have read, understood, and agreed to all of the above terms, releases, and limitations. If you do not agree, you must stop using the platform immediately. You further agree that the platform developer shall not be contacted, sued, or held accountable for any problem you may experience.
                  </p>
                </section>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-800 flex justify-end">
                <button
                  onClick={onClosePrivacy}
                  className="px-6 py-2.5 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  {t("Close")}
                </button>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Developer License & Contact Modal (Nebiyou Daniel) */}
      <AnimatePresence>
        {developerOpen && (
          <PortalModal
            open
            onClose={onCloseDeveloper}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-md overflow-hidden"
          >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-champagne/10 rounded-full blur-2xl pointer-events-none" />

              <button
                onClick={onCloseDeveloper}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-champagne to-champagne-dark p-0.5 shadow-xl mb-3 relative">
                  <div className="w-full h-full bg-luxury-bg rounded-[14px] flex items-center justify-center">
                    <Code className="w-10 h-10 text-champagne" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-champagne text-luxury-bg rounded-lg shadow">
                    <Award className="w-4 h-4" />
                  </div>
                </div>

                <span className="px-3 py-1 bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald text-[10px] font-mono font-bold uppercase tracking-wider rounded-full mb-2">
                  Software Architect & Developer
                </span>

                <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">
                  Nebiyou Daniel
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Full-Stack Platform Engineer & System Designer
                </p>
              </div>

              <div className="mt-6 space-y-3 font-sans">
                <div className="p-3 bg-luxury-bg border border-gray-800 rounded-2xl space-y-2.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-gray-500 tracking-wider block">
                    {t("Developer & Creator Contact")}
                  </span>

                  <a
                    href="https://instagram.com/aka_neba"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-luxury-card hover:bg-gray-800/80 border border-gray-800/80 rounded-xl transition text-xs group"
                  >
                    <div className="flex items-center gap-2.5 text-gray-200 group-hover:text-champagne transition">
                      <Instagram className="w-4 h-4 text-champagne/70" />
                      <span className="font-semibold">Instagram</span>
                    </div>
                    <span className="font-mono text-gray-400 text-[11px]">@aka_neba</span>
                  </a>

                  <a
                    href="https://t.me/NebiyouDaniel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-luxury-card hover:bg-gray-800/80 border border-gray-800/80 rounded-xl transition text-xs group"
                  >
                    <div className="flex items-center gap-2.5 text-gray-200 group-hover:text-champagne transition">
                      <Send className="w-4 h-4 text-champagne/70" />
                      <span className="font-semibold">Telegram</span>
                    </div>
                    <span className="font-mono text-gray-400 text-[11px]">@NebiyouDaniel</span>
                  </a>

                  <a
                    href="tel:0956797970"
                    className="flex items-center justify-between p-2.5 bg-luxury-card hover:bg-gray-800/80 border border-gray-800/80 rounded-xl transition text-xs group"
                  >
                    <div className="flex items-center gap-2.5 text-gray-200 group-hover:text-emerald-400 transition">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold">Phone</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">0956797970</span>
                  </a>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-[11px] text-gray-300 leading-snug text-center">
                  Official Software System Built & Crafted by <strong className="text-white">Nebiyou Daniel</strong>. All Rights Reserved.
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={onCloseDeveloper}
                  className="w-full py-2.5 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  {t("Close")}
                </button>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>
    </>
  );
};
