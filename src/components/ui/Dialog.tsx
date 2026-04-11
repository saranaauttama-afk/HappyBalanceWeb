import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
}

export default function Dialog({
  open,
  title,
  description,
  children,
  footer,
  icon,
  onClose,
  closeOnOverlayClick = true,
}: DialogProps) {
  useEffect(() => {
    if (!open) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="ปิดหน้าต่าง"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      <div className="relative z-[101] w-full max-w-md overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(247,252,255,0.96)_45%,rgba(238,248,242,0.94)_100%)] shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
        <div className="pointer-events-none absolute -left-12 top-8 h-28 w-28 rounded-full bg-[#ffd8bf]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#9ad4be]/20 blur-3xl" />

        <div className="relative space-y-5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {icon ? (
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/85 text-slate-700 shadow-[0_10px_24px_rgba(31,47,61,0.1)]">
                  {icon}
                </span>
              ) : null}

              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-tight text-slate-900">{title}</h2>
                {description ? (
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/85 text-slate-400 shadow-[0_8px_18px_rgba(31,47,61,0.08)] transition hover:text-slate-600"
              aria-label="ปิดหน้าต่าง"
            >
              <X size={16} />
            </button>
          </div>

          {children ? <div>{children}</div> : null}

          {footer ? <div className="flex flex-wrap justify-end gap-3">{footer}</div> : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
