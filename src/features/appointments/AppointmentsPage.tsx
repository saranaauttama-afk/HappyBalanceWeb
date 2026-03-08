import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { appointmentsService } from "../../services/appointments.service";
import type { Appointment } from "../../types/models";
import { getCurrentUserId } from "../../utils/authSession";

function getDefaultAppointmentDateTime() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setHours(10, 0, 0, 0);
  return now.toISOString().slice(0, 16);
}

function formatThaiDate(date: Date) {
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatThaiDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMonthGrid(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ day: number | null; isToday: boolean }> = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ day: null, isToday: false });
  }

  const today = new Date();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;

    cells.push({ day, isToday });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: null, isToday: false });
  }

  return cells;
}

export default function AppointmentsPage() {
  const userId = getCurrentUserId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [appointmentDate, setAppointmentDate] = useState(
    getDefaultAppointmentDateTime()
  );
  const [type, setType] = useState("consultation");
  const [note, setNote] = useState("");
  const [dailyNote, setDailyNote] = useState("");

  async function loadAppointments() {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentsService.listAppointments(userId ?? undefined);

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดข้อมูลการนัดหมายได้");
      }

      setAppointments(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAppointments();
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage("");

      const response = await appointmentsService.createAppointment({
        user_id: userId ?? undefined,
        appointment_date: new Date(appointmentDate).toISOString(),
        type,
        status: "pending",
        note,
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถส่งคำขอนัดหมายได้");
      }

      setSuccessMessage("ส่งคำขอนัดหมายเรียบร้อยแล้ว");
      setNote("");
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSaving(false);
    }
  }

  const monthDate = useMemo(() => new Date(), []);
  const monthGrid = useMemo(() => getMonthGrid(monthDate), [monthDate]);
  const monthLabel = monthDate.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });

  const upcomingAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      return (
        new Date(a.appointment_date).getTime() -
        new Date(b.appointment_date).getTime()
      );
    });
  }, [appointments]);

  return (
    <MobileShell withBottomNav>
      <AppHeader title="การนัดหมาย" showBell />

      <main className="space-y-4 px-4 py-4">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <InfoCard>
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">ตารางนัดหมาย</h2>
              <p className="mt-1 text-sm text-slate-500">{monthLabel}</p>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
              {["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((day) => (
                <div key={day} className="py-1 font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthGrid.map((cell, index) => (
                <div
                  key={`${cell.day ?? "empty"}-${index}`}
                  className={`flex h-10 items-center justify-center rounded-xl text-sm ${
                    cell.day == null
                      ? "bg-transparent"
                      : cell.isToday
                      ? "bg-rose-300 font-semibold text-white"
                      : "bg-slate-50 text-slate-700"
                  }`}
                >
                  {cell.day ?? ""}
                </div>
              ))}
            </div>
          </div>
        </InfoCard>

        <InfoCard>
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">บันทึกประจำวัน</h3>
              <p className="mt-1 text-sm text-slate-500">
                บันทึกความรู้สึกหรือสิ่งสำคัญของวันนี้
              </p>
            </div>

            <textarea
              value={dailyNote}
              onChange={(e) => setDailyNote(e.target.value)}
              rows={4}
              placeholder="วันนี้คุณรู้สึกอย่างไร..."
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />

            <p className="text-xs text-slate-400">
              วันที่ {formatThaiDate(new Date())}
            </p>
          </div>
        </InfoCard>

        <InfoCard>
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">เป้าหมาย</h3>
              <p className="mt-1 text-sm text-slate-500">
                สรุปเป้าหมายที่ควรให้ความสำคัญในช่วงนี้
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">ดูแลสุขภาวะของตนเองอย่างต่อเนื่อง</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                ทบทวนกิจกรรมที่ตั้งเป้าหมายไว้ และติดตามความสม่ำเสมอของการปฏิบัติในแต่ละวัน
              </p>
            </div>
          </div>
        </InfoCard>

        <InfoCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                นัดหมายเข้ารับการปรึกษา
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                เลือกวันเวลาและส่งคำขอเพื่อนัดหมายกับผู้ให้คำปรึกษา
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                วันและเวลา
              </label>
              <input
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                รูปแบบการนัดหมาย
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              >
                <option value="consultation">การปรึกษา</option>
                <option value="follow-up">ติดตามผล</option>
                <option value="coaching">การโค้ช</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                หมายเหตุ
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="ระบุรายละเอียดเพิ่มเติมสำหรับการนัดหมาย"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full rounded-2xl px-4 py-3 font-medium text-white ${
                saving ? "bg-slate-400" : "bg-rose-300 hover:bg-rose-400"
              }`}
            >
              {saving ? "กำลังส่งคำขอ..." : "นัดหมายเข้ารับการปรึกษา"}
            </button>

            <button
              type="button"
              className="w-full rounded-2xl border border-rose-300 bg-white px-4 py-3 font-medium text-rose-400 hover:bg-rose-50"
            >
              รับการปรึกษาออนไลน์
            </button>
          </form>
        </InfoCard>

        <InfoCard>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">รายการนัดหมาย</h3>

            {loading ? (
              <p className="text-sm text-slate-500">กำลังโหลดข้อมูลการนัดหมาย...</p>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-sm text-slate-500">ยังไม่มีรายการนัดหมาย</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {item.type === "consultation"
                            ? "การปรึกษา"
                            : item.type === "follow-up"
                            ? "ติดตามผล"
                            : item.type === "coaching"
                            ? "การโค้ช"
                            : item.type}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatThaiDateTime(item.appointment_date)}
                        </p>
                        {item.note ? (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {item.note}
                          </p>
                        ) : null}
                      </div>

                      <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </InfoCard>
      </main>

      <BottomNav />
    </MobileShell>
  );
}
