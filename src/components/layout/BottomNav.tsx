import { NavLink } from "react-router-dom";
import { CalendarDays, CircleUserRound, House, Target } from "lucide-react";

interface BottomNavProps {
  variant?: "default" | "soft";
}

const items = [
  { to: "/home", label: "หน้าหลัก", Icon: House },
  { to: "/goals", label: "เป้าหมาย", Icon: Target },
  { to: "/appointments", label: "การนัดหมาย", Icon: CalendarDays },
  { to: "/profile", label: "บัญชี", Icon: CircleUserRound },
];

export default function BottomNav({ variant = "default" }: BottomNavProps) {
  const isSoft = variant === "soft";

  return (
    <nav
      className={`relative ${
        isSoft
          ? "rounded-t-[26px] border border-white/70 border-b-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,246,235,0.9)_100%)] shadow-[0_-8px_24px_rgba(31,47,61,0.08)] backdrop-blur"
          : "border-t border-slate-200 bg-white/95 backdrop-blur"
      }`}
    >
      {isSoft ? (
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#e2b991] to-transparent" />
      ) : null}

      <div className="grid grid-cols-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 text-xs transition ${
                isActive
                  ? isSoft
                    ? "font-semibold text-[#bf7f67]"
                    : "font-semibold text-[#d88d80]"
                  : "text-slate-500"
              }`
            }
          >
            <item.Icon size={18} strokeWidth={2.2} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
