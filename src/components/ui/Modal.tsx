import { useEffect, useRef, type ReactNode } from "react";
import { clsx } from "clsx";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full" | "fullscreen";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  hideCloseButton?: boolean;
  hideBackdrop?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-[min(96vw,64rem)]",
  fullscreen: "max-w-none h-screen rounded-none",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  closeOnBackdrop = true,
  closeOnEsc = true,
  hideCloseButton = false,
  hideBackdrop = false,
  initialFocusRef,
  children,
  footer,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTarget = initialFocusRef?.current ?? dialogRef.current;
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
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center animate-fade-in",
        size === "fullscreen" ? "p-0" : "p-4",
        hideBackdrop ? "" : "bg-black/50 backdrop-blur-sm"
      )}
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={clsx(
          "w-full rounded-2xl bg-surface-elevated shadow-2xl shadow-black/20 max-h-[90vh] flex flex-col outline-none",
          sizeClasses[size],
          className
        )}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-border-default">
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="font-display font-bold text-lg text-text-primary"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-text-secondary mt-1">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                aria-label="Fechar modal"
                className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-background transition-colors shrink-0"
              >
                <Icon name="X" size={18} />
              </button>
            )}
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

export default Modal;
