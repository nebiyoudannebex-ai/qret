import React from "react";
import { createPortal } from "react-dom";

// Teleports any subtree (AnimatePresence modal blocks) onto document.body —
// escapes parent overflow/transform/z-index traps while preserving animations.
export const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  createPortal(children, document.body);

interface PortalModalProps {
  open?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  overlayClassName?: string;
  cardClassName?: string;
  clickBackdropToClose?: boolean;
}

// Mounts directly onto document.body via createPortal — bypasses all parent
// overflow / transform / z-index traps that chop off or bury modal edges.
export const PortalModal: React.FC<PortalModalProps> = ({
  open,
  onClose,
  children,
  overlayClassName = "bg-black/70 backdrop-blur-sm",
  cardClassName = "",
  clickBackdropToClose = true,
}) => {
  if (!open) return null;

  const resolvedCardClass = cardClassName.includes("max-w-")
    ? cardClassName
    : `max-w-md ${cardClassName}`;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${overlayClassName}`}
      role="dialog"
      aria-modal="true"
    >
      {clickBackdropToClose && onClose && (
        <div className="absolute inset-0" onClick={onClose} />
      )}

      <div
        className={`relative z-[10000] w-full max-w-md rounded-2xl bg-luxury-card border border-champagne/20 p-6 shadow-2xl ${resolvedCardClass}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};