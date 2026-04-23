import { LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { authService } from "../../../services/auth.service";
import { getPostAuthRedirectPath, setCurrentUser } from "../../../utils/authSession";
import loginHeroImage from "../../../asset/images/login.jpg";

export default function LoginPage() {
  const navigate = useNavigate();
  const heroImage = loginHeroImage;
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

      setCurrentUser(response.data);
      const redirectPath = await getPostAuthRedirectPath(response.data);
      navigate(redirectPath, { replace: true });
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
                WELCOME BACK
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">เข้าสู่ระบบ</h2>
              <p className="mt-2 max-w-[15rem] rounded-2xl border border-white/60 bg-white/52 px-4 py-3 text-sm leading-6 text-slate-700 backdrop-blur-[2px]">
                ยินดีต้อนรับกลับ เข้าสู่ระบบเพื่อดูเป้าหมาย สุขสมดุล และบันทึกประจำวันของคุณ
              </p>
            </div>
          </section>

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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">รหัสผ่าน</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f9fbfc] px-4 py-3 transition focus-within:border-[#87b4a5] focus-within:bg-white">
                <LockKeyhole size={18} className="text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-slate-500 hover:text-slate-700">
                ลืมรหัสผ่าน ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full rounded-2xl px-4 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(216,141,128,0.3)] transition ${
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

          {/* Social login — hidden for now
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm text-slate-500">หรือ เข้าสู่ระบบผ่าน</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="flex items-center justify-center gap-4">
            <button type="button" disabled aria-label="Facebook" title="Coming soon" className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-full border border-white/70 bg-white/70 text-lg text-slate-400 shadow-[0_10px_24px_rgba(31,47,61,0.08)] backdrop-blur">f</button>
            <button type="button" disabled aria-label="Apple ID" title="Coming soon" className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-full border border-white/70 bg-white/70 text-lg text-slate-400 shadow-[0_10px_24px_rgba(31,47,61,0.08)] backdrop-blur"></button>
            <button type="button" disabled aria-label="Gmail" title="Coming soon" className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-full border border-white/70 bg-white/70 text-lg text-slate-400 shadow-[0_10px_24px_rgba(31,47,61,0.08)] backdrop-blur">G</button>
          </div>
          */}
        </div>
      </div>
    </MobileShell>
  );
}
