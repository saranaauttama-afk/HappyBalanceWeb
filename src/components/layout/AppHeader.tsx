import { Bell, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppHeaderProps {
  title: string;
  showBell?: boolean;
  showBack?: boolean;
  subtitle?: string;
}

export default function AppHeader({
  title,
  showBell = false,
  showBack = false,
  subtitle,
}: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl p-2 hover:bg-slate-100"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-slate-500 truncate">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {showBell ? (
          <button
            type="button"
            className="rounded-xl p-2 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  );
}