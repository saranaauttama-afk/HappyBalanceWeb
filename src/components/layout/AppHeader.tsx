import { Bell, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppHeaderProps {
  title: string;
  showBell?: boolean;
  showBack?: boolean;
  subtitle?: string;
  variant?: "default" | "soft";
}

export default function AppHeader({
  title,
  showBell = false,
  showBack = false,
  subtitle,
  variant = "default",
}: AppHeaderProps) {
  const navigate = useNavigate();
  const isSoft = variant === "soft";

  return (
    <header
      className={`sticky top-0 z-10 border-b backdrop-blur ${
        isSoft
          ? "relative border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(255,248,235,0.88)_100%)] shadow-[0_10px_28px_rgba(31,47,61,0.08)]"
          : "border-slate-200 bg-white/95"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`rounded-xl p-2 transition ${
                isSoft ? "bg-white/60 hover:bg-white/90" : "hover:bg-slate-100"
              }`}
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-900">{title}</h1>
            {subtitle ? <p className="truncate text-sm text-slate-500">{subtitle}</p> : null}
          </div>
        </div>

        {showBell ? (
          <button
            type="button"
            className={`rounded-xl p-2 transition ${
              isSoft ? "bg-white/60 hover:bg-white/90" : "hover:bg-slate-100"
            }`}
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {isSoft ? (
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[#e8c9ad] to-transparent" />
      ) : null}
    </header>
  );
}
