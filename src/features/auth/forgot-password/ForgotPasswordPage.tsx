import { Link } from "react-router-dom";
import { useState } from "react";
import MobileShell from "../../../components/layout/MobileShell";
import AppHeader from "../../../components/layout/AppHeader";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <MobileShell>
      <AppHeader title="Road to HAPPY BALANCE" showBack />

      <div className="px-5 py-6">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900">ลืมรหัสผ่าน</h2>
          <p className="mt-2 text-sm text-slate-500">รหัสผ่านใหม่</p>
        </div>

        {submitted ? (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-700">
              ระบบได้ส่งข้อมูลสำหรับเปลี่ยนรหัสผ่านใหม่ไปยังอีเมลของคุณแล้ว
            </p>

            <Link
              to="/login"
              className="block w-full rounded-2xl bg-rose-300 px-4 py-3 text-center font-medium text-white hover:bg-rose-400"
            >
              กลับไปเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                อีเมล
              </label>
              <input
                type="email"
                required
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="openheart@gmail.com"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-rose-300 px-4 py-3 font-medium text-white hover:bg-rose-400"
            >
              ส่ง
            </button>
          </form>
        )}
      </div>
    </MobileShell>
  );
}