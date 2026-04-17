import { Check, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import WeekNavBar from "../../../components/ui/WeekNavBar";
import { logsService } from "../../../services/logs.service";
import type { DailyLog } from "../../../types/models";
import { getCurrentUserId } from "../../../utils/authSession";
import {
  addDays,
  getStartOfWeek,
  isCurrentWeek,
  toDateKey,
} from "../../../utils/weekPeriod";
import {
  getLogTimestamp,
  parsePersonalBalanceDailyNote,
  syncPersonalLifeBalanceGoal,
} from "../task-detail/balanceTaskShared";
import { PERSONAL_LIFE_BALANCE_TASKS } from "../tasks/personalLifeBalanceTasks";

const PRESET_SLUGS = new Set(PERSONAL_LIFE_BALANCE_TASKS.map((t) => t.slug));
const MIN_ACTIVITIES_FOR_FULL_SCORE = 3;
const DAY_SHORT: Record<number, string> = {
  0: "อา",
  1: "จ",
  2: "อ",
  3: "พ",
  4: "พฤ",
  5: "ศ",
  6: "ส",
};

function calcScore(itemCount: number) {
  return Math.min(
    Math.round((itemCount / MIN_ACTIVITIES_FOR_FULL_SCORE) * 100),
    100
  );
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

type DayData = {
  items: string[];
  score: number;
};

function processLogs(
  logs: DailyLog[],
  startKey: string,
  endKey: string
): Record<string, DayData> {
  const latestByDate = new Map<
    string,
    { items: string[]; score: number; ts: number }
  >();

  for (const log of logs) {
    const dateKey = String(log.log_date ?? "").slice(0, 10);
    if (!dateKey || dateKey < startKey || dateKey > endKey) continue;
    const parsed = parsePersonalBalanceDailyNote(String(log.note ?? ""));
    if (!parsed) continue;
    const ts = getLogTimestamp(log);
    const existing = latestByDate.get(dateKey);
    if (!existing || ts > existing.ts) {
      latestByDate.set(dateKey, { items: parsed.items, score: parsed.score, ts });
    }
  }

  const result: Record<string, DayData> = {};
  for (const [dateKey, data] of latestByDate.entries()) {
    result[dateKey] = { items: data.items, score: data.score };
  }
  return result;
}

export default function PersonalLifeBalancePage() {
  const userId = getCurrentUserId();
  const todayKey = useMemo(getTodayKey, []);

  const [weekStartDate, setWeekStartDate] = useState(() => {
    const saved = sessionStorage.getItem("goals-week");
    if (saved) return getStartOfWeek(new Date(saved + "T00:00:00"));
    return getStartOfWeek(new Date());
  });
  const weekStartKey = toDateKey(weekStartDate);
  const weekEndDate = addDays(weekStartDate, 6);
  const isViewingCurrentWeek = isCurrentWeek(weekStartKey);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i)),
    [weekStartDate]
  );

  const minWeekKey = toDateKey(
    getStartOfWeek(new Date(new Date().getFullYear(), 3, 1))
  );

  const [weekData, setWeekData] = useState<Record<string, DayData>>({});
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const customItems = useMemo(
    () => checkedItems.filter((item) => !PRESET_SLUGS.has(item)),
    [checkedItems]
  );

  const todayScore = calcScore(checkedItems.length);

  // ── Load ───────────────────────────────────────────────────────────────────

  const loadWeek = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);
      try {
        const res = await logsService.listBalanceTaskLogs(
          userId ?? undefined,
          { activity: "personal-life-balance", limit: 500, forceRefresh }
        );
        if (!res.success)
          throw new Error(res.error || "โหลดข้อมูลไม่ได้");

        const startKey = toDateKey(weekStartDate);
        const endKey = toDateKey(weekEndDate);
        const data = processLogs(res.data ?? [], startKey, endKey);
        setWeekData(data);

        if (isViewingCurrentWeek) {
          const todayData = data[todayKey];
          setCheckedItems(todayData ? todayData.items : []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStartKey, userId]
  );

  useEffect(() => {
    void loadWeek();
  }, [loadWeek]);

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const score = calcScore(checkedItems.length);
      const res = await logsService.createDailyLog({
        user_id: userId ?? undefined,
        log_date: todayKey,
        mood: "personal-life-balance-daily",
        energy: Math.max(1, Math.min(5, 1 + Math.round(checkedItems.length * 4 / 3))),
        stress: score >= 67 ? 1 : 2,
        note: JSON.stringify({
          entry_type: "personal_balance_daily",
          category: "balance",
          activity: "personal-life-balance",
          date: todayKey,
          week_key: weekStartKey,
          items: checkedItems,
          score,
        }),
      });
      if (!res.success) throw new Error(res.error || "บันทึกไม่ได้");

      setWeekData((prev) => ({
        ...prev,
        [todayKey]: { items: checkedItems, score },
      }));

      void syncPersonalLifeBalanceGoal(userId ?? undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  // ── Chip helpers ───────────────────────────────────────────────────────────

  function togglePreset(slug: string) {
    setCheckedItems((prev) =>
      prev.includes(slug) ? prev.filter((i) => i !== slug) : [...prev, slug]
    );
  }

  function addCustomItem() {
    const text = customText.trim();
    if (!text) return;
    if (!checkedItems.includes(text)) {
      setCheckedItems((prev) => [...prev, text]);
    }
    setCustomText("");
    setShowCustomInput(false);
  }

  function removeCustomItem(text: string) {
    setCheckedItems((prev) => prev.filter((i) => i !== text));
  }

  const todaySaved = Boolean(weekData[todayKey]);
  const isTodayEdited =
    todaySaved &&
    JSON.stringify([...checkedItems].sort()) !==
      JSON.stringify([...(weekData[todayKey]?.items ?? [])].sort());

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <MobileShell>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#f0fdf7_0%,#f7fdff_42%,#fffbf0_100%)]">
        <AppHeader
          title="สมดุลระหว่างชีวิตส่วนตัว"
          showBack
          showBell
          variant="soft"
          subtitle="บันทึกสิ่งที่ทำเพื่อตัวเองในวันนี้"
        />
        <WeekNavBar
          weekStartDate={weekStartDate}
          weekEndDate={weekEndDate}
          isCurrentWeek={isViewingCurrentWeek}
          isPrevDisabled={weekStartKey <= minWeekKey}
          onPrev={() => setWeekStartDate((prev) => addDays(prev, -7))}
          onNext={() => {
            if (!isViewingCurrentWeek)
              setWeekStartDate((prev) => addDays(prev, 7));
          }}
        />

        <main className="space-y-4 px-4 py-4">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* ── Today chip card (current week only) ───────────────────────── */}
          {isViewingCurrentWeek && (
            <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    วันนี้
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(todayKey + "T00:00:00").toLocaleDateString(
                      "th-TH",
                      { weekday: "long", day: "numeric", month: "long" }
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-2xl font-extrabold ${
                      todayScore >= 100
                        ? "text-emerald-500"
                        : todayScore > 0
                          ? "text-[#7fc3a0]"
                          : "text-slate-300"
                    }`}
                  >
                    {todayScore}%
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {checkedItems.length} กิจกรรม
                  </p>
                </div>
              </div>

              {/* Chips */}
              <div className="px-4 pb-1 pt-4">
                <p className="mb-3 text-xs font-semibold text-slate-500">
                  เลือกกิจกรรมที่ทำวันนี้:
                </p>
                <div className="flex flex-wrap gap-2">
                  {PERSONAL_LIFE_BALANCE_TASKS.map((task) => {
                    const active = checkedItems.includes(task.slug);
                    return (
                      <button
                        key={task.slug}
                        type="button"
                        onClick={() => togglePreset(task.slug)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          active
                            ? "border-[#6dbf90] bg-[#e8f7ef] text-[#1f6644]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {active && <Check size={11} strokeWidth={3} />}
                        {task.label}
                      </button>
                    );
                  })}

                  {/* Custom chips */}
                  {customItems.map((text) => (
                    <span
                      key={text}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#6dbf90] bg-[#e8f7ef] px-3 py-1.5 text-xs font-medium text-[#1f6644]"
                    >
                      <Check size={11} strokeWidth={3} />
                      {text}
                      <button
                        type="button"
                        onClick={() => removeCustomItem(text)}
                        className="ml-0.5 opacity-60 hover:opacity-100"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}

                  {/* Add custom button */}
                  {!showCustomInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(true);
                        setTimeout(() => customInputRef.current?.focus(), 50);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-400 hover:text-slate-500"
                    >
                      <Plus size={11} />
                      เพิ่มกิจกรรม
                    </button>
                  )}
                </div>

                {/* Custom input */}
                {showCustomInput && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      ref={customInputRef}
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addCustomItem();
                        if (e.key === "Escape") {
                          setShowCustomInput(false);
                          setCustomText("");
                        }
                      }}
                      placeholder="ชื่อกิจกรรม..."
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6dbf90] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomItem}
                      className="rounded-2xl bg-[#6dbf90] px-4 py-2 text-xs font-semibold text-white"
                    >
                      เพิ่ม
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomText("");
                      }}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500"
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}
              </div>

              {/* Score bar */}
              <div className="px-4 pb-3 pt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7fc3a0] to-[#6dbf90] transition-all duration-300"
                    style={{ width: `${todayScore}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">
                  {checkedItems.length === 0
                    ? "เลือกอย่างน้อย 1 กิจกรรม"
                    : checkedItems.length >= MIN_ACTIVITIES_FOR_FULL_SCORE
                      ? "ยอดเยี่ยม! ทำครบ 3 กิจกรรมขึ้นไปแล้ว"
                      : `อีก ${MIN_ACTIVITIES_FOR_FULL_SCORE - checkedItems.length} กิจกรรมจะครบ 100%`}
                </p>
              </div>

              {/* Save button */}
              <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || loading || checkedItems.length === 0}
                  className={`w-full rounded-2xl py-3 text-sm font-semibold text-white transition-all ${
                    saving || loading || checkedItems.length === 0
                      ? "bg-slate-300"
                      : todaySaved && !isTodayEdited
                        ? "bg-[#6dbf90]"
                        : "bg-[#3a9e6f] active:scale-95"
                  }`}
                >
                  {saving
                    ? "กำลังบันทึก..."
                    : loading
                      ? "กำลังโหลด..."
                      : todaySaved && !isTodayEdited
                        ? "✓ บันทึกแล้ว"
                        : "บันทึกวันนี้"}
                </button>
              </div>
            </section>
          )}

          {/* ── Week overview ──────────────────────────────────────────────── */}
          <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_14px_32px_rgba(31,47,61,0.08)] backdrop-blur">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">
                {isViewingCurrentWeek ? "สัปดาห์นี้" : "สัปดาห์ที่เลือก"}
              </p>
              {(() => {
                const logged = weekDays.filter(
                  (d) => weekData[toDateKey(d)]
                ).length;
                const avgScore =
                  logged === 0
                    ? 0
                    : Math.round(
                        weekDays
                          .filter((d) => weekData[toDateKey(d)])
                          .reduce(
                            (sum, d) =>
                              sum + (weekData[toDateKey(d)]?.score ?? 0),
                            0
                          ) / logged
                      );
                return (
                  <p className="mt-0.5 text-sm font-bold text-slate-800">
                    {loading
                      ? "กำลังโหลด..."
                      : logged === 0
                        ? "ยังไม่มีการบันทึก"
                        : `บันทึกแล้ว ${logged} วัน · เฉลี่ย ${avgScore}%`}
                  </p>
                );
              })()}
            </div>

            <div className="divide-y divide-slate-50">
              {weekDays.map((day) => {
                const dayKey = toDateKey(day);
                const isToday = dayKey === todayKey;
                const isPast = dayKey < todayKey;
                const data = weekData[dayKey];
                const dayOfWeek = day.getDay();

                return (
                  <div
                    key={dayKey}
                    className={`flex items-start gap-3 px-4 py-3 ${
                      isToday && isViewingCurrentWeek
                        ? "bg-[#f5fdf9]"
                        : ""
                    }`}
                  >
                    {/* Day label */}
                    <div className="w-10 shrink-0 text-center">
                      <p
                        className={`text-[10px] font-semibold ${
                          isToday && isViewingCurrentWeek
                            ? "text-[#3a9e6f]"
                            : "text-slate-400"
                        }`}
                      >
                        {DAY_SHORT[dayOfWeek]}
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          isToday && isViewingCurrentWeek
                            ? "text-[#3a9e6f]"
                            : "text-slate-700"
                        }`}
                      >
                        {formatDayLabel(day).split(" ")[0]}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {isToday && isViewingCurrentWeek ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#e8f7ef] px-2 py-0.5 text-[10px] font-semibold text-[#1f6644]">
                            วันนี้
                          </span>
                          {data && (
                            <span className="text-xs text-slate-500">
                              {data.items.length} กิจกรรม · {data.score}%
                            </span>
                          )}
                        </div>
                      ) : data ? (
                        <>
                          <div className="flex flex-wrap gap-1">
                            {data.items.slice(0, 4).map((item) => {
                              const preset = PERSONAL_LIFE_BALANCE_TASKS.find(
                                (t) => t.slug === item
                              );
                              return (
                                <span
                                  key={item}
                                  className="rounded-full bg-[#e8f7ef] px-2 py-0.5 text-[10px] font-medium text-[#2f7b56]"
                                >
                                  {preset ? preset.label : item}
                                </span>
                              );
                            })}
                            {data.items.length > 4 && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                                +{data.items.length - 4}
                              </span>
                            )}
                          </div>
                        </>
                      ) : isPast || (!isViewingCurrentWeek) ? (
                        <p className="text-xs text-slate-400">ไม่ได้บันทึก</p>
                      ) : (
                        <p className="text-xs text-slate-300">ยังมาไม่ถึง</p>
                      )}
                    </div>

                    {/* Score badge */}
                    {data && !(isToday && isViewingCurrentWeek) && (
                      <span
                        className={`shrink-0 text-xs font-bold ${
                          data.score >= 100
                            ? "text-emerald-500"
                            : data.score > 0
                              ? "text-[#7fc3a0]"
                              : "text-slate-400"
                        }`}
                      >
                        {data.score}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </MobileShell>
  );
}
