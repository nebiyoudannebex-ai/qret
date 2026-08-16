import React from "react";
import { Instagram, Send, Phone, MessageCircle } from "lucide-react";

interface ContactInfoProps {
  t?: (key: string) => string;
  compact?: boolean;
}

const instagramGradient = "linear-gradient(45deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)";
const telegramColor = "#229ED9";
const whatsappColor = "#25D366";
const phoneColor = "#4CAF50";

export const ContactInfo: React.FC<ContactInfoProps> = ({ t, compact }) => {
  const sizeClass = compact ? "w-5 h-5" : "w-6 h-6";
  const textClass = compact ? "text-[11px]" : "text-sm";
  const chipClass = compact
    ? "px-2 py-1 rounded-lg"
    : "px-3 py-2 rounded-xl";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "gap-y-1.5" : "gap-y-2"}`}>
      <a
        href="https://instagram.com/aka_neba"
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex items-center gap-2 ${chipClass} bg-luxury-card border border-gray-800 hover:border-[#DD2A7B]/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(221,42,123,0.35)] cursor-pointer`}
        aria-label="Instagram"
      >
        <span
          className={`${sizeClass} flex items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-125 group-hover:rotate-[-8deg]`}
          style={{ background: instagramGradient, boxShadow: "0 0 10px rgba(221,42,123,0.35)" }}
        >
          <Instagram className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"}`} />
        </span>
        <span className={`${textClass} text-gray-300 group-hover:text-[#DD2A7B] transition-colors duration-300 font-medium`}>
          {t ? t("@aka_neba") : "@aka_neba"}
        </span>
      </a>

      <a
        href="https://t.me/NebiyouDaniel"
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex items-center gap-2 ${chipClass} bg-luxury-card border border-gray-800 hover:border-[#229ED9]/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(34,158,217,0.35)] cursor-pointer`}
        aria-label="Telegram"
      >
        <span
          className={`${sizeClass} flex items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-125 group-hover:rotate-[8deg]`}
          style={{ background: telegramColor, boxShadow: "0 0 10px rgba(34,158,217,0.35)" }}
        >
          <Send className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} -ml-0.5`} />
        </span>
        <span className={`${textClass} text-gray-300 group-hover:text-[#229ED9] transition-colors duration-300 font-medium`}>
          {t ? t("@NebiyouDaniel") : "@NebiyouDaniel"}
        </span>
      </a>

      <a
        href="https://wa.me/251956797970?text=Hello%20@aka_neba"
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex items-center gap-2 ${chipClass} bg-luxury-card border border-gray-800 hover:border-[#25D366]/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(37,211,102,0.35)] cursor-pointer`}
        aria-label="WhatsApp"
      >
        <span
          className={`${sizeClass} flex items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-125 group-hover:rotate-[8deg]`}
          style={{ background: whatsappColor, boxShadow: "0 0 10px rgba(37,211,102,0.35)" }}
        >
          <MessageCircle className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"}`} />
        </span>
        <span className={`${textClass} text-gray-300 group-hover:text-[#25D366] transition-colors duration-300 font-medium`}>
          {t ? t("@aka_neba") : "@aka_neba"}
        </span>
      </a>

      <a
        href="tel:+251956797970"
        className={`group flex items-center gap-2 ${chipClass} bg-luxury-card border border-gray-800 hover:border-[#4CAF50]/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(76,175,80,0.35)] cursor-pointer`}
        aria-label="Phone"
      >
        <span
          className={`${sizeClass} flex items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-125 group-hover:rotate-[8deg]`}
          style={{ background: phoneColor, boxShadow: "0 0 10px rgba(76,175,80,0.35)" }}
        >
          <Phone className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"}`} />
        </span>
        <span className={`${textClass} text-gray-300 group-hover:text-[#4CAF50] transition-colors duration-300 font-medium`}>
          {t ? t("0956797970") : "0956797970"}
        </span>
      </a>
    </div>
  );
};