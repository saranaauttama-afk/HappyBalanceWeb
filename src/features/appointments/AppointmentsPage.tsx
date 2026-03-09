import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardPenLine,
  Sparkles,
  Stethoscope,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { appointmentsService } from "../../services/appointments.service";
import { logsService } from "../../services/logs.service";
import type { Appointment, DailyLog } from "../../types/models";
import { getCurrentUserId } from "../../utils/authSession";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInputValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function parseDateValue(value: string) {
  if (!value) return null;

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function getStartOfToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function getDefaultAppointmentSelection() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setHours(10, 0, 0, 0);
  return {
    date: toDateInputValue(now),
    time: toTimeInputValue(now),
  };
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
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  });
}

function formatTypeLabel(value: string) {
  if (value === "consultation") return "การปรึกษา";
  if (value === "follow-up") return "ติดตามผล";
  if (value === "coaching") return "การโค้ช";
  return value;
}

function formatStatusLabel(status: Appointment["status"]) {
  if (status === "pending") return "รอยืนยัน";
  if (status === "confirmed") return "ยืนยันแล้ว";
  if (status === "done") return "เสร็จสิ้น";
  return "ยกเลิก";
}

function getStatusStyle(status: Appointment["status"]) {
  if (status === "pending") return "bg-amber-50 text-amber-700";
  if (status === "confirmed") return "bg-sky-50 text-sky-700";
  if (status === "done") return "bg-emerald-50 text-emerald-700";
  return "bg-rose-50 text-rose-700";
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

const cardClassName =
  "border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(31,47,61,0.12)] backdrop-blur";
const quickAppointmentTimes = ["09:00", "13:00", "16:00", "19:00"];
const appointmentHourOptions = Array.from({ length: 24 }, (_, index) => pad(index));
const appointmentMinuteOptions = ["00", "15", "30", "45"];

export default function AppointmentsPage() {
  const userId = getCurrentUserId();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDailyLog, setSavingDailyLog] = useState(false);
  const [savingMonthlyGoal, setSavingMonthlyGoal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [dailyLogMessage, setDailyLogMessage] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [monthlyGoalMessage, setMonthlyGoalMessage] = useState("");

  const [monthDate, setMonthDate] = useState(() => getStartOfToday());
  const [selectedDate, setSelectedDate] = useState(() => getStartOfToday());

  const defaultAppointmentSelection = useMemo(() => getDefaultAppointmentSelection(), []);
  const [appointmentDate, setAppointmentDate] = useState(defaultAppointmentSelection.date);
  const [appointmentTime, setAppointmentTime] = useState(defaultAppointmentSelection.time);
  const [note, setNote] = useState("");
  const [dailyNote, setDailyNote] = useState("");
  const [appointmentHour, appointmentMinute] = useMemo(() => {
    const [hour = "10", minute = "00"] = appointmentTime.split(":");
    return [hour, minute];
  }, [appointmentTime]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [appointmentsResponse, dailyLogsResponse] = await Promise.all([
        appointmentsService.listAppointments(userId ?? undefined),
        userId ? logsService.listDailyLogs(userId) : logsService.listDailyLogs(),
      ]);

      if (!appointmentsResponse.success) {
        throw new Error(appointmentsResponse.error || "ไม่สามารถโหลดข้อมูลการนัดหมายได้");
      }

      if (!dailyLogsResponse.success) {
        throw new Error(dailyLogsResponse.error || "ไม่สามารถโหลดบันทึกประจำวันได้");
      }

      setAppointments(appointmentsResponse.data || []);
      setDailyLogs(dailyLogsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const monthKey = useMemo(() => toMonthKey(monthDate), [monthDate]);

  const dailyLogByDate = useMemo(() => {
    const map = new Map<string, DailyLog>();
    dailyLogs.forEach((item) => {
      const parsedDate = parseDateValue(String(item.log_date));
      if (!parsedDate) return;
      map.set(toDateKey(parsedDate), item);
    });
    return map;
  }, [dailyLogs]);

  const selectedDailyLog = useMemo(
    () => dailyLogByDate.get(selectedDateKey) ?? null,
    [dailyLogByDate, selectedDateKey]
  );

  useEffect(() => {
    setDailyNote(String(selectedDailyLog?.note ?? ""));
    setDailyLogMessage("");
  }, [selectedDateKey, selectedDailyLog]);

  const loadMonthlyGoal = useCallback(async () => {
    try {
      setError(null);
      const response = await appointmentsService.listMonthlyGoals(
        userId ?? undefined,
        monthKey
      );

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดเป้าหมายรายเดือนได้");
      }

      setMonthlyGoal(String(response.data?.[0]?.goal_text ?? ""));
      setMonthlyGoalMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    }
  }, [monthKey, userId]);

  useEffect(() => {
    void loadMonthlyGoal();
  }, [loadMonthlyGoal]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMessage("");

    if (!appointmentDate || !appointmentTime) {
      setError("กรุณาเลือกวันและเวลาให้ครบ");
      return;
    }

    const parsedDate = new Date(`${appointmentDate}T${appointmentTime}`);
    if (Number.isNaN(parsedDate.getTime())) {
      setError("กรุณาเลือกวันเวลาให้ถูกต้อง");
      return;
    }

    try {
      setSaving(true);
      const response = await appointmentsService.createAppointment({
        user_id: userId ?? undefined,
        appointment_date: parsedDate.toISOString(),
        type: "consultation",
        status: "pending",
        note: note.trim(),
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถส่งคำขอนัดหมายได้");
      }

      setSuccessMessage("ส่งคำขอนัดหมายเรียบร้อยแล้ว");
      setNote("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDailyLog() {
    setError(null);
    setDailyLogMessage("");

    const trimmedNote = dailyNote.trim();
    if (!trimmedNote) {
      setError("กรุณากรอกบันทึกประจำวันก่อนบันทึก");
      return;
    }

    try {
      setSavingDailyLog(true);

      const response = await logsService.createDailyLog({
        user_id: userId ?? undefined,
        log_date: selectedDateKey,
        mood: "neutral",
        energy: 3,
        stress: 3,
        note: trimmedNote,
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกข้อมูลประจำวันได้");
      }

      const logsResponse = userId
        ? await logsService.listDailyLogs(userId)
        : await logsService.listDailyLogs();

      if (!logsResponse.success) {
        throw new Error(logsResponse.error || "บันทึกสำเร็จ แต่โหลดข้อมูลล่าสุดไม่สำเร็จ");
      }

      setDailyLogs(logsResponse.data || []);
      setDailyLogMessage(`บันทึกวันที่ ${formatThaiDate(selectedDate)} เรียบร้อยแล้ว`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSavingDailyLog(false);
    }
  }

  const monthGrid = useMemo(() => getMonthGrid(monthDate), [monthDate]);

  const monthLabel = useMemo(
    () =>
      monthDate.toLocaleDateString("th-TH", {
        month: "long",
        year: "numeric",
      }),
    [monthDate]
  );

  const upcomingAppointments = useMemo(() => {
    return [...appointments]
      .filter((item) => {
        const time = new Date(item.appointment_date).getTime();
        return Number.isFinite(time);
      })
      .sort((a, b) => {
        return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
      });
  }, [appointments]);

  const appointmentDaySet = useMemo(() => {
    const keys = new Set<string>();
    appointments.forEach((item) => {
      const date = parseDateValue(item.appointment_date);
      if (!date) return;
      if (date.getFullYear() !== monthDate.getFullYear()) return;
      if (date.getMonth() !== monthDate.getMonth()) return;
      keys.add(toDateKey(date));
    });
    return keys;
  }, [appointments, monthDate]);

  const dailyLogDaySet = useMemo(() => {
    const keys = new Set<string>();
    dailyLogs.forEach((item) => {
      const date = parseDateValue(String(item.log_date));
      if (!date) return;
      if (date.getFullYear() !== monthDate.getFullYear()) return;
      if (date.getMonth() !== monthDate.getMonth()) return;
      keys.add(toDateKey(date));
    });
    return keys;
  }, [dailyLogs, monthDate]);

  const pendingCount = useMemo(
    () => appointments.filter((item) => item.status === "pending").length,
    [appointments]
  );

  function handleChangeMonth(offset: number) {
    const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + offset, 1);
    setMonthDate(nextMonth);
    setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
  }

  function handleSelectDate(day: number) {
    setSelectedDate(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }

  function handleAppointmentHourChange(hour: string) {
    setAppointmentTime(`${hour}:${appointmentMinute}`);
  }

  function handleAppointmentMinuteChange(minute: string) {
    setAppointmentTime(`${appointmentHour}:${minute}`);
  }

  async function handleSaveMonthlyGoal() {
    const trimmedGoal = monthlyGoal.trim();
    setError(null);
    setMonthlyGoalMessage("");

    try {
      setSavingMonthlyGoal(true);

      const response = await appointmentsService.upsertMonthlyGoal({
        user_id: userId ?? undefined,
        month_key: monthKey,
        goal_text: trimmedGoal,
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกเป้าหมายรายเดือนได้");
      }

      setMonthlyGoal(String(response.data?.goal_text ?? trimmedGoal));
      setMonthlyGoalMessage(
        trimmedGoal
          ? `บันทึกเป้าหมายของเดือน ${monthLabel} เรียบร้อยแล้ว`
          : `ล้างเป้าหมายของเดือน ${monthLabel} แล้ว`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSavingMonthlyGoal(false);
    }
  }

  return (
    <MobileShell>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />

        <AppHeader
          title="การนัดหมาย"
          subtitle="ติดตามและส่งคำขอรับการปรึกษา"
          showBell
          variant="soft"
        />

        <main className="relative z-10 flex-1 space-y-4 px-4 py-4">
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

          {dailyLogMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {dailyLogMessage}
            </div>
          ) : null}

          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/80 px-2 py-3">
                <p className="text-xs text-slate-500">นัดหมายทั้งหมด</p>
                <p className="text-lg font-semibold text-slate-900">{appointments.length}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-2 py-3">
                <p className="text-xs text-amber-700">รอยืนยัน</p>
                <p className="text-lg font-semibold text-amber-800">{pendingCount}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-2 py-3">
                <p className="text-xs text-emerald-700">บันทึกแล้ว</p>
                <p className="text-lg font-semibold text-emerald-800">{dailyLogs.length}</p>
              </div>
            </div>
          </InfoCard>

          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf6ef] text-[#2f7b56]">
                  <Target size={18} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">เป้าหมายรายเดือน</h3>
                  <p className="text-sm text-slate-500">โฟกัสของเดือน {monthLabel}</p>
                </div>
              </div>

              <textarea
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(e.target.value)}
                rows={3}
                placeholder="เช่น เดือนนี้ต้องการปรับสมดุลชีวิตการทำงานและการพักผ่อนให้ดีขึ้น"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#4c9f7f]"
              />

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">ระบบจะเก็บเป้าหมายแยกตามแต่ละเดือน</p>
                <button
                  type="button"
                  onClick={() => void handleSaveMonthlyGoal()}
                  disabled={savingMonthlyGoal}
                  className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                    savingMonthlyGoal
                      ? "cursor-not-allowed bg-slate-300"
                      : "bg-[#4c9f7f] shadow-[0_12px_24px_rgba(76,159,127,0.3)] hover:brightness-105"
                  }`}
                >
                  {savingMonthlyGoal ? "กำลังบันทึก..." : "บันทึกเป้าหมาย"}
                </button>
              </div>

              {monthlyGoalMessage ? (
                <p className="text-xs font-medium text-emerald-700">{monthlyGoalMessage}</p>
              ) : null}
            </div>
          </InfoCard>

          <InfoCard className={`${cardClassName} relative overflow-hidden rounded-3xl`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf4ff] text-[#4e7498]">
                    <CalendarDays size={18} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">ปฏิทินนัดหมายและบันทึก</h2>
                    <p className="text-sm text-slate-500">{monthLabel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleChangeMonth(-1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    aria-label="เดือนก่อนหน้า"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeMonth(1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    aria-label="เดือนถัดไป"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  มีบันทึกประจำวัน
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#d88d80]" />
                  มีนัดหมาย
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
                {["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((day) => (
                  <div key={day} className="py-1 font-medium">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {monthGrid.map((cell, index) => {
                  if (cell.day == null) {
                    return <div key={`empty-${index}`} className="h-10" />;
                  }

                  const day = cell.day;
                  const cellDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                  const cellKey = toDateKey(cellDate);
                  const hasAppointment = appointmentDaySet.has(cellKey);
                  const hasDailyLog = dailyLogDaySet.has(cellKey);
                  const isSelected = cellKey === selectedDateKey;

                  const dateClass = isSelected
                    ? "bg-[#2f556a] font-semibold text-white"
                    : cell.isToday
                    ? "border border-[#d88d80]/60 bg-[#fff2ee] font-semibold text-[#a55f4f]"
                    : "bg-white/85 text-slate-700";

                  return (
                    <button
                      key={`${day}-${index}`}
                      type="button"
                      onClick={() => handleSelectDate(day)}
                      className={`relative flex h-10 items-center justify-center rounded-xl text-sm transition hover:brightness-95 ${dateClass}`}
                    >
                      {day}

                      {(hasDailyLog || hasAppointment) && (
                        <span className="absolute bottom-1 flex items-center gap-1">
                          {hasDailyLog ? (
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isSelected ? "bg-white" : "bg-emerald-500"
                              }`}
                            />
                          ) : null}
                          {hasAppointment ? (
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isSelected ? "bg-white/80" : "bg-[#d88d80]"
                              }`}
                            />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </InfoCard>

          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7ec] text-[#3f7a52]">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">บันทึกประจำวัน</h3>
                  <p className="text-sm text-slate-500">เลือกวันที่จากปฏิทินเพื่อดูย้อนหลังหรือบันทึกเพิ่ม</p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800">
                วันที่ที่เลือก: {formatThaiDate(selectedDate)}
                {selectedDailyLog ? " • มีบันทึกแล้ว" : " • ยังไม่มีบันทึก"}
              </div>

              <textarea
                value={dailyNote}
                onChange={(e) => setDailyNote(e.target.value)}
                rows={4}
                placeholder="วันนี้คุณรู้สึกอย่างไร หรือมีอะไรอยากบันทึก..."
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#d88d80]"
              />

              <button
                type="button"
                onClick={() => void handleSaveDailyLog()}
                disabled={savingDailyLog}
                className={`w-full rounded-2xl px-4 py-3 font-medium text-white transition ${
                  savingDailyLog
                    ? "cursor-not-allowed bg-slate-300"
                    : "bg-[#4c9f7f] shadow-[0_14px_30px_rgba(76,159,127,0.3)] hover:brightness-105"
                }`}
              >
                {savingDailyLog ? "กำลังบันทึก..." : "บันทึกประจำวัน"}
              </button>
            </div>
          </InfoCard>

          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1e7] text-[#b46e44]">
                  <ClipboardPenLine size={18} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">นัดหมายเข้ารับการปรึกษา</h3>
                  <p className="text-sm text-slate-500">เลือกวันเวลาแล้วส่งคำขอได้ทันที</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">วันที่นัดหมาย</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#d88d80]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">เวลา (24 ชั่วโมง)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={appointmentHour}
                      onChange={(e) => handleAppointmentHourChange(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#d88d80]"
                    >
                      {appointmentHourOptions.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <select
                      value={appointmentMinute}
                      onChange={(e) => handleAppointmentMinuteChange(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#d88d80]"
                    >
                      {appointmentMinuteOptions.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickAppointmentTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setAppointmentTime(time)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      appointmentTime === time
                        ? "border-[#d88d80] bg-[#fff1e9] text-[#b46e44]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">หมายเหตุ</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#d88d80]"
                  placeholder="ระบุรายละเอียดเพิ่มเติมสำหรับการนัดหมาย"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full rounded-2xl px-4 py-3 font-medium text-white transition ${
                  saving
                    ? "cursor-not-allowed bg-slate-300"
                    : "bg-[#d88d80] shadow-[0_14px_30px_rgba(216,141,128,0.35)] hover:brightness-105"
                }`}
              >
                {saving ? "กำลังส่งคำขอ..." : "นัดหมายเข้ารับการปรึกษา"}
              </button>

              <button
                type="button"
                className="w-full rounded-2xl border border-[#d88d80]/50 bg-white px-4 py-3 font-medium text-[#b46e44] transition hover:bg-[#fff7f2]"
              >
                <span className="inline-flex items-center gap-2">
                  <Stethoscope size={16} />
                  รับการปรึกษาออนไลน์
                </span>
              </button>
            </form>
          </InfoCard>

          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">รายการนัดหมาย</h3>

              {loading ? (
                <p className="text-sm text-slate-500">กำลังโหลดข้อมูลการนัดหมาย...</p>
              ) : upcomingAppointments.length === 0 ? (
                <p className="text-sm text-slate-500">ยังไม่มีรายการนัดหมาย</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white/80 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{formatTypeLabel(item.type)}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatThaiDateTime(item.appointment_date)}
                          </p>
                          {item.note ? (
                            <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                          ) : null}
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {formatStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InfoCard>
        </main>

        <BottomNav variant="soft" />
      </div>
    </MobileShell>
  );
}

