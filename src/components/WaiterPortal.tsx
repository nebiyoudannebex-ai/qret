import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  FileText,
  DollarSign,
  User,
  LogOut,
  Building,
  Check,
  XCircle,
  HelpCircle,
  Video,
  VideoOff,
  Eye,
  Clock,
  Type,
  Maximize2,
  Minimize2,
  Activity,
  Zap,
  X,
  Sun,
  Focus,
  Sliders,
  RotateCcw
} from "lucide-react";
import { ReceiptScan } from "../types";
import { sanitizeInput } from "../lib/sanitize";
import { Portal } from "./PortalModal";
import { LanguageMenu } from "./LanguageMenu";

interface WaiterPortalProps {
  user: {
    id: string;
    username: string;
    name?: string;
    companyName?: string;
    merchantId?: string;
    assignedTable?: string;
  };
  onLogout: () => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  t: (key: string) => string;
  lang: "en" | "am";
  setLang: (l: "en" | "am") => void;
}

// Reusable AI verdict card (rendered inline on desktop and in the mobile bottom sheet)
const VerdictCard: React.FC<{ result: ReceiptScan; t: (key: string) => string }> = ({ result, t }) => {
  const v = result;
  return (
    <div
      className={`p-5 rounded-2xl border space-y-4 ${
        v.status === "verified"
          ? "bg-emerald-950/20 border-neon-emerald/40"
          : "bg-amber-950/20 border-amber-500/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-gray-300">{v.tableNumber}</span>
        <span
          className={`px-3 py-1 font-bold text-xs rounded-xl flex items-center gap-1.5 ${
            v.status === "verified" ? "bg-champagne text-luxury-bg" : "bg-amber-500 text-luxury-bg"
          }`}
        >
          {v.status === "verified" ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{t("LEGIT - VERIFIED")}</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>{t("SUSPICIOUS / CHECK")}</span>
            </>
          )}
        </span>
      </div>

      <div>
        <span className="text-[10px] font-mono text-gray-400 uppercase block">{t("Extracted Payment")}</span>
        <span className="text-2xl font-mono font-extrabold text-champagne">
          {v.amount ? `${v.amount.toLocaleString()} ETB` : "N/A"}
        </span>
      </div>

      <div className="space-y-2 text-xs text-gray-300 pt-3 border-t border-gray-800/80">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">{t("Platform:")}</span>
          <span className="font-bold text-white">{v.bankName}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">{t("Reference ID:")}</span>
          <span className="font-mono text-amber-300 font-bold">{v.referenceNumber}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">{t("Sender:")}</span>
          <span className="text-gray-200">{v.senderName}</span>
        </div>

        {v.recipientAccount && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{t("Recipient Acc:")}</span>
            <span className="font-mono text-neon-emerald font-bold">{v.recipientAccount}</span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{t("Legitimacy")}:</span>
            <span
              className={`font-mono font-extrabold text-base ${
                (v.confidenceScore ?? 0) >= 80
                  ? "text-neon-emerald"
                  : (v.confidenceScore ?? 0) >= 40
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {v.confidenceScore != null ? `${v.confidenceScore}%` : "N/A"}
            </span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                (v.confidenceScore ?? 0) >= 80
                  ? "bg-neon-emerald"
                  : (v.confidenceScore ?? 0) >= 40
                  ? "bg-amber-400"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, v.confidenceScore ?? 0))}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5">
            {t("Lower score means higher chance the receipt was edited, reused, or paid to a wrong account")}
          </p>
        </div>
      </div>

      {/* Audit Checklist Features */}
      <div className="space-y-2.5 pt-2 border-t border-gray-800 text-[11px]">
        <div className="text-gray-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-neon-emerald" />
              <span>{t("Merchant Account Match:")}</span>
            </span>
            <span className={v.notes?.includes("UNMATCHED RECIPIENT") ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
              {v.notes?.includes("UNMATCHED RECIPIENT") ? t("ACCOUNT MISMATCH") : t("VERIFIED MATCH")}
            </span>
          </div>
          {v.recipientAccount && (
            <p className="text-[10px] text-gray-500 mt-0.5 ml-5">
              {t("Recipient Acc:")} <span className="font-mono text-gray-400">{v.recipientAccount}</span>
            </p>
          )}
        </div>

        <div className="text-gray-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-champagne/80" />
              <span>{t("Typography & Font Alignment:")}</span>
            </span>
            <span className="text-emerald-400 font-bold">{t("Checked")}</span>
          </div>
          {v.spellingAndFontCheck && (
            <p className="text-[10px] text-gray-500 mt-0.5 ml-5">{v.spellingAndFontCheck}</p>
          )}
        </div>

        <div className="text-gray-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("Time Window Validity:")}</span>
            </span>
            <span className="text-emerald-400 font-bold">{t("Checked")}</span>
          </div>
          {v.timePeriodCheck && (
            <p className="text-[10px] text-gray-500 mt-0.5 ml-5">{v.timePeriodCheck}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-gray-300">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-neon-emerald" />
            <span>{t("Duplicate Scan Check:")}</span>
          </span>
          <span className={v.confidenceScore < 40 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
            {v.confidenceScore < 40 ? t("DUPLICATE FOUND") : t("Passed")}
          </span>
        </div>
      </div>

      <div className="p-3 bg-luxury-bg rounded-xl border border-gray-800 text-xs text-gray-300 leading-relaxed">
        <strong className="text-neon-emerald block mb-0.5">{t("Gemini AI Audit Findings:")}</strong>
        {sanitizeInput(v.notes)}
      </div>

      {v.verificationCaveat && (
        <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/25 text-xs text-amber-200/90 leading-relaxed">
          <strong className="flex items-center gap-1.5 text-amber-300 block mb-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {t("Why AI Is Not 100% Certain")}
          </strong>
          {v.verificationCaveat}
        </div>
      )}
    </div>
  );
};

export const WaiterPortal: React.FC<WaiterPortalProps> = ({
  user,
  onLogout,
  showToast,
  t,
  lang,
  setLang
}) => {
  const [tableNumber, setTableNumber] = useState(user.assignedTable || "Table 9");
  const [scanMode, setScanMode] = useState<"live-camera" | "file-upload">("live-camera");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Language the currently displayed verdict content was generated in ("en"/"am")
  const [verdictLang, setVerdictLang] = useState<"en" | "am">(lang);

  // Camera stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isStartingRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Camera Adjustments (Auto Focus, Brightness & Contrast)
  const [brightness, setBrightness] = useState(100); // 50 to 200
  const [contrast, setContrast] = useState(100); // 50 to 200
  const [focusing, setFocusing] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);

  // Trigger hardware focus and visual indicator
  const handleTriggerFocus = (e?: React.MouseEvent<HTMLDivElement>) => {
    if (e && videoRef.current) {
      const rect = videoRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setFocusPoint({ x, y });
      setTimeout(() => setFocusPoint(null), 1200);
    } else {
      setFocusPoint({ x: 180, y: 180 });
      setTimeout(() => setFocusPoint(null), 1200);
    }

    setFocusing(true);
    setTimeout(() => setFocusing(false), 800);

    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && "applyConstraints" in track) {
        (track as any).applyConstraints({
          advanced: [{ focusMode: "continuous" }]
        }).catch(() => {});
      }
    }
  };

  const handleAutoEnhance = () => {
    setBrightness(115);
    setContrast(125);
    handleTriggerFocus();
  };

  const handleResetCameraFilters = () => {
    setBrightness(100);
    setContrast(100);
  };

  // Scanned verification result
  const [lastScanResult, setLastScanResult] = useState<ReceiptScan | null>(null);

  // Recent scans by this waiter
  const [recentScans, setRecentScans] = useState<ReceiptScan[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Diagnostic mount counter (a remount without a full page reload increments this)
  const mountCount = useRef(0);
  if (mountCount.current === 0) {
    const w = window as any;
    w.__mbd_portalMounts = (w.__mbd_portalMounts || 0) + 1;
    console.warn("[DIAG] WaiterPortal mounted. Total mounts:", w.__mbd_portalMounts, "| navType:", (performance.getEntriesByType("navigation")[0] as any)?.type);
  }
  mountCount.current++;

  // Restore the last verdict across remounts / full reloads so it can never be lost
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("mbd_last_scan");
      if (saved) {
        const parsed = JSON.parse(saved);
        const restored = parsed && parsed.result ? parsed.result : parsed;
        const savedLang: "en" | "am" = parsed && parsed.lang ? parsed.lang : "en";
        setLastScanResult(restored);
        setVerdictLang(savedLang);
        console.warn("[DIAG] Restored last scan verdict from sessionStorage (lang:", savedLang + ")");
        if (savedLang !== lang) {
          translateVerdict(restored, savedLang);
        }
      }
    } catch (e) {
      console.warn("[DIAG] Could not restore last scan verdict", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the verdict in the current UI language whenever the user switches languages
  useEffect(() => {
    if (lastScanResult && verdictLang !== lang) {
      translateVerdict(lastScanResult, verdictLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Translate the AI-generated verdict fields (notes, caveats, checks) into the current UI language
  const translateVerdict = async (result: ReceiptScan, fromLang: "en" | "am") => {
    if (lang === fromLang) return;
    const fields: (keyof ReceiptScan)[] = ["notes", "verificationCaveat", "spellingAndFontCheck", "timePeriodCheck"];
    const texts = fields.map((f) => String(result[f] || "").trim()).filter(Boolean);
    if (texts.length === 0) return;
    try {
      const res = await fetch("/api/staff/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ texts, targetLang: lang })
      });
      if (!res.ok) {
        console.warn("[DIAG] Verdict translation failed:", await res.text().catch(() => ""));
        return;
      }
      const data = await res.json();
      const translated: string[] = Array.isArray(data.translated) ? data.translated : [];
      if (translated.length === 0) return;
      let i = 0;
      const updated: ReceiptScan = {
        ...result,
        notes: result.notes && result.notes.trim() ? translated[i++] : result.notes,
        verificationCaveat: result.verificationCaveat && result.verificationCaveat.trim() ? translated[i++] : result.verificationCaveat,
        spellingAndFontCheck: result.spellingAndFontCheck && result.spellingAndFontCheck.trim() ? translated[i++] : result.spellingAndFontCheck,
        timePeriodCheck: result.timePeriodCheck && result.timePeriodCheck.trim() ? translated[i++] : result.timePeriodCheck
      };
      setLastScanResult(updated);
      setVerdictLang(lang);
      try {
        sessionStorage.setItem("mbd_last_scan", JSON.stringify({ result: updated, lang }));
      } catch (e) {
        console.warn("[DIAG] Could not persist translated verdict", e);
      }
    } catch (e) {
      console.warn("[DIAG] Verdict translation request failed", e);
    }
  };

  // Toggle fullscreen mode (with webkit vendor prefix fallback for iOS/Mobile)
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      const doc = document as any;
      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        if (doc.exitFullscreen) {
          doc.exitFullscreen().catch(() => {});
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen().catch(() => {});
        }
      }
    }
  };

  // Fetch scan history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/merchant/receipt-scans");
      if (res.ok) {
        const data = await res.json();
        setRecentScans(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Start live camera stream with high resolution & continuous focus
  const startCamera = async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setCameraError(null);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 30 }
          },
          audio: false
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        if (videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream;
        }
        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          if (playErr.name !== "AbortError") {
            console.log("Play request handled safely:", playErr);
          }
        }

        // Try requesting focusMode continuous
        const track = stream.getVideoTracks()[0];
        if (track && "applyConstraints" in track) {
          (track as any).applyConstraints({
            advanced: [{ focusMode: "continuous" }]
          }).catch(() => {});
        }
      }

      setCameraActive(true);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Camera access error:", err);
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        if (!window.isSecureContext && !isLocalhost) {
          setCameraError(t("Camera requires a secure (HTTPS) connection. Open this site via HTTPS or use the file upload mode below instead."));
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError(t("Camera permission was denied. Please allow camera access in your browser settings, or use the file upload mode below instead."));
        } else if (err.name === "NotFoundError") {
          setCameraError(t("No camera was found on this device. You can upload a receipt photo instead."));
        } else {
          setCameraError(t("Camera access denied or restricted by permissions. You can upload a receipt photo instead."));
        }
        setCameraActive(false);
      }
    } finally {
      isStartingRef.current = false;
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    isStartingRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Compress/downscale an image (data URL) for fast, reliable upload on mobile networks
  const compressImage = (dataUrl: string, maxDim = 1600, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          const scale = Math.min(1, maxDim / Math.max(width, height));
          width = Math.round(width * scale);
          height = Math.round(height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not supported"));
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = dataUrl;
    });
  };

  useEffect(() => {
    if (scanMode === "live-camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanMode]);

  // Re-bind video stream safely whenever fullscreen toggles
  useEffect(() => {
    if (scanMode === "live-camera" && streamRef.current && videoRef.current) {
      const isLive = streamRef.current.getVideoTracks().some(t => t.readyState === "live");
      if (isLive) {
        if (videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isFullscreen, scanMode]);

  // Capture high quality video frame to base64
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // Apply user camera brightness and contrast settings directly onto canvas context
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.95);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast(t("File size too large. Maximum 8MB allowed."), "error");
      return;
    }

    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit scan to Gemini AI
  const executeScan = async (base64Img: string) => {
    setScanning(true);
    setLastScanResult(null);
    setScanError(null);
    localStorage.setItem("mbd_scan_marker", String(Date.now()));

    try {
      let finalImage = base64Img;
      try {
        finalImage = await compressImage(base64Img);
      } catch (compressErr) {
        console.warn("Image compression failed, sending original:", compressErr);
      }

      const res = await fetch("/api/staff/scan-bill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageBase64: finalImage,
          mimeType: mimeType || "image/jpeg",
          tableNumber: tableNumber.trim() || "Table 9",
          notes: notesInput.trim(),
          lang
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze receipt");
      }

      setLastScanResult(data);
      setScanError(null);
      setVerdictLang(lang);
      try {
        sessionStorage.setItem("mbd_last_scan", JSON.stringify({ result: data, lang }));
      } catch (e) {
        console.warn("[DIAG] Could not persist verdict", e);
      }
      if (data.status === "verified") {
        showToast(t("VERIFIED: Legitimate payment of __AMOUNT__ ETB auto-saved to merchant records!").replace("__AMOUNT__", String(data.amount)), "success");
      } else {
        showToast(t("SUSPICIOUS RECEIPT DETECTED: Review the AI fraud report"), "error");
      }

      // If scanning from the fullscreen overlay, exit it so the verdict is visible
      if (isFullscreen) {
        toggleFullscreen();
      }
      // On mobile the verdict slides up as a bottom sheet; on desktop scroll to the inline panel
      setSheetOpen(true);
      if (window.innerWidth >= 1024) {
        setTimeout(() => {
          document.getElementById("scan-result-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }

      // Reset image input if file upload and refresh history
      if (scanMode === "file-upload") {
        setReceiptImage(null);
      }
      setNotesInput("");
      fetchHistory();
    } catch (err: any) {
      console.error("Scan failed:", err);
      setScanError(err?.message || t("Error analyzing bill receipt"));
      showToast(err.message || t("Error analyzing bill receipt"), "error");
    } finally {
      localStorage.removeItem("mbd_scan_marker");
      setScanning(false);
    }
  };

  const handleScanClick = () => {
    if (scanMode === "live-camera") {
      const frameData = captureFrame();
      if (!frameData) {
        showToast(t("Unable to capture video frame. Make sure camera is active."), "error");
        return;
      }
      executeScan(frameData);
    } else {
      if (!receiptImage) {
        showToast(t("Please upload or take a photo of the receipt first."), "error");
        return;
      }
      executeScan(receiptImage);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-bg text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      {/* Hidden canvas for capturing live video frame */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Waiter Header */}
        <div className="bg-luxury-card card-hairline rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-champagne/[0.06] rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="p-3 bg-champagne/10 border border-champagne/30 rounded-2xl text-champagne">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-950/60 border border-neon-emerald/30 text-neon-emerald font-mono font-bold text-xs rounded-full">
                  {t("Real-Time Waiter Scanner")}
                </span>
                <span className="text-xs text-gray-400">
                  {user.companyName || t("Merchant Restaurant")}
                </span>
              </div>
              <h1 className="font-display font-extrabold text-xl text-white mt-1">
                {user.name || user.username}
              </h1>
              <p className="text-xs text-gray-400">
                {t("Assigned Table:")} <strong className="text-neon-emerald">{tableNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <LanguageMenu lang={lang} onSelect={(l) => { setLang(l); localStorage.setItem("mbd_lang", l); }} />
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-luxury-bg hover:bg-red-950/40 border border-gray-800 hover:border-red-500/30 text-gray-400 hover:text-red-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("Sign Out")}</span>
            </button>
          </div>
        </div>

        {/* Main Section: Live Scanner & Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Camera / File Upload Scanner */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-luxury-card border border-gray-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neon-emerald" />
                  <h2 className="font-display font-extrabold text-base text-white">
                    {t("Live Bill Verification")}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mode Toggles */}
                  <div className="bg-luxury-bg border border-gray-800 p-1 rounded-xl flex items-center gap-1">
                    <button
                      onClick={() => setScanMode("live-camera")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition ${
                        scanMode === "live-camera"
                          ? "bg-champagne text-luxury-bg shadow-md"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{t("Live Cam")}</span>
                    </button>
                    <button
                      onClick={() => setScanMode("file-upload")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition ${
                        scanMode === "file-upload"
                          ? "bg-champagne text-luxury-bg shadow-md"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t("Upload")}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Multi-Table Quick Selector (When 1 waiter manages multiple tables) */}
              <div className="space-y-2 bg-luxury-bg p-3.5 border border-gray-800/80 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-neon-emerald" />
                    <span>{t("Multi-Table Manager")}</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{t("Tap table to active scan")}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {["Table 1", "Table 2", "Table 3", "Table 4", "Table 5", "Table 6", "VIP 1", "Bar 1"].map((tbl) => (
                    <button
                      key={tbl}
                      type="button"
                      onClick={() => setTableNumber(tbl)}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-xl border transition cursor-pointer ${
                        tableNumber.toLowerCase() === tbl.toLowerCase()
                          ? "bg-champagne text-luxury-bg border-neon-emerald shadow-md"
                          : "bg-luxury-card text-gray-300 border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      {tbl}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-[10px] text-gray-500 font-semibold">{t("Custom:")}</span>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder={t("e.g. T-12")}
                      className="w-20 bg-luxury-card border border-gray-700 rounded-xl px-2 py-0.5 text-xs text-center text-neon-emerald focus:outline-none focus:border-neon-emerald font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Viewfinder Mode 1: Real-time Camera Feed (Tall phone layout with Full Screen toggle) */}
              {scanMode === "live-camera" && (
                <div
                  onClick={handleTriggerFocus}
                  className="relative rounded-2xl overflow-hidden border-2 border-neon-emerald/40 bg-black min-h-[440px] sm:min-h-[500px] h-[480px] flex items-center justify-center group shadow-2xl cursor-crosshair"
                >
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                    className="w-full h-full object-cover transition-all duration-200"
                  />

                  {/* Visual Focus Ring on Click/Tap */}
                  {focusPoint && (
                    <div
                      className="absolute w-16 h-16 border-2 border-neon-emerald rounded-full animate-ping pointer-events-none -translate-x-1/2 -translate-y-1/2"
                      style={{ left: focusPoint.x, top: focusPoint.y }}
                    />
                  )}

                  {/* Full Screen Scanner Trigger Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="absolute top-4 right-4 z-10 px-3.5 py-2 bg-black/80 backdrop-blur-md hover:bg-black border border-neon-emerald/60 text-neon-emerald font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xl transition cursor-pointer hover:scale-105"
                  >
                    <Maximize2 className="w-4 h-4 text-neon-emerald" />
                    <span>{t("FULL SCREEN")}</span>
                  </button>

                  {/* Camera Viewfinder Corners Overlay */}
                  <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-xl flex flex-col justify-between p-3">
                    <div className="flex justify-between">
                      <div className="w-6 h-6 border-t-2 border-l-2 border-neon-emerald" />
                      <div className="w-6 h-6 border-t-2 border-r-2 border-neon-emerald" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-6 h-6 border-b-2 border-l-2 border-neon-emerald" />
                      <div className="w-6 h-6 border-b-2 border-r-2 border-neon-emerald" />
                    </div>
                  </div>

                  {/* Animated Scanner Laser Sweep Line */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-neon-emerald/20 rounded-2xl">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-neon-emerald to-transparent animate-pulse shadow-[0_0_20px_#10b981] absolute top-1/2 -translate-y-1/2" />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md border border-neon-emerald/40 text-neon-emerald font-mono text-[11px] font-bold rounded-full flex items-center gap-2 shadow-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-neon-emerald animate-ping" />
                      <span>{t("LIVE SCANNER ACTIVE")} — {tableNumber}</span>
                    </div>
                  </div>

                  {/* Live Camera Brightness & Auto Focus Controls Toolbar */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-3 left-3 right-3 z-20 bg-black/85 backdrop-blur-md border border-gray-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-1.5 text-xs shadow-2xl"
                  >
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setBrightness((b) => Math.max(50, b - 15))}
                        title="Decrease Brightness"
                        className="px-2 py-1.5 bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-300 font-bold rounded-xl hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>-</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBrightness((b) => Math.min(200, b + 15))}
                        title="Increase Brightness"
                        className="px-2 py-1.5 bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-300 font-bold rounded-xl hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>+</span>
                      </button>
                      <span className="text-[10px] font-mono font-bold text-amber-300 hidden sm:inline px-1">
                        {brightness}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleTriggerFocus()}
                        className="px-2.5 py-1.5 bg-luxury-card border border-neon-emerald/40 hover:border-neon-emerald text-neon-emerald font-bold rounded-xl hover:bg-neon-emerald/10 transition cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <Focus className="w-3.5 h-3.5" />
                        <span>{t("Focus")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAutoEnhance}
                        className="px-2.5 py-1.5 bg-champagne text-luxury-bg font-bold rounded-xl hover:opacity-90 transition cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t("Auto Enhance")}</span>
                      </button>

                      {(brightness !== 100 || contrast !== 100) && (
                        <button
                          type="button"
                          onClick={handleResetCameraFilters}
                          title="Reset camera settings"
                          className="p-1.5 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white rounded-xl transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {cameraError && (
                    <div className="absolute inset-0 bg-luxury-card/95 p-6 flex flex-col items-center justify-center text-center space-y-4 z-10">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
                        <VideoOff className="w-8 h-8" />
                      </div>
                      <div className="space-y-1 max-w-xs">
                        <h4 className="text-sm font-bold text-white">{t("Camera Access Restricted")}</h4>
                        <p className="text-xs text-amber-300/90 font-medium">{cameraError}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 w-full max-w-xs">
                        <button
                          type="button"
                          onClick={() => setScanMode("file-upload")}
                          className="w-full py-2.5 bg-champagne text-luxury-bg text-xs font-bold rounded-xl shadow-lg hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{t("Upload Image Instead")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="w-full py-2.5 bg-luxury-bg border border-gray-700 text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-800 hover:text-white transition cursor-pointer"
                        >
                          {t("Retry Camera")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Viewfinder Mode 2: File Upload */}
              {scanMode === "file-upload" && (
                <div>
                  {receiptImage ? (
                    <div className="relative bg-luxury-bg border-2 border-neon-emerald/30 rounded-2xl p-4 text-center">
                      <img
                        src={receiptImage}
                        alt="Uploaded receipt"
                        className="max-h-64 mx-auto rounded-xl object-contain shadow-lg"
                      />
                      <button
                        onClick={() => setReceiptImage(null)}
                        className="mt-3 px-3 py-1 bg-red-950/60 border border-red-500/40 text-red-400 text-xs rounded-xl hover:bg-red-900/60 transition cursor-pointer"
                      >
                        {t("Remove & Choose Another")}
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-800 hover:border-neon-emerald/50 bg-luxury-bg rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition group">
                      <div className="p-4 bg-luxury-card rounded-2xl border border-gray-800 group-hover:scale-110 transition duration-300">
                        <Upload className="w-8 h-8 text-neon-emerald" />
                      </div>
                      <p className="font-display font-bold text-sm text-white mt-3">
                        {t("Upload Payment Receipt Screenshot")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">
                        {t("Supports Telebirr, CBE Birr, CBE Mobile, Dashen, Awash, Abyssinia, Coop Bank")}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  {t("Waiter Note (Optional):")}
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder={t("e.g. Table 9 Customer paid via Telebirr")}
                  className="w-full bg-luxury-bg border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald"
                />
              </div>

              {/* Scan Trigger Button */}
              <button
                onClick={handleScanClick}
                disabled={scanning || (scanMode === "file-upload" && !receiptImage)}
                className="w-full py-4 bg-champagne text-luxury-bg font-display font-bold text-sm rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition shadow-xl cursor-pointer disabled:opacity-40"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{t("Gemini AI Checking Typography, Time & Reference ID...")}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>{t("Scan Frame & Verify Legitimacy")}</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-2">
                <Check className="w-3.5 h-3.5 text-neon-emerald" />
                <span>{t("Scanned images and fraud logs auto-save directly to merchant account")}</span>
              </div>
            </div>
          </div>

          {/* Right Column: AI Legitimacy Audit Report */}
          <div id="scan-result-panel" className="lg:col-span-5 space-y-6">
            <div className="bg-luxury-card border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="font-display font-extrabold text-base text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-neon-emerald" />
                  <span>{t("AI Fraud Audit Report")}</span>
                </span>
                {lastScanResult && (
                  <span className="text-[10px] font-mono text-neon-emerald bg-emerald-950/60 border border-neon-emerald/30 px-2 py-0.5 rounded-full">
                    {t("Auto-Saved")}
                  </span>
                )}
              </h3>

              {lastScanResult?.profilesCount === 0 && (
                <div className="p-3 bg-sky-950/20 border border-sky-500/30 rounded-2xl text-[11px] text-sky-200/90 leading-relaxed">
                  <strong className="flex items-center gap-1.5 text-sky-300 block mb-1">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    {t("No registered payment accounts")}
                  </strong>
                  {t("This merchant has no active bank accounts registered, so the AI cannot confirm the recipient matches. Add bank options in the merchant Payment Directory tab, then rescan.")}
                </div>
              )}

              {scanError && (
                <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{t("AI Scan Failed")}</span>
                  </div>
                  <p className="text-[11px] text-red-300/90 leading-relaxed break-words">{scanError}</p>
                  <p className="text-[11px] text-gray-400">
                    {t("Check your internet connection and API key, then try scanning the receipt again.")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setScanError(null)}
                    className="px-3 py-1.5 bg-luxury-bg border border-gray-700 text-gray-300 text-xs rounded-xl hover:bg-gray-800 cursor-pointer"
                  >
                    {t("Dismiss")}
                  </button>
                </div>
              )}

              {!lastScanResult ? (
                <div className="p-8 text-center bg-luxury-bg border border-gray-800/80 rounded-2xl space-y-2">
                  <Eye className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs font-bold text-gray-400">{t("Ready for Live Scan")}</p>
                  <p className="text-[11px] text-gray-500">
                    {t("Align the customer's phone receipt inside the camera view and click \"Scan Frame\". Gemini AI will check typography, timestamps, reference structure, and duplicate uses.")}
                  </p>
                </div>
              ) : (
                <div className="hidden lg:block">
                  <VerdictCard result={lastScanResult} t={t} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Table of Recent Scans by Waiter */}
        <div className="bg-luxury-card border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div>
              <h3 className="font-display font-extrabold text-base text-white">
                {t("Merchant Saved Scans History")}
              </h3>
              <p className="text-xs text-gray-400">{t("All scans are permanently logged to the restaurant account")}</p>
            </div>

            <button
              onClick={fetchHistory}
              className="p-2 bg-luxury-bg hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
              <span>{t("Refresh")}</span>
            </button>
          </div>

          {recentScans.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">{t("No saved scanned bills yet.")}</p>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {recentScans.map((scan) => (
                <motion.div
                  layout
                  key={scan.id}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 520, damping: 30, mass: 0.6 }}
                  className="p-3.5 bg-luxury-bg border border-gray-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-luxury-card border border-gray-700 text-neon-emerald font-mono font-bold text-xs rounded-lg">
                      {scan.tableNumber || t("Table")}
                    </span>
                    <div>
                      <span className="font-bold text-white block">
                        {scan.amount ? `${scan.amount.toLocaleString()} ETB` : t("Unknown Amount")} — {scan.bankName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {t("Ref:")} <strong className="text-amber-300">{scan.referenceNumber}</strong> | {t("Staff:")} {scan.staffName}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg ${
                      scan.status === "verified"
                        ? "bg-emerald-950/60 border border-neon-emerald/40 text-neon-emerald"
                        : "bg-amber-950/60 border border-amber-500/40 text-amber-400"
                    }`}
                  >
                    {scan.status.toUpperCase()}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FULL SCREEN CAMERA SCANNER OVERLAY — portalled to body (escapes transformed parents) */}
      <Portal>
      {isFullscreen && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col justify-between p-3 sm:p-6 overflow-hidden select-none h-screen min-h-[100dvh]">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2 z-20 bg-black/80 backdrop-blur-md p-3.5 rounded-2xl border border-gray-800 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-neon-emerald animate-ping" />
              <div>
                <span className="text-xs font-mono font-bold text-champagne block">
                  {t("FULL SCREEN AI SCANNER")}
                </span>
                <span className="text-[10px] text-gray-400">{t("High-Res Camera & Continuous Focus")}</span>
              </div>
            </div>

            {/* Multi-Table quick switcher in Full Screen */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[45vw] sm:max-w-[55vw] py-1 px-1 custom-scrollbar">
              {["Table 1", "Table 2", "Table 3", "Table 4", "Table 5", "Table 6", "VIP 1", "Bar 1"].map((tbl) => (
                <button
                  key={tbl}
                  type="button"
                  onClick={() => setTableNumber(tbl)}
                  className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded-xl border transition shrink-0 cursor-pointer ${
                    tableNumber.toLowerCase() === tbl.toLowerCase()
                      ? "bg-champagne text-luxury-bg border-neon-emerald shadow-lg font-black scale-105"
                      : "bg-gray-900 text-gray-300 border-gray-800 hover:bg-gray-800"
                  }`}
                >
                  {tbl}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl border border-gray-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
            >
              <Minimize2 className="w-4 h-4 text-neon-emerald" />
              <span className="hidden sm:inline">{t("Exit Fullscreen")}</span>
            </button>
          </div>

          {/* Center Viewport */}
          <div className="relative flex-1 my-3 rounded-3xl overflow-hidden border-2 border-neon-emerald/50 bg-black flex items-center justify-center shadow-2xl">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            {/* Corner Framing Brackets */}
            <div className="absolute inset-8 sm:inset-16 pointer-events-none border border-neon-emerald/20 rounded-3xl flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <div className="w-10 h-10 border-t-4 border-l-4 border-neon-emerald rounded-tl-2xl shadow-[0_0_20px_#10b981]" />
                <div className="w-10 h-10 border-t-4 border-r-4 border-neon-emerald rounded-tr-2xl shadow-[0_0_20px_#10b981]" />
              </div>
              <div className="flex justify-between">
                <div className="w-10 h-10 border-b-4 border-l-4 border-neon-emerald rounded-bl-2xl shadow-[0_0_20px_#10b981]" />
                <div className="w-10 h-10 border-b-4 border-r-4 border-neon-emerald rounded-br-2xl shadow-[0_0_20px_#10b981]" />
              </div>
            </div>

            {/* Center Focus Reticle */}
            <div className="absolute pointer-events-none flex flex-col items-center gap-1.5">
              <div className="w-24 h-24 border-2 border-dashed border-neon-emerald/70 rounded-full animate-spin-slow flex items-center justify-center">
                <div className="w-3.5 h-3.5 bg-neon-emerald rounded-full shadow-[0_0_15px_#10b981]" />
              </div>
              <span className="text-[10px] font-mono text-neon-emerald bg-black/85 px-3 py-1 rounded-full border border-neon-emerald/50 font-bold uppercase tracking-wider shadow-lg">
                {t("ALIGN BILL RECEIPT HERE")}
              </span>
            </div>

            {/* Animated Laser Sweep */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-neon-emerald to-transparent animate-pulse shadow-[0_0_25px_#10b981] absolute top-1/2 -translate-y-1/2" />
            </div>

            {/* Active Table Badge */}
            <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md px-4 py-2 rounded-full border border-neon-emerald/40 text-neon-emerald font-mono font-bold text-xs flex items-center gap-2 shadow-xl">
              <Activity className="w-4 h-4 text-neon-emerald" />
              <span>{t("ACTIVE TABLE:")} {tableNumber}</span>
            </div>

            {cameraError && (
              <div className="absolute inset-0 bg-luxury-card/95 p-6 flex flex-col items-center justify-center text-center space-y-4 z-30">
                <VideoOff className="w-10 h-10 text-amber-400" />
                <p className="text-xs text-amber-300 font-semibold">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-champagne text-luxury-bg font-bold text-xs rounded-xl shadow-lg"
                >
                  {t("Retry Camera")}
                </button>
              </div>
            )}
          </div>

          {/* Bottom Bar Controls */}
          <div className="z-20 bg-black/85 backdrop-blur-md p-4 rounded-3xl border border-gray-800 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder={t("Optional note: Customer paid via Telebirr / CBE Birr...")}
                className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neon-emerald font-sans"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  toggleFullscreen();
                  setScanMode("file-upload");
                }}
                className="px-4 py-3.5 bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold text-xs rounded-2xl border border-gray-800 transition cursor-pointer shrink-0"
              >
                {t("Upload Photo")}
              </button>

              <button
                type="button"
                onClick={handleScanClick}
                disabled={scanning}
                className="flex-1 py-4 bg-champagne text-luxury-bg font-display font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2.5 hover:opacity-90 transition shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer disabled:opacity-40"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{t("GEMINI AI DETECTING ALL RECEIPT DETAILS...")}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>{t("SNAP & DETECT WITH AI")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </Portal>

      {/* Floating button to reopen the verdict on mobile after the sheet is closed */}
      {lastScanResult && !sheetOpen && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="fixed bottom-4 right-4 z-[100000] lg:hidden flex items-center gap-2 px-4 py-3 bg-champagne text-luxury-bg font-display font-extrabold text-xs rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          {t("View AI Report")}
        </button>
      )}

      {/* Mobile AI Verdict Bottom Sheet — portalled to body (escapes transformed parents) */}
      <Portal>
      <AnimatePresence>
        {lastScanResult && sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100001] lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-[100002] lg:hidden bg-luxury-card border-t border-champagne/25 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-800 shrink-0">
                <div className="flex items-center gap-2">
                  {lastScanResult.status === "verified" ? (
                    <CheckCircle2 className="w-5 h-5 text-neon-emerald" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <span className="font-display font-extrabold text-sm text-white">
                    {lastScanResult.status === "verified" ? t("LEGIT - VERIFIED") : t("SUSPICIOUS / CHECK")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="p-2 bg-luxury-bg border border-gray-800 text-gray-400 hover:text-white rounded-xl transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto px-5 pt-4 pb-3 space-y-4">
                <VerdictCard result={lastScanResult} t={t} />
              </div>
              <div className="p-4 border-t border-gray-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="w-full py-3.5 bg-champagne text-luxury-bg font-display font-extrabold text-sm rounded-2xl hover:opacity-90 transition cursor-pointer"
                >
                  {t("Close")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </Portal>
    </div>
  );
};
