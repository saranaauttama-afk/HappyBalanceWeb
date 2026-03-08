import { Link } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";

export default function HelpPage() {
  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />

        <AppHeader
          title="ช่วยเหลือ"
          subtitle="หน้านี้กำลังอยู่ระหว่างจัดเตรียมข้อมูล"
          showBack
          showBell
          variant="soft"
        />

        <main className="relative z-10 px-4 py-6">
          <InfoCard className="rounded-3xl border-white/70 bg-white/85 text-center shadow-[0_18px_50px_rgba(31,47,61,0.12)] backdrop-blur">
            <p className="text-sm leading-7 text-slate-600">
              หน้าช่วยเหลือและช่องทางติดต่อจะเปิดใช้งานเร็ว ๆ นี้
            </p>
            <Link
              to="/profile"
              className="mt-4 inline-flex rounded-xl bg-[#d88d80] px-4 py-2 text-sm font-medium text-white"
            >
              กลับหน้าบัญชี
            </Link>
          </InfoCard>
        </main>
      </div>
    </MobileShell>
  );
}
