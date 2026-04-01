import { LockKeyhole, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { authService } from "../../../services/auth.service";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() || "", [searchParams]);
  const heroImage =
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function validateToken() {
      if (!token) {
        setChecking(false);
        setTokenValid(false);
        setError("ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง");
        return;
      }

      try {
        setChecking(true);
        setError(null);
        const response = await authService.validatePasswordResetToken(token);

        if (!response.success || !response.data.valid) {
          throw new Error(response.error || response.data.error || "ลิงก์รีเซ็ตหมดอายุหรือไม่ถูกต้อง");
        }

        if (!cancelled) {
          setMaskedEmail(response.data.email || "");
          setTokenValid(true);
        }
      } catch (err) {
        if (!cancelled) {
          setTokenValid(false);
          setError(err instanceof Error ? err.message : "ไม่สามารถตรวจสอบลิงก์รีเซ็ตได้");
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    void validateToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("ยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      setSaving(true);
      const response = await authService.resetPassword({
        token,
        new_password: password,
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถตั้งรหัสผ่านใหม่ได้");
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
                CREATE NEW PASSWORD
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">ตั้งรหัสผ่านใหม่</h2>
              <p className="mt-2 max-w-[16rem] rounded-2xl border border-white/60 bg-white/52 px-4 py-3 text-sm leading-6 text-slate-700 backdrop-blur-[2px]">
                ตั้งรหัสผ่านใหม่ที่ปลอดภัยเพื่อกลับเข้าใช้งานบัญชีของคุณได้อย่างมั่นใจ
              </p>
            </div>
          </section>

          {checking ? (
            <div className="mt-4 rounded-3xl border border-white/75 bg-white/88 p-5 shadow-[0_18px_42px_rgba(31,47,61,0.12)] backdrop-blur">
              <p className="text-sm text-slate-600">กำลังตรวจสอบลิงก์รีเซ็ตรหัสผ่าน...</p>
            </div>
          ) : submitted ? (
            <div className="mt-4 space-y-4 rounded-3xl border border-white/75 bg-white/88 p-5 shadow-[0_18px_42px_rgba(31,47,61,0.12)] backdrop-blur">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว คุณสามารถกลับไปเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
              </div>

              <Link
                to="/login"
                className="block w-full rounded-2xl bg-[#d88d80] px-4 py-3 text-center font-semibold text-white shadow-[0_14px_30px_rgba(216,141,128,0.3)] transition hover:brightness-105"
              >
                กลับไปเข้าสู่ระบบ
              </Link>
            </div>
          ) : tokenValid ? (
            <form
              onSubmit={handleSubmit}
              className="mt-4 space-y-4 rounded-3xl border border-white/75 bg-white/88 p-5 shadow-[0_18px_42px_rgba(31,47,61,0.12)] backdrop-blur"
            >
              {maskedEmail ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  กำลังตั้งรหัสผ่านใหม่สำหรับ {maskedEmail}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">รหัสผ่านใหม่</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f9fbfc] px-4 py-3 transition focus-within:border-[#87b4a5] focus-within:bg-white">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">ยืนยันรหัสผ่านใหม่</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f9fbfc] px-4 py-3 transition focus-within:border-[#87b4a5] focus-within:bg-white">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="กรอกรหัสผ่านเดิมอีกครั้ง"
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
                {saving ? "กำลังบันทึกรหัสผ่านใหม่..." : "บันทึกรหัสผ่านใหม่"}
              </button>
            </form>
          ) : (
            <div className="mt-4 space-y-4 rounded-3xl border border-white/75 bg-white/88 p-5 shadow-[0_18px_42px_rgba(31,47,61,0.12)] backdrop-blur">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
                {error || "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอรีเซ็ตใหม่อีกครั้ง"}
              </div>

              <Link
                to="/forgot-password"
                className="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center font-semibold text-white transition hover:brightness-105"
              >
                ขอรีเซ็ตรหัสผ่านใหม่
              </Link>
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
}
