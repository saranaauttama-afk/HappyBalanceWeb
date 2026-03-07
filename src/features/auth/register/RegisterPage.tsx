import { Link, useNavigate } from "react-router-dom";
import MobileShell from "../../../components/layout/MobileShell";
import AppHeader from "../../../components/layout/AppHeader";

export default function RegisterPage() {
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate("/home");
  }

  return (
    <MobileShell>
      <AppHeader title="Road to HAPPY BALANCE" showBack />

      <div className="px-5 py-6">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900">สร้างบัญชีใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ชื่อ
            </label>
            <input
              type="text"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="เปิดใจ พร้อมฟัง"
            />
          </div>

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

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              รหัสผ่าน
            </label>
            <input
              type="password"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="********"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              พิมพ์รหัสผ่านอีกครั้ง
            </label>
            <input
              type="password"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-rose-300 px-4 py-3 font-medium text-white hover:bg-rose-400"
          >
            ลงทะเบียน
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
          <span className="text-sm text-slate-400">หรือ สร้างบัญชีผ่าน</span>
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
    </MobileShell>
  );
}