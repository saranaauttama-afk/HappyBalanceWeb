import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import MobileShell from "../../../components/layout/MobileShell";
import AppHeader from "../../../components/layout/AppHeader";
import { authService } from "../../../services/auth.service";

export default function RegisterPage() {
  const navigate = useNavigate();
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
            <h2 className="text-3xl font-bold text-slate-900">สร้างบัญชีใหม่</h2>
            <p className="mt-2 text-sm text-slate-600">กรอกข้อมูลเพื่อเริ่มใช้งาน Happy Balance</p>
          </section>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">ชื่อ</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="เปิดใจ พร้อมฟัง"
              />
            </div>

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
              <label className="mb-2 block text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="08xxxxxxxx"
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
                placeholder="********"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">พิมพ์รหัสผ่านอีกครั้ง</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full rounded-2xl px-4 py-3 font-medium text-white ${
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

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm text-slate-500">หรือ สร้างบัญชีผ่าน</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm hover:bg-slate-50"
              aria-label="สร้างบัญชีผ่าน Facebook"
            >
              f
            </button>

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm hover:bg-slate-50"
              aria-label="สร้างบัญชีผ่าน Apple ID"
            >
              
            </button>

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm hover:bg-slate-50"
              aria-label="สร้างบัญชีผ่าน Gmail"
            >
              G
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
