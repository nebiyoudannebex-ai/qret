import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Minus, ShoppingBag, CreditCard, ChefHat, Leaf } from "lucide-react";
import { MenuItem } from "../types";
// Images disabled: removed automatic dish image lookups
import { sanitizeInput } from "../lib/sanitize";
import { springPress, springSoft, SkeletonDishGrid } from "./MotionKit";

interface CustomerDigitalMenuProps {
  companyName: string;
  items: MenuItem[];
  loading: boolean;
  onProceedToPayment: (totalAmount: number) => void;
  t: (key: string) => string;
}

export const CustomerDigitalMenu: React.FC<CustomerDigitalMenuProps> = ({
  companyName,
  items,
  loading,
  onProceedToPayment,
  t
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<Record<string, number>>({});

  const categories = ["All", "Dishes", "Drinks", "Appetizers", "Desserts", "Hot Beverages"];

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  // Calculate order metrics
  const selectedItemIds = Object.keys(cart);
  const totalItemsCount: number = (Object.values(cart) as number[]).reduce((sum: number, qty: number) => sum + (qty || 0), 0);

  const totalBillAmount = selectedItemIds.reduce((sum, id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return sum;
    return sum + item.price * (cart[id] || 0);
  }, 0);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.title_en && item.title_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Search & Categories Header */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${companyName}'s dishes, drinks...`}
            className="w-full bg-luxury-card border border-gray-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-champagne/70 transition shadow-inner"
          />
        </div>

        {/* Category Pills — spring press */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              whileTap={{ scale: 0.94 }}
              transition={springPress}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-champagne text-luxury-bg font-bold shadow-md"
                  : "bg-luxury-card border border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Menu Cards Display — Fluid auto-fit grid (skeleton while loading: zero CLS) */}
      {loading ? (
        <SkeletonDishGrid count={4} />
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-luxury-card card-hairline rounded-3xl space-y-2">
          <ChefHat className="w-8 h-8 text-gray-600 mx-auto" />
          <p className="text-xs text-gray-400">No items available in this category.</p>
        </div>
      ) : (
        <div className="menu-grid p-0 gap-3.5">
          {filteredItems.map((item) => {
            const qty = cart[item.id] || 0;
            const imageSrc = null; // images are hidden by user request
            const title = sanitizeInput(item.title_en || item.name);
            const localTitle = item.title_local ? sanitizeInput(item.title_local) : undefined;
            const description = item.description ? sanitizeInput(item.description) : undefined;
            const category = sanitizeInput(item.category || "Dishes");

            return (
              <div key={item.id} className="card-wrapper">
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.97 }}
                  transition={springSoft}
                  className={`dish-card warm-lift group relative ${
                    qty > 0 ? "border-champagne/50 shadow-[0_0_20px_rgba(226,185,104,0.12)]" : "border-gray-800"
                  }`}
                >
                  {/* Images are hidden — show neutral decorative panel */}
                  {/* No media panel — images removed per user preference */}

                  {/* Floating dietary pills */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {item.is_vegan && (
                      <span className="px-2 py-0.5 bg-neon-emerald/90 text-luxury-bg text-[9px] font-bold rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
                        <Leaf className="w-2.5 h-2.5" />
                        Vegan
                      </span>
                    )}
                    {item.isAvailable ? (
                      <span className="px-2 py-0.5 bg-black/55 text-neon-emerald text-[9px] font-mono rounded-full border border-neon-emerald/40 backdrop-blur-sm uppercase tracking-wider">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-black/55 text-terracotta text-[9px] font-mono rounded-full border border-terracotta/40 backdrop-blur-sm uppercase tracking-wider">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Price moved into body for compact layout (no image area) */}
                </motion.div>

                <div className="dish-card-body p-3.5 pt-3">
                  <span className="text-[9px] uppercase tracking-[0.14em] font-mono text-champagne/60">
                    {category}
                  </span>

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-semibold text-base text-white leading-snug mt-0.5">
                      {title}
                    </h3>
                    <div className="text-right ml-auto">
                      <div className="text-sm font-mono font-extrabold text-champagne">
                        {item.price.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-champagne/70 font-bold">ETB</div>
                    </div>
                  </div>

                  {localTitle && localTitle !== title && (
                    <p className="text-[11px] gold-subtext mt-0.5 italic">{localTitle}</p>
                  )}

                  {description && (
                    <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>

                {/* Add / Quantity Control */}
                <div className="dish-card-footer px-3.5 pb-3.5 pt-2 border-t border-gray-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-medium">
                    {item.isAvailable ? "In Stock" : "Sold Out"}
                  </span>

                  {qty > 0 ? (
                    <div className="flex items-center gap-2 bg-luxury-bg border border-champagne/30 rounded-xl p-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center cursor-pointer transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-champagne px-1">
                        {qty}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-champagne text-luxury-bg flex items-center justify-center cursor-pointer transition font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="px-3.5 py-1.5 bg-champagne/10 hover:bg-champagne/20 border border-champagne/30 text-champagne text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Order Bill Tray & Checkout — spring choreography */}
      <AnimatePresence>
        {totalItemsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={springSoft}
            className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 bg-luxury-card/95 backdrop-blur-md border border-champagne/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-champagne/10 border border-champagne/30 flex items-center justify-center text-champagne shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"} Selected
                  </span>
                </div>
                <motion.span
                  key={totalBillAmount}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={springPress}
                  className="text-lg font-mono font-extrabold text-champagne block"
                >
                  {totalBillAmount.toLocaleString()} ETB
                </motion.span>
              </div>
            </div>

            <motion.button
              onClick={() => onProceedToPayment(totalBillAmount)}
              whileTap={{ scale: 0.95 }}
              transition={springPress}
              className="px-5 py-3 bg-champagne text-luxury-bg font-sans font-extrabold text-xs rounded-xl hover:opacity-95 shadow-lg neon-glow flex items-center gap-2 cursor-pointer shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t("Proceed to Payment")}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
