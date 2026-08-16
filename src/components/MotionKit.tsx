import React from "react";

// Spring physics presets (mass / stiffness / damping) — spec: spring over fixed easing
export const springPress = {
  type: "spring" as const,
  stiffness: 520,
  damping: 30,
  mass: 0.6,
};

export const springSoft = {
  type: "spring" as const,
  stiffness: 260,
  damping: 26,
  mass: 0.9,
};

export const springSnappy = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
  mass: 0.7,
};

export const springStagger = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: springSoft,
  },
};

// Animated skeleton block — use explicit dimensions to avoid layout shift (CLS = 0)
export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

// Skeleton text line matching a base font-size scale
export const SkeletonText: React.FC<{ className?: string; lines?: number }> = ({
  className = "",
  lines = 2,
}) => (
  <div className={`space-y-2 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="skeleton"
        style={{ height: i === 0 ? 14 : 11, width: i === 0 ? "78%" : "100%" }}
      />
    ))}
  </div>
);

// Skeleton dish card — mirrors the exact layout of a menu item card
export const SkeletonDishCard: React.FC = () => (
  <div className="break-inside-avoid bg-luxury-card border border-gray-800 rounded-2xl overflow-hidden">
    <Skeleton className="h-36 w-full rounded-none" />
    <div className="p-3.5 space-y-2.5">
      <div className="skeleton" style={{ height: 10, width: "38%" }} />
      <div className="skeleton" style={{ height: 18, width: "70%" }} />
      <SkeletonText lines={2} />
      <div className="pt-2 border-t border-gray-800/60 flex justify-end">
        <div className="skeleton" style={{ height: 30, width: 76, borderRadius: 12 }} />
      </div>
    </div>
  </div>
);

// Skeleton grid for menu/newsfeed loading states
export const SkeletonDishGrid: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="columns-1 sm:columns-2 gap-3.5 space-y-3.5" aria-busy="true">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonDishCard key={i} />
    ))}
  </div>
);