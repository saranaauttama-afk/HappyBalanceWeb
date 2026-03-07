import { NavLink } from "react-router-dom";

const items = [
  { to: "/home", label: "หน้าหลัก", icon: "🏠" },
  { to: "/goals", label: "เป้าหมาย", icon: "🎯" },
  { to: "/appointments", label: "การนัดหมาย", icon: "📅" },
  { to: "/profile", label: "บัญชี", icon: "👤" },
];

export default function BottomNav() {
  return (
    <nav className="border-t border-slate-200 bg-white">
      <div className="grid grid-cols-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 text-xs ${
                isActive
                  ? "text-rose-400 font-medium"
                  : "text-slate-400"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}