import { LockKeyhole, Mail, Phone, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { authService } from "../../../services/auth.service";
import { getPostAuthRedirectPath, setCurrentUser } from "../../../utils/authSession";

export default function RegisterPage() {
  const navigate = useNavigate();
  const heroImage =
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      setSaving(true);
      const response = await authService.registerUser({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        auth_provider: "password",
      });

      if (!response.success) {
        if (response.error?.includes("Unknown POST action: registerUser")) {
          throw new Error("ระบบยังไม่รองรับสมัครสมาชิก กรุณาเพิ่ม registerUser ใน Apps Script ก่อน");
        }

        throw new Error(response.error || "ไม่สามารถบันทึกข้อมูลได้");
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
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[72%_center] opacity-[0.8]"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(96deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.88)_28%,rgba(255,255,255,0.62)_46%,rgba(255,255,255,0.12)_66%,rgba(255,255,255,0)_100%)]" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[48%] bg-[linear-gradient(90deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.06)_100%)]" />

            <div className="relative z-10">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/72 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#1f6658] backdrop-blur-sm">
                <Sparkles size={13} />
                CREATE YOUR SPACE
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">สร้างบัญชีใหม่</h2>
              <p className="mt-2 max-w-[15rem] rounded-2xl border border-white/60 bg-white/52 px-4 py-3 text-sm leading-6 text-slate-700 backdrop-blur-[2px]">
                เริ่มต้นใช้งาน Happy Balance เพื่อดูเป้าหมาย บันทึกประจำวัน และติดตามสุขสมดุลของคุณในที่เดียว
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
              <label className="mb-2 block text-sm font-medium text-slate-700">ชื่อ</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f9fbfc] px-4 py-3 transition focus-within:border-[#87b4a5] focus-within:bg-white">
                <UserRound size={18} className="text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="เปิดใจ พร้อมฟัง"
                />
              </div>
            </div>

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
              <label className="mb-2 block text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f9fbfc] px-4 py-3 transition focus-within:border-[#87b4a5] focus-within:bg-white">
                <Phone size={18} className="text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="08xxxxxxxx"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">พิมพ์รหัสผ่านอีกครั้ง</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f9fbfc] px-4 py-3 transition focus-within:border-[#87b4a5] focus-within:bg-white">
                <LockKeyhole size={18} className="text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="••••••••"
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
              {saving ? "กำลังบันทึก..." : "ลงทะเบียน"}
            </button>

            <p className="text-center text-sm text-slate-500">
              ลงทะเบียนแล้วหรือยัง?{" "}
              <Link to="/login" className="font-medium text-slate-700 hover:text-slate-900">
                เข้าสู่ระบบที่นี่
              </Link>
            </p>
          </form>

          {/* Social register — hidden for now
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm text-slate-500">หรือ สร้างบัญชีผ่าน</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="flex items-center justify-center gap-4">
            <button type="button" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/70 text-lg text-slate-500 shadow-[0_10px_24px_rgba(31,47,61,0.08)] backdrop-blur transition hover:bg-white">f</button>
            <button type="button" aria-label="Apple ID" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/70 text-lg text-slate-500 shadow-[0_10px_24px_rgba(31,47,61,0.08)] backdrop-blur transition hover:bg-white"></button>
            <button type="button" aria-label="Gmail" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/70 text-lg text-slate-500 shadow-[0_10px_24px_rgba(31,47,61,0.08)] backdrop-blur transition hover:bg-white">G</button>
          </div>
          */}
        </div>
      </div>
    </MobileShell>
  );
}
