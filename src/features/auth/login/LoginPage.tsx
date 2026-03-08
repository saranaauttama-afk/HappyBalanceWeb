import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import MobileShell from "../../../components/layout/MobileShell";
import AppHeader from "../../../components/layout/AppHeader";
import { authService } from "../../../services/auth.service";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setSaving(true);
      const response = await authService.loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!response.success) {
        if (response.error?.includes("Unknown POST action: loginUser")) {
          throw new Error("ระบบยังไม่รองรับ loginUser กรุณาอัปเดต Apps Script ก่อน");
        }
        throw new Error(response.error || "เข้าสู่ระบบไม่สำเร็จ");
      }

      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-20 h-60 w-60 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-16 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

        <AppHeader title="Road to HAPPY BALANCE" showBack />

        <div className="relative z-10 px-5 py-6">
          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(31,47,61,0.14)] backdrop-blur">
            <h2 className="text-3xl font-bold text-slate-900">เข้าสู่ระบบ</h2>
            <p className="mt-2 text-sm text-slate-600">ยินดีต้อนรับกลับ กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</p>
          </section>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">อีเมล</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="openheart@gmail.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">รหัสผ่าน</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-slate-500 hover:text-slate-700">
                ลืมรหัสผ่าน ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full rounded-2xl px-4 py-3 font-medium text-white ${
                saving ? "bg-slate-400" : "bg-[#d88d80] hover:brightness-105"
              }`}
            >
              {saving ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>

            <p className="text-center text-sm text-slate-500">
              ยังไม่มีบัญชี?{" "}
              <Link to="/terms" className="font-medium text-slate-700 hover:text-slate-900">
                สร้างบัญชีใหม่
              </Link>
            </p>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm text-slate-500">หรือ เข้าสู่ระบบผ่าน</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              disabled
              className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-lg text-slate-400"
              aria-label="เข้าสู่ระบบผ่าน Facebook"
              title="Coming soon"
            >
              f
            </button>

            <button
              type="button"
              disabled
              className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-lg text-slate-400"
              aria-label="เข้าสู่ระบบผ่าน Apple ID"
              title="Coming soon"
            >
              
            </button>

            <button
              type="button"
              disabled
              className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-lg text-slate-400"
              aria-label="เข้าสู่ระบบผ่าน Gmail"
              title="Coming soon"
            >
              G
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
