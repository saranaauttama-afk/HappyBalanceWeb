import type { ReactNode } from "react";

interface MobileShellProps {
  children: ReactNode;
  withBottomNav?: boolean;
}

export default function MobileShell({
  children,
  withBottomNav = false,
}: MobileShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div
        className={`w-full max-w-[480px] min-h-screen bg-white ${
          withBottomNav ? "pb-20" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}