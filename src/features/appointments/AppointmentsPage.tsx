import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardPenLine,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import Dialog from "../../components/ui/Dialog";
import InfoCard from "../../components/ui/InfoCard";
import { appointmentsService } from "../../services/appointments.service";
import { logsService } from "../../services/logs.service";
import type { Appointment, DailyLog } from "../../types/models";
import { getCurrentUserId } from "../../utils/authSession";
import { isCurrentMonth } from "../../utils/weekPeriod";

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

function parseDateValue(value: string) {
  if (!value) return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const parsed = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getLogTimestamp(log: DailyLog) {
  const createdAt = log.created_at ? new Date(log.created_at).getTime() : Number.NaN;
  if (Number.isFinite(createdAt)) return createdAt;
  const updatedAt = log.updated_at ? new Date(log.updated_at).getTime() : Number.NaN;
  if (Number.isFinite(updatedAt)) return updatedAt;
  const logDate = log.log_date ? new Date(log.log_date).getTime() : Number.NaN;
  if (Number.isFinite(logDate)) return logDate;
  return 0;
}

function isStructuredTaskNote(note: unknown) {
  if (typeof note !== "string") return false;
  const trimmed = note.trim();
  if (!trimmed.startsWith("{")) return false;
  try {
    const parsed = JSON.parse(trimmed) as { entry_type?: unknown; category?: unknown; activity?: unknown; task?: unknown };
    return (
      typeof parsed.entry_type === "string" &&
      typeof parsed.category === "string" &&
      typeof parsed.activity === "string" &&
      typeof parsed.task === "string"
    );
  } catch {
    return false;
  }
}

function getStartOfToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return new Date(next.getFullYear(), next.getMonth(), next.getDate());
}

function getDefaultAppointmentSelection() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setHours(10, 0, 0, 0);
  return { date: toDateInputValue(now), time: toTimeInputValue(now) };
}

function formatThaiDate(date: Date) {
  return date.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}

function formatThaiDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("th-TH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false, hourCycle: "h23",
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

const cardClassName = "border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(31,47,61,0.12)] backdrop-blur";
const quickAppointmentTimes = ["09:00", "13:00", "16:00", "19:00"];
const appointmentHourOptions = Array.from({ length: 24 }, (_, i) => pad(i));
const appointmentMinuteOptions = ["00", "15", "30", "45"];
const weekDayLabels = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

export default function AppointmentsPage() {
  const userId = getCurrentUserId();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [savingDailyLog, setSavingDailyLog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [dailyLogMessage, setDailyLogMessage] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const today = useMemo(() => getStartOfToday(), []);
  const [monthStart, setMonthStart] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);

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
      if (!appointmentsResponse.success) throw new Error(appointmentsResponse.error || "ไม่สามารถโหลดข้อมูลการนัดหมายได้");
      if (!dailyLogsResponse.success) throw new Error(dailyLogsResponse.error || "ไม่สามารถโหลดบันทึกประจำวันได้");
      setAppointments(appointmentsResponse.data || []);
      setDailyLogs(dailyLogsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void loadData(); }, [loadData]);

  // Month-level derived values
  const monthKey = useMemo(
    () => `${monthStart.getFullYear()}-${pad(monthStart.getMonth() + 1)}`,
    [monthStart]
  );
  const isCurrentMonthShown = useMemo(() => isCurrentMonth(monthKey), [monthKey]);
  const monthLabel = useMemo(
    () => monthStart.toLocaleDateString("th-TH", { month: "long", year: "numeric" }),
    [monthStart]
  );
  const monthDays = useMemo(() => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  }, [monthStart]);
  const monthDateKeys = useMemo(() => monthDays.map((d) => toDateKey(d)), [monthDays]);
  // Mon-first offset: Mon=0 … Sun=6
  const monthStartOffset = useMemo(() => {
    const dow = monthStart.getDay();
    return dow === 0 ? 6 : dow - 1;
  }, [monthStart]);

  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const isEditableMonth = useMemo(() => isCurrentMonth(selectedDateKey.slice(0, 7)), [selectedDateKey]);

  const journalLogs = useMemo(
    () => dailyLogs.filter((item) => !isStructuredTaskNote(item.note)),
    [dailyLogs]
  );

  const dailyLogByDate = useMemo(() => {
    const map = new Map<string, DailyLog>();
    [...journalLogs]
      .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
      .forEach((item) => {
        const parsedDate = parseDateValue(String(item.log_date));
        if (!parsedDate) return;
        const key = toDateKey(parsedDate);
        if (map.has(key)) return;
        map.set(key, item);
      });
    return map;
  }, [journalLogs]);

  const selectedDailyLog = useMemo(
    () => dailyLogByDate.get(selectedDateKey) ?? null,
    [dailyLogByDate, selectedDateKey]
  );

  useEffect(() => {
    setDailyNote(String(selectedDailyLog?.note ?? ""));
    setDailyLogMessage("");
  }, [selectedDateKey, selectedDailyLog]);

  const monthlyAppointments = useMemo(() => {
    const keySet = new Set(monthDateKeys);
    return [...appointments]
      .filter((item) => {
        const date = parseDateValue(item.appointment_date);
        if (!date) return false;
        return keySet.has(toDateKey(date));
      })
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
  }, [appointments, monthDateKeys]);

  const appointmentDaySet = useMemo(() => {
    const keys = new Set<string>();
    appointments.forEach((item) => {
      const date = parseDateValue(item.appointment_date);
      if (date) keys.add(toDateKey(date));
    });
    return keys;
  }, [appointments]);

  const dailyLogDaySet = useMemo(() => {
    const keys = new Set<string>();
    monthDateKeys.forEach((key) => { if (dailyLogByDate.has(key)) keys.add(key); });
    return keys;
  }, [dailyLogByDate, monthDateKeys]);

  const monthlyPendingCount = useMemo(
    () => monthlyAppointments.filter((item) => item.status === "pending").length,
    [monthlyAppointments]
  );
  const monthlyJournalCount = dailyLogDaySet.size;

  function handleChangeMonth(offset: number) {
    setMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }

  function handleSelectCurrentMonth() {
    const t = getStartOfToday();
    setMonthStart(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDate(t);
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setMonthStart(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function handleAppointmentHourChange(hour: string) {
    setAppointmentTime(`${hour}:${appointmentMinute}`);
  }

  function handleAppointmentMinuteChange(minute: string) {
    setAppointmentTime(`${appointmentHour}:${minute}`);
  }

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
    const tomorrow = addDays(getStartOfToday(), 1);
    if (parsedDate < tomorrow) {
      setError(`กรุณาเลือกวันนัดหมายล่วงหน้าเท่านั้น (ตั้งแต่ ${formatThaiDate(tomorrow)} เป็นต้นไป)`);
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
      if (!response.success) throw new Error(response.error || "ไม่สามารถส่งคำขอนัดหมายได้");
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
    if (!isEditableMonth) {
      setError("สามารถบันทึกได้เฉพาะเดือนปัจจุบันเท่านั้น");
      return;
    }
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
      if (!response.success) throw new Error(response.error || "ไม่สามารถบันทึกข้อมูลประจำวันได้");
      const logsResponse = userId
        ? await logsService.listDailyLogs(userId)
        : await logsService.listDailyLogs();
      if (!logsResponse.success) throw new Error(logsResponse.error || "บันทึกสำเร็จ แต่โหลดข้อมูลล่าสุดไม่สำเร็จ");
      setDailyLogs(logsResponse.data || []);
      setDailyLogMessage(`บันทึกวันที่ ${formatThaiDate(selectedDate)} เรียบร้อยแล้ว`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSavingDailyLog(false);
    }
  }

  async function handleDeleteAppointment() {
    if (!deleteConfirmId) return;
    setError(null);
    setDeletingId(deleteConfirmId);
    setDeleteConfirmId(null);
    try {
      const response = await appointmentsService.deleteAppointment(deleteConfirmId, userId ?? undefined);
      if (!response.success) throw new Error(response.error || "ไม่สามารถลบรายการนัดหมายได้");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setDeletingId(null);
    }
  }

  const todayKey = toDateKey(today);

  return (
    <MobileShell>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />

        <AppHeader
          title="การนัดหมาย"
          subtitle="ติดตามการนัดหมายและบันทึกรายเดือนในหน้าเดียว"
          showBell
          variant="soft"
        />

        <main className="relative z-10 flex-1 space-y-4 px-4 py-4">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
          ) : null}
          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>
          ) : null}
          {dailyLogMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{dailyLogMessage}</div>
          ) : null}

          {/* Summary strip */}
          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/80 px-2 py-3">
                <p className="text-xs text-slate-500">นัดหมายเดือนนี้</p>
                <p className="text-lg font-semibold text-slate-900">{monthlyAppointments.length}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-2 py-3">
                <p className="text-xs text-amber-700">รอยืนยัน</p>
                <p className="text-lg font-semibold text-amber-800">{monthlyPendingCount}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-2 py-3">
                <p className="text-xs text-emerald-700">บันทึกแล้ว</p>
                <p className="text-lg font-semibold text-emerald-800">{monthlyJournalCount}</p>
              </div>
            </div>
          </InfoCard>

          {/* Monthly calendar */}
          <InfoCard className={`${cardClassName} relative overflow-hidden rounded-3xl`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf4ff] text-[#4e7498]">
                    <CalendarDays size={18} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">ปฏิทินรายเดือน</h2>
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
                    onClick={handleSelectCurrentMonth}
                    disabled={isCurrentMonthShown}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-default disabled:opacity-40"
                  >
                    เดือนนี้
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeMonth(1)}
                    disabled={isCurrentMonthShown}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-default disabled:opacity-30"
                    aria-label="เดือนถัดไป"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Legend */}
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

              {/* Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day-of-week headers */}
                {weekDayLabels.map((label) => (
                  <div key={label} className="py-1 text-center text-[11px] font-medium text-slate-400">
                    {label}
                  </div>
                ))}

                {/* Leading empty cells */}
                {Array.from({ length: monthStartOffset }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {monthDays.map((date) => {
                  const cellKey = toDateKey(date);
                  const hasAppointment = appointmentDaySet.has(cellKey);
                  const hasDailyLog = dailyLogByDate.has(cellKey);
                  const isToday = cellKey === todayKey;
                  const isSelected = cellKey === selectedDateKey;

                  const cellClass = isSelected
                    ? "bg-[#2f556a] text-white"
                    : isToday
                      ? "border border-[#d88d80]/60 bg-[#fff2ee] text-[#a55f4f]"
                      : "bg-white/85 text-slate-700 hover:brightness-95";

                  return (
                    <button
                      key={cellKey}
                      type="button"
                      onClick={() => handleSelectDate(date)}
                      className={`relative rounded-xl pb-3 pt-2 text-center text-sm font-semibold transition ${cellClass}`}
                    >
                      {date.getDate()}
                      {(hasDailyLog || hasAppointment) && (
                        <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-0.5">
                          {hasDailyLog ? (
                            <span className={`h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                          ) : null}
                          {hasAppointment ? (
                            <span className={`h-1 w-1 rounded-full ${isSelected ? "bg-white/80" : "bg-[#d88d80]"}`} />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </InfoCard>

          {/* Daily log */}
          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7ec] text-[#3f7a52]">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">บันทึกประจำวัน</h3>
                  <p className="text-sm text-slate-500">
                    {isEditableMonth
                      ? "เลือกวันจากปฏิทินเพื่อดูย้อนหลังหรือบันทึกเพิ่ม"
                      : "สามารถบันทึกได้เฉพาะเดือนปัจจุบันเท่านั้น"}
                  </p>
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
                disabled={savingDailyLog || !isEditableMonth}
                className={`w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d88d80] ${
                  savingDailyLog || !isEditableMonth
                    ? "cursor-not-allowed bg-slate-50 text-slate-400"
                    : "bg-white"
                }`}
              />

              <button
                type="button"
                onClick={() => void handleSaveDailyLog()}
                disabled={savingDailyLog || !isEditableMonth}
                className={`w-full rounded-2xl px-4 py-3 font-medium text-white transition ${
                  savingDailyLog || !isEditableMonth
                    ? "cursor-not-allowed bg-slate-300"
                    : "bg-[#4c9f7f] shadow-[0_14px_30px_rgba(76,159,127,0.3)] hover:brightness-105"
                }`}
              >
                {savingDailyLog ? "กำลังบันทึก..." : "บันทึกประจำวัน"}
              </button>
            </div>
          </InfoCard>

          {/* Appointment booking form */}
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
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => dateInputRef.current?.showPicker()}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left text-slate-800 outline-none focus:border-[#d88d80]"
                    >
                      <span>
                        {appointmentDate
                          ? formatThaiDate(new Date(appointmentDate + "T00:00:00"))
                          : "เลือกวันที่"}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    </button>
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={appointmentDate}
                      min={toDateInputValue(addDays(getStartOfToday(), 1))}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="pointer-events-none absolute opacity-0"
                      style={{ width: "1px", height: "1px" }}
                    />
                  </div>
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
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>
                    <select
                      value={appointmentMinute}
                      onChange={(e) => handleAppointmentMinuteChange(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#d88d80]"
                    >
                      {appointmentMinuteOptions.map((minute) => (
                        <option key={minute} value={minute}>{minute}</option>
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

          {/* Appointment list */}
          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">รายการนัดหมายในเดือนนี้</h3>
              {loading ? (
                <p className="text-sm text-slate-500">กำลังโหลดข้อมูลการนัดหมาย...</p>
              ) : monthlyAppointments.length === 0 ? (
                <p className="text-sm text-slate-500">ยังไม่มีรายการนัดหมายในเดือนที่เลือก</p>
              ) : (
                <div className="space-y-3">
                  {monthlyAppointments.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white/80 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{formatTypeLabel(item.type)}</p>
                          <p className="mt-1 text-sm text-slate-500">{formatThaiDateTime(item.appointment_date)}</p>
                          {item.note ? (
                            <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(item.status)}`}>
                            {formatStatusLabel(item.status)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            disabled={deletingId === item.id}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
                            title="ลบรายการนัดหมาย"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        </div>
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

      <Dialog
        open={deleteConfirmId !== null}
        title="ลบรายการนัดหมาย"
        description="ต้องการลบรายการนัดหมายนี้ใช่ไหม? ข้อมูลจะหายไปถาวร"
        onClose={() => setDeleteConfirmId(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteConfirmId(null)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteAppointment()}
              className="rounded-2xl bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-105"
            >
              ลบรายการ
            </button>
          </>
        }
      />
    </MobileShell>
  );
}
