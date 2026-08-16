import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Utensils,
  Plus,
  Camera,
  Edit3,
  Trash2,
  Sparkles,
  Search,
  Check,
  X,
  RefreshCw,
  ChefHat,
  Coffee,
  CheckCircle2,
  Globe,
  Tag,
  Info,
  ExternalLink,
  Copy,
  Layers,
  ArrowRight,
  MinusCircle,
  PlusCircle
} from "lucide-react";
import { MenuItem } from "../types";
import { CameraUploader } from "./CameraUploader";
import { PortalModal } from "./PortalModal";

interface WebLookupResult {
  name: string;
  category: string;
  estimatedPrice: number;
  description: string;
  matchType: "exact" | "similar";
  similarityReason?: string;
  keyIngredients?: string[];
  imageUrl?: string;
  imageOptions?: Array<{ id: string; title: string; label: string; url: string }>;
}

interface DigitalMenuManagerProps {
  items: MenuItem[];
  loading: boolean;
  onRefresh: () => void;
  onAddItem: (item: { name: string; category: string; price: number; description?: string; imageUrl?: string; isAvailable: boolean }) => Promise<void>;
  onUpdateItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onAiScanParse: (imageBase64: string, mimeType: string) => Promise<Array<{ name: string; category: string; price: number; description?: string }>>;
  onItemLookup?: (query: string) => Promise<{
    exactMatchFound: boolean;
    query: string;
    results: WebLookupResult[];
  }>;
  t: (key: string) => string;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

// Helper: Sanitize text to remove hallucinated CJK or repeating characters
const sanitizeText = (str: string): string => {
  if (!str) return "";
  let clean = String(str).replace(/[\u4e00-\u9fff\u3000-\u303f\u2e80-\u2eff\u31c0-\u31ef]/g, "");
  clean = clean.replace(/(.{2,8})\1{2,}/g, "$1").trim();
  return clean.length > 60 ? clean.substring(0, 60).trim() : clean;
};

// Helper: Crop exact image region associated with food item directly from menu photo
const cropImageRegion = (
  base64Image: string,
  box: { ymin: number; xmin: number; ymax: number; xmax: number }
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(base64Image);

        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        const ymin = (box.ymin > 1 ? box.ymin / 100 : box.ymin) * height;
        const xmin = (box.xmin > 1 ? box.xmin / 100 : box.xmin) * width;
        const ymax = (box.ymax > 1 ? box.ymax / 100 : box.ymax) * height;
        const xmax = (box.xmax > 1 ? box.xmax / 100 : box.xmax) * width;

        const cropWidth = Math.max(10, xmax - xmin);
        const cropHeight = Math.max(10, ymax - ymin);

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        ctx.drawImage(
          img,
          xmin,
          ymin,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch (err) {
        resolve(base64Image);
      }
    };
    img.onerror = () => resolve(base64Image);
    img.src = base64Image.startsWith("data:") ? base64Image : `data:image/jpeg;base64,${base64Image}`;
  });
};

export const DigitalMenuManager: React.FC<DigitalMenuManagerProps> = ({
  items,
  loading,
  onRefresh,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAiScanParse,
  onItemLookup,
  t,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Modal State: Manual Add / Edit Item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Dishes");
  const [itemPrice, setItemPrice] = useState<number | "">(100);
  const [itemDescription, setItemDescription] = useState("");
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [foodImageOptions, setFoodImageOptions] = useState<Array<{ id: string; title: string; label: string; url: string }>>([]);
  const [isSearchingFoodImages, setIsSearchingFoodImages] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal State: AI Camera Scan & Web Lookup
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [scannerTab, setScannerTab] = useState<"camera_scan" | "search_web">("camera_scan");

  // Camera Scan State
  const [aiImageBase64, setAiImageBase64] = useState<string | null>(null);
  const [aiMimeType, setAiMimeType] = useState("image/jpeg");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Dual Lookup States: Local & Web
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [webSearchQuery, setWebSearchQuery] = useState("");
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [webSearchResults, setWebSearchResults] = useState<WebLookupResult[]>([]);
  const [exactMatchFound, setExactMatchFound] = useState<boolean | null>(null);

  // Accumulated Draft Items (from local lookup, web search, or camera scan)
  const [aiDraftItems, setAiDraftItems] = useState<Array<{
    name: string;
    title_en?: string;
    title_local?: string;
    category: string;
    price: number;
    description?: string;
    is_vegan?: boolean;
    imageUrl?: string;
    imageSource?: "cropped_photo" | "fallback_search" | "custom";
    selected: boolean;
    source?: "local" | "web_exact" | "web_similar" | "camera_scan";
    similarityReason?: string;
  }>>([]);
  const [savingAiDrafts, setSavingAiDrafts] = useState(false);

  const categories = ["All", "Dishes", "Drinks", "Appetizers", "Desserts", "Hot Beverages", "Specialties"];

  // Search Food Images for Manual Add / Edit Modal
  const handleSearchFoodImages = async (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : (imageSearchQuery || itemName || "Kitfo")).trim();
    if (!q) {
      showToast("Please enter a food name to search for images", "info");
      return;
    }
    setImageSearchQuery(q);
    setIsSearchingFoodImages(true);
    try {
      // Image search disabled — do not fetch images
      setFoodImageOptions([]);
      if (!itemImageUrl || queryToSearch) {
        setItemImageUrl("");
      }
    } catch (err) {
      console.error("Failed to search food images:", err);
    } finally {
      setIsSearchingFoodImages(false);
    }
  };

  // Open manual add
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemName("");
    setItemCategory("Dishes");
    setItemPrice(100);
    setItemDescription("");
    setItemAvailable(true);
    setItemImageUrl("");
    setImageSearchQuery("");
    setShowCustomUrlInput(false);
    setIsModalOpen(true);
    handleSearchFoodImages("Kitfo");
  };

  // Open edit
  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category || "Dishes");
    setItemPrice(item.price);
    setItemDescription(item.description || "");
    setItemAvailable(item.isAvailable);
    setItemImageUrl(item.imageUrl || "");
    setImageSearchQuery(item.name);
    setShowCustomUrlInput(Boolean(item.imageUrl && !item.imageUrl.includes("unsplash")));
    setIsModalOpen(true);
    handleSearchFoodImages(item.name);
  };

  // Submit manual item
  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      showToast("Dish or Drink name is required", "error");
      return;
    }
    if (itemPrice === "" || Number(itemPrice) < 0) {
      showToast("Please enter a valid price", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await onUpdateItem(editingItem.id, {
          name: itemName.trim(),
          category: itemCategory,
          price: Number(itemPrice),
          description: itemDescription.trim(),
          imageUrl: itemImageUrl,
          isAvailable: itemAvailable
        });
        showToast("Menu item updated successfully", "success");
      } else {
        await onAddItem({
          name: itemName.trim(),
          category: itemCategory,
          price: Number(itemPrice),
          description: itemDescription.trim(),
          imageUrl: itemImageUrl,
          isAvailable: itemAvailable
        });
        showToast("New dish/drink added to menu", "success");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Failed to save menu item", "error");
    } finally {
      setSaving(false);
    }
  };

  // Quick Price Adjustment (+/-) directly in list
  const handleAdjustPrice = async (item: MenuItem, delta: number) => {
    const newPrice = Math.max(0, item.price + delta);
    try {
      await onUpdateItem(item.id, { price: newPrice });
      showToast(`Updated price for "${item.name}" to ${newPrice} ETB`, "success");
    } catch (e) {
      showToast("Failed to adjust price", "error");
    }
  };

  // Run Gemini AI Camera Photo Menu Parser
  const handleRunAiParser = async () => {
    if (!aiImageBase64) {
      showToast("Please select or capture a menu photo first", "error");
      return;
    }

    setIsAnalyzing(true);
    try {
      const parsed = await onAiScanParse(aiImageBase64, aiMimeType);
      if (parsed && parsed.length > 0) {
        const enrichedDrafts = await Promise.all(
          parsed.map(async (it: any) => {
            let finalImg = it.imageUrl || "";
            let finalSource = it.imageSource || "fallback_search";

            if (it.hasItemPhoto && it.cropBoundingBox && aiImageBase64) {
              try {
                finalImg = await cropImageRegion(aiImageBase64, it.cropBoundingBox);
                finalSource = "cropped_photo";
              } catch (cropErr) {
                console.log("Image crop failed, using fallback URL");
              }
            }

            const titleEn = sanitizeText(it.title_en || it.name || "Dish Item");
            const titleLocal = sanitizeText(it.title_local || "");
            const displayName = titleLocal ? `${titleEn} (${titleLocal})` : titleEn;

            return {
              name: displayName,
              title_en: titleEn,
              title_local: titleLocal,
              category: it.category || "Dishes",
              price: Number(it.price) || 0,
              description: it.description || "",
              is_vegan: Boolean(it.is_vegan),
              imageUrl: finalImg,
              imageSource: finalSource,
              selected: true,
              source: "camera_scan" as const
            };
          })
        );

        setAiDraftItems(enrichedDrafts);
        showToast(`Gemini AI successfully extracted ${parsed.length} menu items!`, "success");
      } else {
        showToast("No menu items recognized. Please try another image.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "AI Menu Parsing failed", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Perform Real-time Web Search & Fallback
  const handlePerformWebLookup = async (overrideQuery?: string) => {
    const q = (overrideQuery || webSearchQuery).trim();
    if (!q) {
      showToast("Please enter a food or drink item name to search", "error");
      return;
    }

    if (overrideQuery) {
      setWebSearchQuery(overrideQuery);
    }

    setIsSearchingWeb(true);
    try {
      let data;
      if (onItemLookup) {
        data = await onItemLookup(q);
      } else {
        const res = await fetch("/api/merchant/menu/item-lookup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ query: q })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || "Web search failed");
      }

      setWebSearchResults(data.results || []);
      setExactMatchFound(data.exactMatchFound);

      if (data.results && data.results.length > 0) {
        showToast(
          data.exactMatchFound
            ? `Found exact web match for "${q}"!`
            : `Returned ${data.results.length} similar food options for "${q}"`,
          "success"
        );
      } else {
        showToast(`No web matches found for "${q}". Try another term.`, "info");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to lookup food item online", "error");
    } finally {
      setIsSearchingWeb(false);
    }
  };

  // Pick Item from Local Menu Lookup
  const handlePickLocalItem = (item: MenuItem) => {
    const exists = aiDraftItems.some((d) => d.name.toLowerCase() === item.name.toLowerCase());
    if (exists) {
      showToast(`"${item.name}" is already in your selected draft list`, "info");
      return;
    }

    setAiDraftItems((prev) => [
      ...prev,
      {
        name: item.name,
        category: item.category || "Dishes",
        price: item.price,
        description: item.description || "",
        selected: true,
        source: "local"
      }
    ]);
    showToast(`Added local menu dish "${item.name}" to selection`, "success");
  };

  // Pick Item from Web Search & Fallback Result
  const handlePickWebResult = (res: WebLookupResult, chosenUrl?: string) => {
    const exists = aiDraftItems.some((d) => d.name.toLowerCase() === res.name.toLowerCase());
    if (exists) {
      showToast(`"${res.name}" is already in your selected draft list`, "info");
      return;
    }

    // Images disabled — always leave image URL empty
    const finalImage = "";

    setAiDraftItems((prev) => [
      ...prev,
      {
        name: res.name,
        category: res.category || "Dishes",
        price: Number(res.estimatedPrice) || 100,
        description: res.description || "",
        imageUrl: finalImage,
        imageSource: finalImage ? "fallback_search" : undefined,
        selected: true,
        source: res.matchType === "exact" ? "web_exact" : "web_similar",
        similarityReason: res.similarityReason
      }
    ]);
    showToast(
      `Added "${res.name}" (${res.matchType === "exact" ? "Exact Web Match" : "Similar Option"}) to selection`,
      "success"
    );
  };

  // Save selected draft items to live menu and database
  const handleSaveAiDrafts = async () => {
    const selected = aiDraftItems.filter((i) => i.selected);
    if (selected.length === 0) {
      showToast("Please select at least one dish or drink to save", "error");
      return;
    }

    setSavingAiDrafts(true);
    try {
      const res = await fetch("/api/merchant/menu/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ items: selected })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch save failed");

      showToast(`Successfully saved ${selected.length} items to menu_items database!`, "success");
      if (onRefresh) {
        onRefresh();
      }
      setIsAiModalOpen(false);
      setAiImageBase64(null);
      setAiDraftItems([]);
      setWebSearchResults([]);
      setWebSearchQuery("");
    } catch (e) {
      // Fallback single additions if batch fails
      try {
        for (const draft of selected) {
          await onAddItem({
            name: draft.name,
            category: draft.category || "Dishes",
            price: Number(draft.price) || 0,
            description: draft.description || "",
            imageUrl: draft.imageUrl || "",
            isAvailable: true
          });
        }
        showToast(`Saved ${selected.length} items to live menu!`, "success");
        setIsAiModalOpen(false);
      } catch (fallbackErr) {
        showToast("Failed to save menu items", "error");
      }
    } finally {
      setSavingAiDrafts(false);
    }
  };

  // Filter local live menu items for primary list view
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter local items for Local Lookup panel
  const filteredLocalLookupItems = items.filter((it) =>
    it.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
    (it.description && it.description.toLowerCase().includes(localSearchQuery.toLowerCase())) ||
    (it.category && it.category.toLowerCase().includes(localSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-luxury-card card-hairline rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-14 -left-14 w-40 h-40 bg-champagne/[0.05] rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-champagne/10 border border-champagne/20 rounded-xl">
              <Utensils className="w-5 h-5 text-champagne" />
            </div>
            <h2 className="font-display font-extrabold text-2xl text-white">
              {t("Digital Menu")}
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage restaurant dishes, prices, menu photo scanning, and web dish lookups in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setAiImageBase64(null);
              setIsAiModalOpen(true);
              setScannerTab("camera_scan");
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-champagne via-champagne-dark to-champagne text-luxury-bg font-sans font-bold text-xs rounded-xl flex items-center gap-2 hover:opacity-95 shadow-lg neon-glow transition cursor-pointer"
          >
            <Camera className="w-4 h-4 text-luxury-bg" />
            <span>{t("Scan Menu Photo & Add Items")}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-champagne text-luxury-bg font-sans font-bold text-xs rounded-xl flex items-center gap-2 hover:opacity-90 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("Add Item")}</span>
          </button>
        </div>
      </div>


      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish, drink, coffee..."
            className="w-full bg-luxury-card border border-gray-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neon-emerald transition"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-champagne text-luxury-bg font-bold"
                  : "bg-luxury-card border border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Digital Menu Items Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-neon-emerald" />
          <span className="text-xs">Loading digital menu items...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="border border-dashed border-gray-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center bg-luxury-card/30">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4 text-gray-500">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-200">No menu items found</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1 mb-6">
            Add items manually or scan a physical menu photo using Gemini AI to automatically import dish items and food photos.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                setIsAiModalOpen(true);
                setScannerTab("camera_scan");
              }}
              className="px-4 py-2 bg-emerald-950/40 text-neon-emerald border border-neon-emerald/30 text-xs font-semibold rounded-xl hover:bg-emerald-900/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Menu Photo</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-champagne text-luxury-bg font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dish Manually</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="menu-grid p-0 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 520, damping: 30, mass: 0.6 }}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between warm-lift ${
                item.isAvailable
                  ? "bg-luxury-card border-gray-800 hover:border-champagne/40 shadow-lg"
                  : "bg-luxury-card/40 border-gray-900 opacity-60"
              }`}
            >
              <div>
                {/* Menu images are hidden per user preference. Show neutral placeholder. */}
                <div className="relative mb-3.5 rounded-2xl overflow-hidden border border-gray-800 h-36 bg-gray-950 flex items-center justify-center">
                  <span className="text-sm text-gray-500">Image hidden</span>
                </div>

                <div className="flex items-start justify-between gap-3 mb-1">
                  {!item.imageUrl && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 bg-gray-900 border border-champagne/20 rounded-lg text-[10px] font-bold uppercase tracking-wider text-champagne/80">
                        {item.category || "Dishes"}
                      </span>
                      {item.is_vegan && (
                        <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/40 rounded-lg text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                          <span>🌱</span>
                          <span>Vegan</span>
                        </span>
                      )}
                    </div>
                  )}

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                      item.isAvailable
                        ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                        : "bg-terracotta/10 border-terracotta/30 text-terracotta"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Sold Out"}
                  </span>
                </div>

                <div className="mt-1">
                  <h3 className="font-display font-bold text-base text-white flex items-center gap-1.5 flex-wrap">
                    <span>{sanitizeText(item.title_en || item.name || "Menu Item").split(" (")[0]}</span>
                    {item.title_local && sanitizeText(item.title_local) && (
                      <span className="text-xs font-serif text-champagne/80 bg-black/40 px-1.5 py-0.2 rounded border border-champagne/20 max-w-[200px] truncate">
                        {sanitizeText(item.title_local)}
                      </span>
                    )}
                  </h3>
                </div>

                {item.description && (
                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Price & Quick Actions */}
              <div className="pt-4 mt-4 border-t border-gray-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-medium">Price</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-lg font-extrabold text-champagne">
                      {item.price}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">ETB</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Quick price decrement */}
                  <button
                    onClick={() => handleAdjustPrice(item, -10)}
                    title="Decrease Price -10 ETB"
                    className="p-1.5 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>

                  {/* Quick price increment */}
                  <button
                    onClick={() => handleAdjustPrice(item, 10)}
                    title="Increase Price +10 ETB"
                    className="p-1.5 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-neon-emerald" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    title="Edit Item"
                    className="p-1.5 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition cursor-pointer ml-1"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  {deletingItemId === item.id ? (
                    <div className="flex items-center gap-1 bg-red-950/90 border border-red-500/60 p-1 rounded-xl shadow-lg">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await onDeleteItem(item.id);
                            setDeletingItemId(null);
                          } catch (err) {
                            showToast("Error deleting item", "error");
                          }
                        }}
                        className="px-2 py-1 text-[10px] font-black bg-red-600 hover:bg-red-500 text-white rounded-lg transition cursor-pointer"
                      >
                        Delete?
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItemId(null)}
                        className="px-1.5 py-1 text-[10px] text-gray-400 hover:text-white rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeletingItemId(item.id)}
                      title="Delete Item"
                      className="p-1.5 text-gray-400 hover:text-red-400 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Add / Edit Item Manually */}
      <AnimatePresence>
        {isModalOpen && (
          <PortalModal
            open
            onClose={() => setIsModalOpen(false)}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-md"
          >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-display font-extrabold text-lg text-white mb-1">
                {editingItem ? "Edit Menu Dish" : "Add New Dish / Drink"}
              </h3>
              <p className="text-xs text-gray-400 mb-5">
                {editingItem ? "Update dish parameters and live availability" : "Add a new dish or beverage to your digital menu"}
              </p>

              <form onSubmit={handleSubmitItem} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Dish / Drink Name *</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Special Kitfo, Cappuccino, Doro Wat"
                    required
                    className="w-full bg-luxury-bg border border-gray-800 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Category</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full bg-luxury-bg border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-emerald transition cursor-pointer"
                    >
                      <option value="Dishes">Dishes</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Appetizers">Appetizers</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Hot Beverages">Hot Beverages</option>
                      <option value="Specialties">Specialties</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Price (ETB) *</label>
                    <input
                      type="number"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 250"
                      required
                      min="0"
                      className="w-full bg-luxury-bg border border-gray-800 rounded-xl px-3.5 py-2.5 text-neon-emerald font-mono font-bold focus:outline-none focus:border-neon-emerald transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Description (Optional)</label>
                  <textarea
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Short summary of ingredients, spices, or preparation..."
                    rows={3}
                    className="w-full bg-luxury-bg border border-gray-800 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald transition resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="itemAvailableToggle"
                    checked={itemAvailable}
                    onChange={(e) => setItemAvailable(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <label htmlFor="itemAvailableToggle" className="text-gray-300 cursor-pointer font-medium">
                    Available for customers right now
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white cursor-pointer"
                  >
                    {t("Close")}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingItem ? "Save Changes" : "Add Dish"}
                  </button>
                </div>
              </form>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* AI Menu Scanner & Dual-Lookup Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <PortalModal
            open
            onClose={() => setIsAiModalOpen(false)}
            overlayClassName="bg-black/80 backdrop-blur-md overflow-y-auto"
            cardClassName="max-w-4xl p-5 sm:p-6 border-emerald-500/30 my-auto max-h-[92vh] flex flex-col"
          >
              {/* Close Button */}
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer p-1.5 rounded-full hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-tr from-champagne via-champagne-dark to-champagne text-luxury-bg rounded-2xl shadow-lg">
                    <Camera className="w-5 h-5 font-bold" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-white">
                      {t("AI Digital Menu Scanner")}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Snap or upload a menu photo to extract dish items, prices, descriptions, and pictures automatically. Gemini automatically looks up web photos if not clear on the scanned item.
                    </p>
                  </div>
                </div>

                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-luxury-bg border border-gray-800 rounded-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setScannerTab("camera_scan")}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      scannerTab === "camera_scan"
                        ? "bg-champagne text-luxury-bg font-extrabold shadow-md"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Menu Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScannerTab("search_web")}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      scannerTab === "search_web"
                        ? "bg-champagne text-luxury-bg font-extrabold shadow-md"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Food & Web</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Modal Body */}
              <div className="overflow-y-auto pr-1 space-y-4 text-xs font-sans flex-1">
                {/* MODE 1: SEARCH FOOD & WEB */}
                {scannerTab === "search_web" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* LEFT PANEL: Local Lookup (Pick from existing live menu) */}
                    <div className="bg-luxury-bg/60 border border-gray-800/90 rounded-2xl p-4 flex flex-col h-[380px]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-neon-emerald" />
                          <h4 className="font-display font-bold text-sm text-white">
                            Ã°Å¸â€œÂ Local Menu Lookup
                          </h4>
                        </div>
                        <span className="text-[10px] text-gray-400 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded-full font-mono">
                          {items.length} items registered
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 mb-3">
                        Pick a food or beverage item directly from your existing live menu list.
                      </p>

                      {/* Search filter for local menu */}
                      <div className="relative mb-3">
                        <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={localSearchQuery}
                          onChange={(e) => setLocalSearchQuery(e.target.value)}
                          placeholder="Filter local menu (e.g., Kitfo, Beyaynetu)..."
                          className="w-full bg-luxury-card border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neon-emerald transition"
                        />
                      </div>

                      {/* Local Menu Items Picker */}
                      <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                        {filteredLocalLookupItems.length === 0 ? (
                          <div className="py-12 text-center text-gray-500">
                            <p className="text-xs">No matching dishes in local menu.</p>
                            <p className="text-[10px] text-gray-600 mt-1">
                              Try searching on the right panel using Web Search & Fallback!
                            </p>
                          </div>
                        ) : (
                          filteredLocalLookupItems.map((item) => {
                            const isPicked = aiDraftItems.some(
                              (d) => d.name.toLowerCase() === item.name.toLowerCase()
                            );
                            return (
                              <div
                                key={item.id}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition ${
                                  isPicked
                                    ? "bg-emerald-950/30 border-neon-emerald/50 text-white"
                                    : "bg-luxury-card border-gray-800/80 hover:border-gray-700"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-white truncate">
                                      {item.name}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 bg-gray-900 text-gray-400 rounded border border-gray-800">
                                      {item.category}
                                    </span>
                                  </div>
                                  {item.description && (
                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono font-bold text-xs text-champagne">
                                    {item.price} ETB
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handlePickLocalItem(item)}
                                    disabled={isPicked}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                      isPicked
                                        ? "bg-emerald-950 text-neon-emerald border border-neon-emerald/40 opacity-80"
                                        : "bg-champagne text-luxury-bg hover:opacity-90 shadow-sm"
                                    }`}
                                  >
                                    {isPicked ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>Picked</span>
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-3 h-3" />
                                        <span>Pick</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* RIGHT PANEL: Web Search & Fallback */}
                    <div className="bg-luxury-bg/60 border border-emerald-500/20 rounded-2xl p-4 flex flex-col h-[380px]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-400" />
                          <h4 className="font-display font-bold text-sm text-white">
                            Ã°Å¸Å’Â Web Search & Fallback
                          </h4>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                          Real-time AI Grounding
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 mb-3">
                        Search the web for exact dishes. Automatically returns visually or ingredient-similar options if exact match is unavailable.
                      </p>

                      {/* Search Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handlePerformWebLookup();
                        }}
                        className="flex items-center gap-2 mb-2"
                      >
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={webSearchQuery}
                            onChange={(e) => setWebSearchQuery(e.target.value)}
                            placeholder="Type dish or drink (e.g. Special Tibs, Doro Wat)..."
                            className="w-full bg-luxury-card border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neon-emerald transition"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSearchingWeb || !webSearchQuery.trim()}
                          className="px-3 py-1.5 bg-gradient-to-r from-champagne to-champagne-dark text-luxury-bg font-bold text-xs rounded-xl hover:opacity-90 transition disabled:opacity-50 cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          {isSearchingWeb ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Globe className="w-3.5 h-3.5" />
                          )}
                          <span>Search</span>
                        </button>
                      </form>

                      {/* Quick sample terms */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="text-[10px] text-gray-500">Quick Try:</span>
                        {["Special Kitfo", "Doro Wat", "Tibs", "Beyaynetu", "Cappuccino", "Avocado Spris"].map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => handlePerformWebLookup(term)}
                            className="text-[10px] px-2 py-0.5 bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 rounded-lg transition cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>

                      {/* Search Results Display Area */}
                      <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
                        {isSearchingWeb ? (
                          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-neon-emerald" />
                            <p className="text-xs font-medium">Searching web & culinary database in real-time...</p>
                            <p className="text-[10px] text-gray-500">Matching exact dishes and ingredient-similar options...</p>
                          </div>
                        ) : webSearchResults.length === 0 ? (
                          <div className="py-10 text-center text-gray-500 border border-dashed border-gray-800/80 rounded-2xl p-4">
                            <Sparkles className="w-6 h-6 mx-auto text-emerald-500/40 mb-2" />
                            <p className="text-xs font-semibold text-gray-400">Search any food or beverage item</p>
                            <p className="text-[10px] text-gray-500 mt-1 max-w-xs mx-auto">
                              If exact dish is found on the web, full details are returned. If unavailable, visually or ingredient-similar dishes are returned automatically!
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* Match Type Summary Banner */}
                            {exactMatchFound !== null && (
                              <div
                                className={`p-2 rounded-xl border flex items-center justify-between text-[11px] font-bold ${
                                  exactMatchFound
                                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                                    : "bg-amber-950/40 border-amber-500/30 text-amber-300"
                                }`}
                              >
                                <span>
                                  {exactMatchFound
                                    ? "Ã¢Å“â€œ Exact Web Match Found"
                                    : "Ã¢Å“Â¨ Visually & Ingredient-Similar Food Options (Exact match unavailable)"}
                                </span>
                                <span className="text-[9px] opacity-80">
                                  {webSearchResults.length} option(s)
                                </span>
                              </div>
                            )}

                            {/* Render Web Search & Fallback Results */}
                            {webSearchResults.map((res, idx) => {
                              const isPicked = aiDraftItems.some(
                                (d) => d.name.toLowerCase() === res.name.toLowerCase()
                              );
                              return (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-2xl border transition ${
                                    res.matchType === "exact"
                                      ? "bg-emerald-950/20 border-emerald-500/40"
                                      : "bg-luxury-card border-gray-800 hover:border-gray-700"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Food Photo Thumbnail */}
                                    {res.imageUrl && (
                                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-700/80 bg-black/60 shrink-0 shadow">
                                        <img
                                          src={res.imageUrl}
                                          alt={res.name}
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover"
                                        />
                                        <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-emerald-400 text-center font-bold py-0.5 truncate">
                                          Food Photo
                                        </span>
                                      </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <h5 className="font-bold text-xs text-white">{res.name}</h5>
                                        <span
                                          className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${
                                            res.matchType === "exact"
                                              ? "bg-emerald-950 border-emerald-500/40 text-neon-emerald"
                                              : "bg-amber-950/60 border-amber-500/30 text-amber-300"
                                          }`}
                                        >
                                          {res.matchType === "exact" ? "Exact Match" : "Similar Option"}
                                        </span>
                                        <span className="text-[9px] px-1.5 py-0.2 bg-gray-900 text-gray-400 rounded border border-gray-800">
                                          {res.category}
                                        </span>
                                      </div>

                                      {/* Similarity Reason Callout for Fallback Similar Items */}
                                      {res.matchType === "similar" && res.similarityReason && (
                                        <div className="mt-1.5 p-1.5 bg-amber-950/20 border border-amber-500/20 rounded-lg text-[10px] text-amber-200/90 leading-tight">
                                          <span className="font-bold text-amber-300">Why Similar: </span>
                                          {res.similarityReason}
                                        </div>
                                      )}

                                      {res.description && (
                                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                                          {res.description}
                                        </p>
                                      )}

                                      {res.keyIngredients && res.keyIngredients.length > 0 && (
                                        <div className="mt-1 flex flex-wrap items-center gap-1">
                                          <span className="text-[9px] text-gray-500">Ingredients:</span>
                                          {res.keyIngredients.slice(0, 4).map((ing, i) => (
                                            <span
                                              key={i}
                                              className="text-[9px] bg-gray-900 text-gray-400 px-1.5 py-0.2 rounded"
                                            >
                                              {ing}
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      {/* Multiple Food Photo Choices Row */}
                                      {/* Photo selection removed per request: hide image-generation/selection UI */}
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                      <span className="font-mono font-bold text-xs text-champagne">
                                        ~{res.estimatedPrice} ETB
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handlePickWebResult(res, res.imageUrl)}
                                        disabled={isPicked}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                          isPicked
                                            ? "bg-emerald-950 text-neon-emerald border border-neon-emerald/40 opacity-80"
                                            : "bg-champagne text-luxury-bg hover:opacity-90 shadow-sm"
                                        }`}
                                      >
                                        {isPicked ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            <span>Added</span>
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="w-3 h-3" />
                                            <span>Add</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE 2: CAMERA / PHOTO MENU SCAN */}
                {scannerTab === "camera_scan" && (
                  <div className="rounded-2xl p-2 transition bg-luxury-bg/50">
                    {aiImageBase64 ? (
                      <div className="space-y-3 p-4 border border-gray-800 rounded-2xl">
                        <img
                          src={aiImageBase64}
                          alt="Menu preview"
                          referrerPolicy="no-referrer"
                          className="max-h-56 mx-auto rounded-xl object-contain border border-gray-800"
                        />
                        <div className="flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setAiImageBase64(null)}
                            className="px-3.5 py-2 bg-gray-800 text-gray-300 rounded-xl hover:text-white transition cursor-pointer text-xs flex items-center gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Snap / Upload Another Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRunAiParser}
                            disabled={isAnalyzing}
                            className="px-5 py-2 bg-champagne text-luxury-bg font-display font-bold rounded-xl hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs shadow-md"
                          >
                            {isAnalyzing ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Analyzing Photo with Gemini...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span>Analyze with Gemini AI</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <CameraUploader
                        onCapture={(img, mime) => {
                          setAiImageBase64(img);
                          setAiMimeType(mime);
                        }}
                        title="Camera Scan & Upload"
                        subtitle="Use live camera stream or upload menu photo to extract items automatically."
                        t={t}
                      />
                    )}
                  </div>
                )}

                {/* ACCUMULATED DRAFT ITEMS LIST (From Local Lookup, Web Search, or Camera Scan) */}
                {aiDraftItems.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
                        <span className="font-display font-bold text-sm text-white">
                          Selected Draft Items ({aiDraftItems.length})
                        </span>
                      </div>
                      <span className="text-[11px] text-neon-emerald font-medium">
                        Adjust price or details before saving to live menu
                      </span>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {aiDraftItems.map((draft, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                            draft.selected
                              ? "bg-emerald-950/20 border-neon-emerald/40 text-white"
                              : "bg-luxury-bg border-gray-800 text-gray-500"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={draft.selected}
                            onChange={(e) => {
                              const updated = [...aiDraftItems];
                              updated[idx].selected = e.target.checked;
                              setAiDraftItems(updated);
                            }}
                            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                          />

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                            {/* Dish Name + Thumbnail + Source Tag */}
                            <div className="flex items-center gap-2">
                              {draft.imageUrl && (
                                <img
                                  src={draft.imageUrl}
                                  alt={draft.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-lg object-cover border border-gray-800 shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={draft.name}
                                  onChange={(e) => {
                                    const updated = [...aiDraftItems];
                                    updated[idx].name = e.target.value;
                                    setAiDraftItems(updated);
                                  }}
                                  className="w-full bg-luxury-bg border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-white"
                                />
                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                  {draft.source && (
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                        draft.source === "local"
                                          ? "bg-emerald-950 text-neon-emerald border border-neon-emerald/30"
                                          :                                         draft.source === "web_exact"
                                          ? "bg-champagne/10 text-champagne border border-champagne/30"
                                          : draft.source === "web_similar"
                                          ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                                          : "bg-gray-800 text-gray-300 border border-gray-700"
                                      }`}
                                    >
                                      {draft.source === "local"
                                        ? "Ã°Å¸â€œÂ Local Menu"
                                        : draft.source === "web_exact"
                                        ? "Ã°Å¸Å’Â Exact Web Match"
                                        : draft.source === "web_similar"
                                        ? "Ã¢Å“Â¨ Visually Similar"
                                        : "Ã°Å¸â€œÂ· Camera Scan"}
                                    </span>
                                  )}
                                  {draft.imageSource && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-gray-900 border border-gray-800 text-gray-300 rounded">
                                      {draft.imageSource === "cropped_photo" ? "Ã°Å¸â€œÂ· Cropped" : "Ã°Å¸Å’Â Fallback"}
                                    </span>
                                  )}
                                  {draft.is_vegan && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded font-bold">
                                      Ã°Å¸Å’Â± Vegan
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Category Selector */}
                            <select
                              value={draft.category}
                              onChange={(e) => {
                                const updated = [...aiDraftItems];
                                updated[idx].category = e.target.value;
                                setAiDraftItems(updated);
                              }}
                              className="bg-luxury-bg border border-gray-800 rounded-lg px-2 py-1 text-xs text-white cursor-pointer"
                            >
                              <option value="Dishes">Dishes</option>
                              <option value="Drinks">Drinks</option>
                              <option value="Appetizers">Appetizers</option>
                              <option value="Desserts">Desserts</option>
                              <option value="Hot Beverages">Hot Beverages</option>
                              <option value="Specialties">Specialties</option>
                            </select>

                            {/* Price Input */}
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={draft.price}
                                onChange={(e) => {
                                  const updated = [...aiDraftItems];
                                  updated[idx].price = Number(e.target.value);
                                  setAiDraftItems(updated);
                                }}
                                className="w-full bg-luxury-bg border border-gray-800 rounded-lg px-2 py-1 text-xs font-mono text-champagne font-bold"
                              />
                              <span className="text-[10px] text-gray-400 font-bold">ETB</span>
                            </div>
                          </div>

                          {/* Delete Item from Drafts */}
                          <button
                            type="button"
                            onClick={() => {
                              setAiDraftItems(aiDraftItems.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-gray-500 hover:text-red-400 transition cursor-pointer"
                            title="Remove from draft list"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions Footer */}
              <div className="pt-4 mt-4 border-t border-gray-800 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white cursor-pointer text-xs"
                >
                  {t("Close")}
                </button>

                {aiDraftItems.length > 0 && (
                  <button
                    onClick={handleSaveAiDrafts}
                    disabled={savingAiDrafts || aiDraftItems.filter((i) => i.selected).length === 0}
                    className="px-6 py-2.5 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {savingAiDrafts
                        ? "Saving to Live Menu..."
                        : `Save ${aiDraftItems.filter((i) => i.selected).length} Items to Live Menu`}
                    </span>
                  </button>
                )}
              </div>
            </PortalModal>
        )}
      </AnimatePresence>
    </div>
  );
};
