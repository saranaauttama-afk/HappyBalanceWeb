import { Calendar, Home, Target, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/appointments", label: "Appointments", icon: Calendar },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center">
      <nav className="w-full max-w-[480px] border-t border-slate-200 bg-white">
        <div className="grid grid-cols-4">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition",
                  isActive
                    ? "text-slate-900 bg-slate-50"
                    : "text-slate-500 hover:bg-slate-50",
                ].join(" ")
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}