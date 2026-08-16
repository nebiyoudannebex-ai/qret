import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  QrCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Sparkles,
  Zap,
  Building,
  AlertCircle,
  ExternalLink,
  Trash2,
  Bell,
  Eye,
  CheckCircle2,
  Crown,
  Utensils,
  Coffee,
  ShieldCheck,
  Printer,
  X,
  Palette,
  Layers,
  MessageSquare,
  ShoppingBag,
  Gift,
  Ban,
  Tag,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building2
} from "lucide-react";
import { TableCopyEvent } from "../types";
import { copyToClipboard } from "../lib/clipboard";
import { PortalModal } from "./PortalModal";

interface TableQRManagerProps {
  merchantId: string;
  companyName: string;
  t: (key: string) => string;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const TableQRManager: React.FC<TableQRManagerProps> = ({
  merchantId,
  companyName,
  t,
  showToast
}) => {
  const [tableInput, setTableInput] = useState("Main Payment Gateway");
  const [selectedTable, setSelectedTable] = useState("Main Payment Gateway");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // QR Code Design Customization State (Theme & Logo Emblem)
  const [designTab, setDesignTab] = useState<"color_shape" | "logo">("color_shape");
  const [designStyle, setDesignStyle] = useState<"emerald" | "gold" | "cyber" | "table_tent">("emerald");
  const [emblem, setEmblem] = useState<"utensils" | "coffee" | "crown" | "shield" | "sparkles" | "telebirr" | "cbe">("utensils");
  const [qrColor, setQrColor] = useState<"emerald" | "gold" | "cyan" | "crimson" | "black">("emerald");
  const [tagline, setTagline] = useState("SCAN TO VIEW MENU & PAY VIA MOBILE BANKING");
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Table Activity Feed State
  const [activityEvents, setActivityEvents] = useState<TableCopyEvent[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [isLivePolling, setIsLivePolling] = useState(true);

  const presetTables = [
    "Main Payment Gateway",
    "Table 1", "Table 2", "Table 3", "Table 4", "Table 5",
    "Table 6", "Table 7", "Table 8", "Table 9", "Table 10",
    "Bar Counter", "VIP Section", "Terrace", "Room 101"
  ];

  // Calculate table link URL
  const appUrl = window.location.origin;
  const tableDirectoryUrl = `${appUrl}/u/${merchantId}?table=${encodeURIComponent(selectedTable)}`;

  // Fetch QR Code for target URL
  const fetchQrCode = async (targetUrl: string) => {
    setLoadingQr(true);
    try {
      const res = await fetch(`/api/public/qrcode?text=${encodeURIComponent(targetUrl)}`);
      if (!res.ok) throw new Error("Failed to generate QR Code");
      const data = await res.json();
      setQrDataUrl(data.dataUrl);
    } catch (err) {
      console.error("QR Code fetch error:", err);
      showToast("Could not generate QR code for this table", "error");
    } finally {
      setLoadingQr(false);
    }
  };

  // Fetch real-time Table Copy Activity Events
  const fetchActivityEvents = async () => {
    try {
      const res = await fetch("/api/merchant/table-activity");
      if (res.ok) {
        const data = await res.json();
        setActivityEvents(data);
      }
    } catch (e) {
      // Ignore polling transient errors
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    fetchQrCode(tableDirectoryUrl);
  }, [tableDirectoryUrl]);

  // Live Polling every 5 seconds for real-time table copy notifications
  useEffect(() => {
    fetchActivityEvents();
    if (!isLivePolling) return;
    const interval = setInterval(() => {
      fetchActivityEvents();
    }, 5000);
    return () => clearInterval(interval);
  }, [isLivePolling]);

  const handleCopyTableLink = async () => {
    const ok = await copyToClipboard(tableDirectoryUrl);
    if (ok) {
      setCopiedLink(true);
      showToast(`Copied QR link for ${selectedTable}!`, "success");
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      showToast("Copy failed — select & copy manually", "error");
    }
  };

  const handleClearActivity = async () => {
    try {
      const res = await fetch("/api/merchant/table-activity", {
        method: "DELETE"
      });
      if (res.ok) {
        setActivityEvents([]);
        showToast("Activity history cleared", "info");
      }
    } catch (e) {
      showToast("Failed to clear history", "error");
    }
  };

  // Emblem Icon Helper
  const renderEmblemIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case "coffee": return <Coffee className={className} />;
      case "crown": return <Crown className={className} />;
      case "shield": return <ShieldCheck className={className} />;
      case "sparkles": return <Sparkles className={className} />;
      case "utensils": default: return <Utensils className={className} />;
    }
  };

  // Aesthetic & Luxurious QR Card Download Generator
  const handleDownloadLuxuriousQr = () => {
    if (!qrDataUrl) {
      showToast("QR code not ready yet", "error");
      return;
    }

    const canvas = document.createElement("canvas");
    const width = 800;
    const height = 1040;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Dark Velvet / Obsidian Luxury Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (designStyle === "gold") {
      bgGrad.addColorStop(0, "#1F1404");
      bgGrad.addColorStop(0.5, "#0F0B02");
      bgGrad.addColorStop(1, "#040200");
    } else if (designStyle === "cyber") {
      bgGrad.addColorStop(0, "#031B2A");
      bgGrad.addColorStop(0.5, "#020E18");
      bgGrad.addColorStop(1, "#00050A");
    } else {
      // Emerald / Dark Luxe
      bgGrad.addColorStop(0, "#05291D");
      bgGrad.addColorStop(0.5, "#02120D");
      bgGrad.addColorStop(1, "#010805");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Outer Luxurious Border
    const margin = 32;
    const cardW = width - margin * 2;
    const cardH = height - margin * 2;
    const radius = 36;

    ctx.lineWidth = 6;
    if (designStyle === "gold") {
      ctx.strokeStyle = "#F59E0B";
    } else if (designStyle === "cyber") {
      ctx.strokeStyle = "#22D3EE";
    } else {
      ctx.strokeStyle = "#10B981";
    }

    ctx.beginPath();
    ctx.roundRect(margin, margin, cardW, cardH, radius);
    ctx.stroke();

    // Inner Hairline Accent
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.beginPath();
    ctx.roundRect(margin + 12, margin + 12, cardW - 24, cardH - 24, radius - 8);
    ctx.stroke();

    // 3. Company Name Banner Header
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText((companyName || "MERCHANT STORE").toUpperCase(), width / 2, 110);

    // 4. Table Badge Pill
    const pillW = 280;
    const pillH = 52;
    const pillX = (width - pillW) / 2;
    const pillY = 135;

    if (designStyle === "gold") {
      ctx.fillStyle = "#F59E0B";
    } else if (designStyle === "cyber") {
      ctx.fillStyle = "#06B6D4";
    } else {
      ctx.fillStyle = "#10B981";
    }
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 26);
    ctx.fill();

    ctx.fillStyle = "#020608";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText((selectedTable || "TABLE 9").toUpperCase(), width / 2, pillY + 34);

    // 5. White QR Background Container Box
    const qrBoxSize = 440;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 220;

    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 15;
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 32);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Load and Draw QR Code Image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const qrPadding = 32;
      const qrDrawSize = qrBoxSize - qrPadding * 2;
      ctx.drawImage(img, qrBoxX + qrPadding, qrBoxY + qrPadding, qrDrawSize, qrDrawSize);

      // 6. Draw Center Emblem Badge in middle of QR
      const emblemRadius = 38;
      const emblemX = width / 2;
      const emblemY = qrBoxY + qrBoxSize / 2;

      ctx.fillStyle = designStyle === "gold" ? "#0F0B02" : "#020E0A";
      ctx.strokeStyle = designStyle === "gold" ? "#F59E0B" : "#10B981";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(emblemX, emblemY, emblemRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Text/Icon inside center emblem
      ctx.fillStyle = designStyle === "gold" ? "#F59E0B" : "#10B981";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("MBD", emblemX, emblemY);

      // 7. Tagline Instruction Text
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText((tagline || "SCAN TO VIEW MENU & PAY VIA MOBILE BANKING").toUpperCase(), width / 2, 720);

      // 8. Banking Compatibility Footer
      ctx.fillStyle = designStyle === "gold" ? "#FBBF24" : "#34D399";
      ctx.font = "bold 16px monospace";
      ctx.fillText("ACCEPTED ETHIOPIAN MOBILE BANKING APPS", width / 2, 780);

      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "16px sans-serif";
      ctx.fillText("CBE Birr â€¢ Telebirr â€¢ Dashen Amole â€¢ Awash â€¢ Abyssinia", width / 2, 815);

      // Divider Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 220, 860);
      ctx.lineTo(width / 2 + 220, 860);
      ctx.stroke();

      // Footer Watermark
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.font = "12px sans-serif";
      ctx.fillText("POWERED BY MBD DIRECTORY", width / 2, 900);

      // Trigger Download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${companyName.replace(/\s+/g, "_")}_${selectedTable.replace(/\s+/g, "_")}_AestheticQR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast("Downloaded aesthetic & luxurious QR card!", "success");
    };
    img.src = qrDataUrl;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-luxury-card card-hairline rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-champagne/[0.07] rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-champagne/10 border border-champagne/30 rounded-xl">
                <QrCode className="w-5 h-5 text-champagne" />
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white">
                Attractive Table QR Codes & Live Scans
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Customize attractive, unique table QR stands with custom themes, logo emblems, and printable table tent cards. Get real-time alerts when customers scan and copy accounts!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-champagne to-champagne-dark text-luxury-bg font-sans font-bold text-xs rounded-xl flex items-center gap-2 hover:opacity-90 shadow-lg neon-glow transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-luxury-bg" />
              <span>Print Table Stand Card</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Table QR Code Generator & Designer */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-luxury-card border border-gray-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-neon-emerald" />
              <span>Table QR Code & Design Studio</span>
            </h3>

            {/* Table Selection / Custom Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Select Table or Enter Name:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tableInput}
                  onChange={(e) => setTableInput(e.target.value)}
                  placeholder="e.g. Table 9, Bar, Room 102"
                  className="flex-1 bg-luxury-bg border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald"
                />
                <button
                  onClick={() => {
                    if (tableInput.trim()) {
                      setSelectedTable(tableInput.trim());
                      showToast(`Generated QR code for ${tableInput.trim()}`, "success");
                    }
                  }}
                  className="px-4 py-2.5 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Quick Table Presets */}
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1.5">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {presetTables.map((tbl) => (
                  <button
                    key={tbl}
                    onClick={() => {
                      setTableInput(tbl);
                      setSelectedTable(tbl);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition cursor-pointer ${
                      selectedTable === tbl
                        ? "bg-champagne text-luxury-bg font-bold shadow-md"
                        : "bg-luxury-bg border border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {tbl}
                  </button>
                ))}
              </div>
            </div>

            {/* QR DESIGN Studio */}
            <div className="bg-luxury-bg border border-gray-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800/80">
                <span className="font-display font-black text-sm text-white tracking-wider uppercase flex items-center gap-2">
                  <Palette className="w-4 h-4 text-neon-emerald" />
                  <span>DESIGN STUDIO</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Theme & Emblem</span>
              </div>

              {/* Design Tabs: Theme & Color | Logo */}
              <div className="flex items-center border-b border-gray-800">
                <button
                  type="button"
                  onClick={() => setDesignTab("color_shape")}
                  className={`flex-1 py-2 text-xs font-bold transition text-center relative cursor-pointer ${
                    designTab === "color_shape" ? "text-neon-emerald" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span>Theme & Color</span>
                  {designTab === "color_shape" && (
                    <motion.div layoutId="designTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-emerald" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDesignTab("logo")}
                  className={`flex-1 py-2 text-xs font-bold transition text-center relative cursor-pointer ${
                    designTab === "logo" ? "text-neon-emerald" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span>Logo Emblem</span>
                  {designTab === "logo" && (
                    <motion.div layoutId="designTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-emerald" />
                  )}
                </button>
              </div>

              {/* TAB 1: Logo Overlay */}
              {designTab === "logo" && (
                <div className="space-y-3 pt-1">
                  <label className="text-[11px] font-medium text-gray-400 block">
                    Choose Center Emblem Logo:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "utensils", label: "Utensils", icon: <Utensils className="w-4 h-4" /> },
                      { id: "coffee", label: "Coffee", icon: <Coffee className="w-4 h-4" /> },
                      { id: "crown", label: "VIP Crown", icon: <Crown className="w-4 h-4" /> },
                      { id: "shield", label: "Pay Shield", icon: <ShieldCheck className="w-4 h-4" /> },
                      { id: "sparkles", label: "AI Star", icon: <Sparkles className="w-4 h-4" /> },
                      { id: "telebirr", label: "Telebirr", icon: <CreditCard className="w-4 h-4" /> },
                      { id: "cbe", label: "CBE Birr", icon: <Building2 className="w-4 h-4" /> }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEmblem(item.id as any)}
                        className={`p-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 cursor-pointer ${
                          emblem === item.id
                            ? "bg-neon-emerald/20 border-neon-emerald text-neon-emerald"
                            : "bg-black/40 border-gray-800 text-gray-400 hover:text-white"
                        }`}
                      >
                        {item.icon}
                        <span className="text-[10px]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Color & Shape */}
              {designTab === "color_shape" && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-medium text-gray-400 block mb-1.5">
                      QR Accent Color:
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { id: "emerald", label: "Emerald", color: "bg-emerald-500" },
                        { id: "gold", label: "Gold", color: "bg-amber-400" },
                        { id: "cyan", label: "Cyan", color: "bg-cyan-400" },
                        { id: "crimson", label: "Crimson", color: "bg-red-500" },
                        { id: "black", label: "Black", color: "bg-gray-900" }
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setQrColor(c.id as any)}
                          className={`flex-1 py-1.5 px-2 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            qrColor === c.id
                              ? "bg-white/10 border-white text-white"
                              : "bg-black/40 border-gray-800 text-gray-400 hover:text-white"
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${c.color}`} />
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-gray-400 block mb-1.5">
                      Stand Backing Theme:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDesignStyle("emerald")}
                        className={`p-2 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                          designStyle === "emerald"
                            ? "bg-emerald-950/60 border-neon-emerald text-neon-emerald"
                            : "bg-black/40 border-gray-800 text-gray-400"
                        }`}
                      >
                        <span>Neon Emerald Luxe</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDesignStyle("gold")}
                        className={`p-2 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                          designStyle === "gold"
                            ? "bg-amber-950/60 border-amber-400 text-amber-400"
                            : "bg-black/40 border-gray-800 text-gray-400"
                        }`}
                      >
                        <span>Gold & Velvet Regal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDesignStyle("cyber")}
                        className={`p-2 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                          designStyle === "cyber"
                            ? "bg-cyan-950/60 border-cyan-400 text-cyan-400"
                            : "bg-black/40 border-gray-800 text-gray-400"
                        }`}
                      >
                        <span>Cyber Dark Mode</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDesignStyle("table_tent")}
                        className={`p-2 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                          designStyle === "table_tent"
                            ? "bg-white text-gray-900 border-gray-300"
                            : "bg-black/40 border-gray-800 text-gray-400"
                        }`}
                      >
                        <span>Printable Table Tent</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tagline Footer Input */}
              <div className="pt-2 border-t border-gray-800/80">
                <label className="block text-[10px] font-medium text-gray-400 mb-1">
                  Card Instruction / Tagline:
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. SCAN TO VIEW MENU & PAY VIA MOBILE BANKING"
                  className="w-full bg-black/50 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald"
                />
              </div>
            </div>

            {/* Stylized Live QR Preview Card */}
            <div className="pt-2">
              {loadingQr ? (
                <div className="p-12 text-center text-gray-500 bg-luxury-bg border border-gray-800 rounded-2xl">
                  <RefreshCw className="w-8 h-8 text-neon-emerald animate-spin mx-auto mb-2" />
                  <p className="text-xs">Generating custom table code...</p>
                </div>
              ) : qrDataUrl ? (
                <div className="space-y-4">
                  {/* Dynamic Rendered Card based on designStyle */}
                  <div
                    className={`rounded-3xl p-6 text-center space-y-4 relative transition shadow-2xl border-2 ${
                      designStyle === "emerald"
                        ? "bg-gradient-to-b from-gray-900 via-luxury-card to-black border-neon-emerald/50 shadow-emerald-950/50"
                        : designStyle === "gold"
                        ? "bg-gradient-to-b from-amber-950/80 via-black to-luxury-card border-amber-500/60 shadow-amber-950/50"
                        : designStyle === "cyber"
                        ? "bg-black border-cyan-500/50 shadow-cyan-950/50"
                        : "bg-white text-gray-900 border-gray-300 shadow-xl"
                    }`}
                  >
                    {/* Header Ribbon */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-extrabold px-3 py-1 rounded-full uppercase ${
                        designStyle === "table_tent" ? "bg-gray-900 text-white" : "bg-luxury-bg border border-gray-800 text-gray-300"
                      }`}>
                        {companyName}
                      </span>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-display font-extrabold text-xs ${
                        designStyle === "emerald" ? "bg-champagne text-luxury-bg" :
                        designStyle === "gold" ? "bg-amber-400 text-gray-950" :
                        designStyle === "cyber" ? "bg-cyan-400 text-gray-950" : "bg-black text-white"
                      }`}>
                        {renderEmblemIcon(emblem, "w-3.5 h-3.5")}
                        <span>{selectedTable}</span>
                      </div>
                    </div>

                    {/* Styled QR Image Container */}
                    <div className="relative inline-block my-2">
                      <div className={`p-4 inline-block border-4 shadow-2xl relative transition-all rounded-2xl bg-white ${
                        designStyle === "emerald" ? "border-neon-emerald/40" :
                        designStyle === "gold" ? "border-amber-500/60" :
                        designStyle === "cyber" ? "border-cyan-400/60" : "border-gray-900"
                      }`}>
                        <img
                          src={qrDataUrl}
                          alt={`QR Code for ${selectedTable}`}
                          className="w-48 h-48 mx-auto object-contain"
                        />

                        {/* Center Emblem Watermark Overlay */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg ${
                          designStyle === "emerald" ? "bg-luxury-card border-neon-emerald text-neon-emerald" :
                          designStyle === "gold" ? "bg-gray-950 border-amber-400 text-amber-400" :
                          designStyle === "cyber" ? "bg-black border-cyan-400 text-cyan-400" : "bg-white border-gray-900 text-gray-900"
                        }`}>
                          {renderEmblemIcon(emblem, "w-5 h-5")}
                        </div>
                      </div>
                    </div>

                    {/* Instruction Footer Tagline */}
                    <div>
                      <p className={`text-[11px] font-display font-extrabold uppercase tracking-wide max-w-xs mx-auto leading-relaxed ${
                        designStyle === "table_tent" ? "text-gray-900" : "text-white"
                      }`}>
                        {tagline}
                      </p>
                      <p className={`text-[9px] font-mono mt-1 ${
                        designStyle === "table_tent" ? "text-gray-600" : "text-gray-400"
                      }`}>
                        CBE Birr â€¢ Telebirr â€¢ Dashen â€¢ Awash â€¢ Abyssinia
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-gray-800/40">
                      <button
                        onClick={() => setShowPrintModal(true)}
                        className="px-4 py-2 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-xl flex items-center gap-1.5 hover:opacity-90 transition shadow-md cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print / Preview Stand</span>
                      </button>

                      <button
                        onClick={handleDownloadLuxuriousQr}
                        className="px-4 py-2 bg-luxury-card border border-gray-800 text-gray-200 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-neon-emerald" />
                        <span>Download Aesthetic QR</span>
                      </button>

                      <button
                        onClick={handleCopyTableLink}
                        className="px-3.5 py-2 bg-luxury-card border border-gray-800 text-gray-400 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-neon-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Scanned & Copied Table Activity Feed */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-luxury-card border border-gray-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-white">
                    Live Table Copy & Scan Alerts
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Real-time log of customers scanning table QR codes and copying bank account numbers.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchActivityEvents}
                  className="p-2 bg-luxury-bg hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-xl transition cursor-pointer text-xs flex items-center gap-1"
                  title="Refresh activity feed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingActivity ? "animate-spin" : ""}`} />
                </button>
                {activityEvents.length > 0 && (
                  <button
                    onClick={handleClearActivity}
                    className="p-2 bg-luxury-bg hover:bg-red-950/40 border border-gray-800 hover:border-red-500/40 text-gray-400 hover:text-red-400 rounded-xl transition cursor-pointer"
                    title="Clear activity log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Live Feed List */}
            {activityEvents.length === 0 ? (
              <div className="p-12 text-center bg-luxury-bg border border-gray-800/80 rounded-2xl space-y-3">
                <Bell className="w-8 h-8 text-gray-600 mx-auto animate-pulse" />
                <h4 className="text-xs font-bold text-gray-400">No recent table scan or copy events yet</h4>
                <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                  When a customer scans a table QR code (like Table 9) and copies your CBE, Telebirr, or Dashen bank account number, it will immediately show up here in real time!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {activityEvents.map((event) => {
                  const eventTime = new Date(event.timestamp);
                  const formattedTime = eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const formattedDate = eventTime.toLocaleDateString();

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 520, damping: 30, mass: 0.6 }}
                      className="p-4 bg-luxury-bg border border-gray-800/90 rounded-2xl flex items-start justify-between gap-3 hover:border-neon-emerald/30 transition shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-extrabold text-xs rounded-xl shrink-0 mt-0.5">
                          {event.tableNumber || "Table"}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              Copied {event.bankName}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-950/50 border border-neon-emerald/30 text-neon-emerald text-[9px] font-mono rounded">
                              {event.accountNumber}
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-400 leading-snug">
                            Customer on <strong className="text-gray-200">{event.tableNumber}</strong> copied account number to make mobile banking payment.
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-neon-emerald font-bold block">
                          {formattedTime}
                        </span>
                        <span className="text-[9px] text-gray-500 block">
                          {formattedDate}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Table Tent QR Card Stand Modal */}
      <AnimatePresence>
        {showPrintModal && (
          <PortalModal
            open
            onClose={() => setShowPrintModal(false)}
            overlayClassName="bg-black/85 backdrop-blur-md"
            cardClassName="max-w-md bg-white text-gray-900 border-4 border-emerald-600 space-y-6 text-center"
          >
              <button
                onClick={() => setShowPrintModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black transition cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Card Header */}
              <div className="space-y-1 pt-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold font-mono rounded-full uppercase">
                  {companyName}
                </span>
                <h2 className="font-display font-black text-2xl text-gray-900 pt-1">
                  {selectedTable}
                </h2>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {tagline}
                </p>
              </div>

              {/* Printable High-Res QR Frame */}
              {qrDataUrl && (
                <div className="relative inline-block my-2">
                  <div className="p-5 bg-white border-4 border-gray-900 rounded-3xl inline-block shadow-2xl relative">
                    <img
                      src={qrDataUrl}
                      alt={`Printable QR code for ${selectedTable}`}
                      className="w-56 h-56 mx-auto object-contain"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-emerald-600 text-white border-2 border-white flex items-center justify-center shadow-lg">
                      {renderEmblemIcon(emblem, "w-6 h-6")}
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Logos Banner */}
              <div className="pt-1 pb-2 border-t border-b border-gray-200">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Supported Ethiopian Mobile Banking Apps
                </p>
                <p className="text-xs font-mono font-bold text-emerald-700">
                  CBE Birr â€¢ Telebirr â€¢ Dashen Amole â€¢ Awash â€¢ Abyssinia
                </p>
              </div>

              {/* Print Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Table Tent</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>
    </div>
  );
};
