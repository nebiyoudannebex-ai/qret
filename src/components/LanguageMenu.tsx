import React, { useState, useRef, useEffect } from "react";
import { Languages, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface LanguageMenuProps {
  lang: "en" | "am";
  onSelect: (lang: "en" | "am") => void;
  className?: string;
}

const LANGS = [
  { id: "en" as const, label: "English", native: "English" },
  { id: "am" as const, label: "አማርኛ", native: "አማርኛ" },
];

export const LanguageMenu: React.FC<LanguageMenuProps> = ({ lang, onSelect, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Language selector"
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-700 bg-gray-950/40 hover:text-champagne hover:border-champagne/50 transition cursor-pointer text-gray-300"
      >
        <Languages className="w-3.5 h-3.5" />
        <span>{lang === "en" ? "English" : "አማርኛ"}</span>
        <svg className="w-3 h-3 opacity-60" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-44 bg-luxury-card border border-champagne/20 rounded-2xl p-1.5 shadow-2xl overflow-hidden"
          >
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  onSelect(l.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  lang === l.id
                    ? "bg-champagne text-luxury-bg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">{l.id === "en" ? "🇬🇧" : "🇪🇹"}</span>
                  <span>{l.native}</span>
                </span>
                {lang === l.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
