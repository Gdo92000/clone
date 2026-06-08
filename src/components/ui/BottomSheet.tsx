import { useEffect, useRef, type ReactNode } from "react";
import { clsx } from "clsx";
import { createPortal } from "react-dom";

export type BottomSheetSnap = "peek" | "half" | "full";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  hideHandle?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  maxHeight?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  closeOnBackdrop = true,
  closeOnEsc = true,
  hideHandle = false,
  initialFocusRef,
  children,
  footer,
  className,
  maxHeight = "90vh",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTarget = initialFocusRef?.current ?? sheetRef.current;
    const focusTimer = window.setTimeout(() => {
      focusTarget?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      lastFocusedRef.current?.focus();
    };
  }, [isOpen, initialFocusRef]);

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center md:p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "bottom-sheet-title" : undefined}
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={clsx(
          "w-full bg-surface-elevated shadow-2xl shadow-black/20 outline-none",
          "rounded-t-2xl md:rounded-2xl",
          "flex flex-col max-h-[90vh]",
          "animate-slide-up",
          className
        )}
        style={{ maxHeight }}
      >
        {!hideHandle && (
          <div className="pt-3 pb-1 flex justify-center md:hidden">
            <div className="w-10 h-1 rounded-full bg-border-default" />
          </div>
        )}
        {title && (
          <div className="px-5 py-4 border-b border-border-default">
            <h2
              id="bottom-sheet-title"
              className="font-display font-bold text-lg text-text-primary text-center"
            >
              {title}
            </h2>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-border-default bg-surface-background rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default BottomSheet;
