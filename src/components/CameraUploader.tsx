import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, RefreshCw, Check, Image as ImageIcon, Sparkles, SwitchCamera, Sun, Focus, RotateCcw, Maximize2, Minimize2 } from "lucide-react";

interface CameraUploaderProps {
  onCapture: (imageBase64: string, mimeType: string) => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  t?: (key: string) => string;
}

export const CameraUploader: React.FC<CameraUploaderProps> = ({
  onCapture,
  onClose,
  title = "Camera & Image Upload",
  subtitle = "Snap a photo using your camera or upload an image file from your device.",
  t = (k) => k
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("camera");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState("image/jpeg");
  
  // Camera state & adjustments
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Native HTML5 & Viewport Fullscreen Handler for Mobile
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isStartingRef = useRef(false);

  // Brightness & Auto Focus Controls
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [focusing, setFocusing] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);

  // Trigger focus
  const handleTriggerFocus = (e?: React.MouseEvent<HTMLDivElement>) => {
    if (e && videoRef.current) {
      const rect = videoRef.current.getBoundingClientRect();
      setFocusPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setTimeout(() => setFocusPoint(null), 1200);
    } else {
      setFocusPoint({ x: 150, y: 120 });
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

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
  };

  // Start live camera stream
  const startCamera = async (mode = facingMode) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setCameraError(null);

    // Stop previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported by your browser or environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        if (videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream;
        }
        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          if (playErr.name !== "AbortError") {
            console.log("Camera play call deferred or caught:", playErr);
          }
        }
      }
      setIsCameraActive(true);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Camera access error:", err);
        setCameraError(err.message || "Failed to access camera. Please check permissions.");
        setIsCameraActive(false);
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
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === "camera" && !previewImage) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode, previewImage]);

  // Flip camera between front & back
  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
  };

  // Snap photo from video feed
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Apply selected brightness and contrast filters onto canvas
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPreviewImage(dataUrl);
      setPreviewMime("image/jpeg");
      stopCamera();
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPEG, PNG, WEBP)");
      return;
    }

    setPreviewMime(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Confirm image selection
  const handleConfirm = () => {
    if (previewImage) {
      onCapture(previewImage, previewMime);
      if (onClose) onClose();
    }
  };

  // Retake / Clear photo
  const handleRetake = () => {
    setPreviewImage(null);
    if (activeTab === "camera") {
      startCamera();
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-champagne" />
            <span>{t(title)}</span>
          </h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-gray-400 text-xs">{t(subtitle)}</p>
      </div>

      {/* Mode Toggle Buttons */}
      {!previewImage && (
        <div className="grid grid-cols-2 gap-2 p-1 bg-luxury-bg border border-gray-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setPreviewImage(null);
              setActiveTab("camera");
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "camera"
                ? "bg-champagne text-luxury-bg shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t("Live Camera")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewImage(null);
              setActiveTab("upload");
              stopCamera();
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "upload"
                ? "bg-champagne text-luxury-bg shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{t("Upload File")}</span>
          </button>
        </div>
      )}

      {/* Main Preview Container */}
      <div className={`relative bg-black/80 border border-gray-800 transition-all duration-300 flex items-center justify-center ${
        isFullscreen
          ? "fixed inset-0 z-[99999] rounded-none border-none p-3 bg-black flex-col justify-between h-screen min-h-[100dvh]"
          : "min-h-[260px] rounded-2xl overflow-hidden"
      }`}>
        {/* PREVIEW MODE */}
        {previewImage ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 relative">
            <img
              src={previewImage}
              alt="Captured preview"
              className="max-h-64 object-contain rounded-xl border border-gray-800"
            />
            <div className="absolute top-4 right-4 bg-emerald-950/80 text-neon-emerald border border-emerald-500/30 px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 backdrop-blur-sm">
              <Check className="w-3.5 h-3.5" />
              <span>Image Ready</span>
            </div>
          </div>
        ) : activeTab === "camera" ? (
          /* LIVE CAMERA MODE */
          <div
            onClick={handleTriggerFocus}
            className={`relative w-full bg-black flex items-center justify-center cursor-crosshair overflow-hidden ${
              isFullscreen ? "h-full flex-1 rounded-2xl border border-gray-800 my-2" : "h-72"
            }`}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
              className="w-full h-full object-cover transition-all duration-200"
            />

            {/* Visual Focus Ring on Click/Tap */}
            {focusPoint && (
              <div
                className="absolute w-14 h-14 border-2 border-neon-emerald rounded-full animate-ping pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ left: focusPoint.x, top: focusPoint.y }}
              />
            )}

            {/* Overlays on camera */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 z-10">
                <div className="flex justify-between items-center z-10">
                  <span className="bg-black/70 text-neon-emerald text-[10px] font-mono px-2 py-0.5 rounded-md border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CAMERA ACTIVE
                  </span>

                  <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFullscreen();
                      }}
                      className="bg-black/80 hover:bg-black text-neon-emerald border border-emerald-500/40 font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 cursor-pointer transition shadow-lg"
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      <span>{isFullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}</span>
                    </button>
                    <span className="bg-black/70 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-md border border-amber-500/30 backdrop-blur-sm">
                      {brightness}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Controls over camera */}
            {isCameraActive && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-2 left-2 right-2 flex flex-col gap-1.5 bg-black/85 backdrop-blur-md p-2 rounded-2xl border border-gray-800 z-20"
              >
                {/* Brightness & Auto Focus toolbar */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setBrightness((b) => Math.max(50, b - 15))}
                      title="Decrease Brightness"
                      className="px-2 py-1 bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-300 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Sun className="w-3 h-3 text-amber-400" />
                      <span>-</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrightness((b) => Math.min(200, b + 15))}
                      title="Increase Brightness"
                      className="px-2 py-1 bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-300 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Sun className="w-3 h-3 text-amber-400" />
                      <span>+</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTriggerFocus()}
                      className="px-2 py-1 bg-luxury-card border border-neon-emerald/40 text-neon-emerald font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Focus className="w-3 h-3" />
                      <span>Focus</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAutoEnhance}
                      className="px-2 py-1 bg-champagne text-luxury-bg font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto</span>
                    </button>
                    {(brightness !== 100 || contrast !== 100) && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="p-1 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white rounded-lg cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Snap Action Bar */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white rounded-xl transition cursor-pointer"
                    title="Switch Camera"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    className="flex-1 py-2 bg-champagne text-luxury-bg font-display font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg shadow-emerald-950/60 cursor-pointer active:scale-95 text-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t("Snap Photo")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Camera Error Message */}
            {cameraError && (
              <div className="p-6 text-center space-y-3">
                <p className="text-red-400 text-xs max-w-xs mx-auto">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-xl transition cursor-pointer"
                >
                  Retry Camera
                </button>
              </div>
            )}
          </div>
        ) : (
          /* FILE UPLOAD MODE */
          <div className="p-8 text-center w-full">
            <label className="flex flex-col items-center justify-center cursor-pointer space-y-3 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 group-hover:border-neon-emerald flex items-center justify-center text-neon-emerald transition-all transform group-hover:scale-105">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <span className="font-bold text-gray-200 text-sm block">
                  Click to Choose or Drag Image Here
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  PNG, JPG, WEBP formats supported
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between pt-2">
        {previewImage ? (
          <>
            <button
              type="button"
              onClick={handleRetake}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t("Retake / Change")}</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-champagne text-luxury-bg font-display font-bold rounded-xl hover:opacity-90 transition cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-950/50"
            >
              <Check className="w-4 h-4" />
              <span>{t("Use This Photo")}</span>
            </button>
          </>
        ) : (
          <div className="w-full flex justify-end">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                {t("Cancel")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
