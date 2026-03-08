import { useNavigate } from "react-router-dom";
import MobileShell from "../../../components/layout/MobileShell";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <MobileShell>
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_38%,#e6f6ef_100%)] px-5 py-8">
        <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-10 h-52 w-52 rounded-full bg-[#7dcdb8]/25 blur-3xl" />

        <section className="relative z-10 rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_20px_60px_rgba(51,87,81,0.16)] backdrop-blur">
          <p className="inline-flex rounded-full bg-[#e6f6ef] px-3 py-1 text-xs font-bold tracking-[0.14em] text-[#1f6658]">
            HAPPY BALANCE
          </p>

          <h1 className="mt-4 text-[2rem] font-extrabold leading-tight text-[#1c3140]">
            Road to
            <br />
            Better Balance
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#415760]">
            นวัตกรรมการปรึกษาเชิงจิตวิทยาเพื่อเสริมสร้างภาวะสุขสมดุลของบุคคลวัยทำงาน
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-2xl bg-[#f7fbff] px-2 py-3">
              <p className="font-bold text-[#224560]">Body</p>
            </div>
            <div className="rounded-2xl bg-[#f8fff8] px-2 py-3">
              <p className="font-bold text-[#24543f]">Mind</p>
            </div>
            <div className="rounded-2xl bg-[#fff9f4] px-2 py-3">
              <p className="font-bold text-[#6f4c2a]">Life</p>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-6 rounded-[24px] bg-[#1f2f3d] px-5 py-6 text-white shadow-[0_14px_40px_rgba(31,47,61,0.32)]">
          <p className="text-sm text-white/80">เริ่มต้นใช้งาน</p>
          <h2 className="mt-1 text-xl font-bold">คุณมีบัญชีแล้วหรือยัง?</h2>

          <div className="mt-5 space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-2xl bg-[#ffb38a] px-4 py-3 text-base font-bold text-[#3a2414] transition hover:brightness-105"
            >
              เข้าสู่ระบบ
            </button>

            <button
              onClick={() => navigate("/terms")}
              className="w-full rounded-2xl border border-white/40 bg-white/10 px-4 py-3 text-base font-semibold text-white transition hover:bg-white/20"
            >
              สร้างบัญชีใหม่
            </button>
          </div>
        </section>

        <div className="relative z-10 mt-6 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-xs text-[#4a5f66]">
          ดูแลเป้าหมายรายวัน ติดตามความสมดุลชีวิต และนัดหมายรับคำปรึกษาได้ในที่เดียว
        </div>
      </main>
    </MobileShell>
  );
}
