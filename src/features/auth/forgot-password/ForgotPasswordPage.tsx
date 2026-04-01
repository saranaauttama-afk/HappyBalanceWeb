import { Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { authService } from "../../../services/auth.service";

export default function ForgotPasswordPage() {
  const heroImage =
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1400&q=80";
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setSaving(true);
      const response = await authService.requestPasswordReset({
        email: email.trim().toLowerCase(),
        app_base_url: window.location.origin,
      });

      if (!response.success) {
        if (response.error?.includes("Unknown POST action: requestPasswordReset")) {
          throw new Error("ระบบยังไม่รองรับการรีเซ็ตรหัสผ่าน กรุณาอัปเดต Apps Script ก่อน");
        }
        throw new Error(response.error || "ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้");
      }

      setSubmitted(true);
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

        <AppHeader
          title="HAPPY BALANCE"
          subtitle="Road to Better Balance"
          showBack
          variant="soft"
        />

        <div className="relative z-10 px-5 py-6">
          <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(31,47,61,0.14)] backdrop-blur">
            <img
              src={heroImage}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[72%_center] opacity-[0.78]"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(96deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.88)_28%,rgba(255,255,255,0.62)_46%,rgba(255,255,255,0.12)_66%,rgba(255,255,255,0)_100%)]" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[48%] bg-[linear-gradient(90deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.06)_100%)]" />

            <div className="relative z-10">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/72 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#1f6658] backdrop-blur-sm">
                <Sparkles size={13} />
                RESET ACCESS
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">ลืมรหัสผ่าน</h2>
              <p className="mt-2 max-w-[15rem] rounded-2xl border border-white/60 bg-white/52 px-4 py-3 text-sm leading-6 text-slate-700 backdrop-blur-[2px]">
                กรอกอีเมลของคุณ แล้วระบบจะส่งลิงก์สำหรับตั้งค่ารหัสผ่านใหม่ไปให้ทางอีเมล
              </p>
            </div>
          </section>

          {submitted ? (
            <div className="mt-4 space-y-4 rounded-3xl border border-white/75 bg-white/88 p-5 shadow-[0_18px_42px_rgba(31,47,61,0.12)] backdrop-blur">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                ถ้าอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว กรุณาตรวจสอบในกล่องข้อความและโฟลเดอร์สแปม
              </div>

              <Link
                to="/login"
                className="block w-full rounded-2xl bg-[#d88d80] px-4 py-3 text-center font-semibold text-white shadow-[0_14px_30px_rgba(216,141,128,0.3)] transition hover:brightness-105"
              >
                กลับไปเข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-4 space-y-4 rounded-3xl border border-white/75 bg-white/88 p-5 shadow-[0_18px_42px_rgba(31,47,61,0.12)] backdrop-blur"
            >
              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">อีเมล</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f9fbfc] px-4 py-3 transition focus-within:border-[#87b4a5] focus-within:bg-white">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="openheart@gmail.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full rounded-2xl px-4 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(216,141,128,0.3)] transition ${
                  saving ? "bg-slate-400" : "bg-[#d88d80] hover:brightness-105"
                }`}
              >
                {saving ? "กำลังส่งลิงก์รีเซ็ต..." : "ส่งลิงก์รีเซ็ต"}
              </button>
            </form>
          )}
        </div>
      </div>
    </MobileShell>
  );
}
