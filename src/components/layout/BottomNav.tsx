import { NavLink } from "react-router-dom";
import { CalendarDays, CircleUserRound, House, Target } from "lucide-react";

const items = [
  { to: "/home", label: "หน้าหลัก", Icon: House },
  { to: "/goals", label: "เป้าหมาย", Icon: Target },
  { to: "/appointments", label: "การนัดหมาย", Icon: CalendarDays },
  { to: "/profile", label: "บัญชี", Icon: CircleUserRound },
];

export default function BottomNav() {
  return (
    <nav className="border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 text-xs transition ${
                isActive ? "font-semibold text-[#d88d80]" : "text-slate-400"
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
