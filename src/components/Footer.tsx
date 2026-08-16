import React from "react";
import { ShieldCheck } from "lucide-react";
import { ContactInfo } from "./ContactInfo";
import { BUILD_TAG } from "../lib/build";

interface FooterProps {
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onOpenDeveloper: () => void;
  onOpenAbout?: () => void;
  t: (key: string) => string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTerms,
  onOpenPrivacy,
  onOpenDeveloper,
  onOpenAbout,
  t
}) => {
  return (
    <footer className="static sm:fixed sm:bottom-0 sm:left-0 sm:w-full bg-luxury-card/90 border-t border-champagne/10 h-10 sm:h-12 py-1 sm:py-2 px-3 text-[10px] text-gray-400 sm:px-4 sm:text-[11px] sm:z-40">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between justify-center gap-1 h-full">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-champagne/10 border border-champagne/30 flex items-center justify-center">
            <ShieldCheck className="w-3 h-3 text-champagne" />
          </div>
          <span className="hidden sm:inline-block font-display font-bold text-gray-200 text-[10px]">Mobile Banking Directory & Menu Platform</span>
          <span className="text-gray-600 font-mono">build {BUILD_TAG}</span>
        </div>

        {/* Desktop / tablet actions */}
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-1">
          <ContactInfo t={t} compact />
          <span className="text-gray-600">|</span>
          <button onClick={onOpenDeveloper} className="text-champagne hover:underline text-[10px]">{t("Built by Nebiyou Daniel")}</button>
          <span className="text-gray-600">|</span>
          <button onClick={onOpenTerms} className="hover:text-white text-[10px]">{t("Terms & Conditions")}</button>
          <button onClick={onOpenPrivacy} className="hover:text-white text-[10px]">{t("Privacy Policy")}</button>
        </div>
      </div>
    </footer>
  );
};
