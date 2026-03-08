import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";
import { profileService } from "../../../services/profile.service";
import type { User } from "../../../types/models";
import { getCurrentUserId } from "../../../utils/authSession";

type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
};

function toText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function createInitialForm(user?: User | null): ProfileForm {
  return {
    full_name: toText(user?.full_name),
    email: toText(user?.email),
    phone: toText(user?.phone),
  };
}

export default function PersonalInfoPage() {
  const userId = getCurrentUserId();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>(createInitialForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError(null);

        const response = await profileService.getUser(userId ?? undefined);
        if (!response.success) {
          throw new Error(response.error || "ไม่สามารถโหลดข้อมูลส่วนตัวได้");
        }

        setUser(response.data);
        setForm(createInitialForm(response.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [userId]);

  const isFormChanged = useMemo(() => {
    if (!user) return false;
    return (
      form.full_name.trim() !== toText(user.full_name).trim() ||
      form.email.trim() !== toText(user.email).trim() ||
      form.phone.trim() !== toText(user.phone).trim()
    );
  }, [form, user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage("");
    setError(null);

    const fullName = form.full_name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!fullName || !email || !phone) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setSaving(true);
      const response = await profileService.updateProfile({
        id: userId ?? undefined,
        full_name: fullName,
        email,
        phone,
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกข้อมูลได้");
      }

      setUser(response.data);
      setForm(createInitialForm(response.data));
      setSuccessMessage("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />

        <AppHeader title="ข้อมูลส่วนตัว" subtitle="จัดการข้อมูลพื้นฐานของบัญชีผู้ใช้งาน" showBack showBell variant="soft" />

        <main className="relative z-10 space-y-4 px-4 py-4">
          {loading ? (
            <InfoCard className="border-white/70 bg-white/80">
              <p className="text-sm text-slate-500">กำลังโหลดข้อมูลส่วนตัว...</p>
            </InfoCard>
          ) : (
            <InfoCard className="rounded-3xl border-white/70 bg-white/85 shadow-[0_18px_50px_rgba(31,47,61,0.12)] backdrop-blur">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {successMessage}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="full_name" className="mb-2 block text-sm font-medium text-slate-700">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#d88d80]"
                    placeholder="ระบุชื่อ-นามสกุล"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                    อีเมล (Username)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none"
                    placeholder="example@email.com"
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    ใช้อีเมลนี้เป็นชื่อผู้ใช้สำหรับเข้าสู่ระบบ จึงไม่สามารถแก้ไขได้
                  </p>
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#d88d80]"
                    placeholder="08xxxxxxxx"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || !isFormChanged}
                  className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
                    saving || !isFormChanged
                      ? "cursor-not-allowed bg-slate-300"
                      : "bg-[#d88d80] hover:brightness-105"
                  }`}
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </form>
            </InfoCard>
          )}
        </main>
      </div>
    </MobileShell>
  );
}
