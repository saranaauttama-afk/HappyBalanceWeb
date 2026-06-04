import { Calendar, ChevronRight, Clock, Filter, RefreshCw, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import BottomNav from "../../../components/layout/BottomNav";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";
import { logsService } from "../../../services/logs.service";
import type { DailyLog } from "../../../types/models";
import { getCurrentUserId } from "../../../utils/authSession";

const CATEGORY_COLORS = {
  physical: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    accent: "from-emerald-100 via-emerald-50 to-white",
  },
  mental: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    accent: "from-sky-100 via-sky-50 to-white",
  },
  social: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    accent: "from-violet-100 via-violet-50 to-white",
  },
  balance: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    accent: "from-amber-100 via-amber-50 to-white",
  },
  daily: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    accent: "from-slate-100 via-slate-50 to-white",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  physical: "กายภาพ",
  mental: "จิตใจ",
  social: "สังคม",
  balance: "สมดุล",
  daily: "บันทึกรายวัน",
};

const cardClassName =
  "border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(31,47,61,0.12)] backdrop-blur";

type FilterType = "all" | "physical" | "mental" | "social" | "balance" | "daily";

export default function LogHistoryPage() {
  const userId = getCurrentUserId();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  async function loadLogs() {
    if (!userId) {
      setError("ไม่พบข้อมูลผู้ใช้");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await logsService.listDailyLogs(userId, {
        limit: 100,
        forceRefresh: true,
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดข้อมูลได้");
      }

      setLogs(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, [userId]);

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    if (filter === "daily") return log.entry_type === "daily_log";
    return log.category === filter;
  });

  const groupedLogs = filteredLogs.reduce(
    (acc, log) => {
      const date = log.log_date || "ไม่ระบุวันที่";
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    },
    {} as Record<string, DailyLog[]>
  );

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  function formatDate(dateString: string) {
    if (!dateString) return "ไม่ระบุวันที่";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
    } catch {
      return dateString;
    }
  }

  function formatTime(dateString: string) {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  function getCategoryColor(category?: string) {
    if (!category) return CATEGORY_COLORS.daily;
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.daily;
  }

  function getCategoryLabel(log: DailyLog) {
    if (log.entry_type === "daily_log") return "บันทึกรายวัน";
    return CATEGORY_LABELS[log.category || ""] || log.category || "อื่นๆ";
  }

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: "all", label: "ทั้งหมด" },
    { value: "physical", label: "กายภาพ" },
    { value: "mental", label: "จิตใจ" },
    { value: "social", label: "สังคม" },
    { value: "balance", label: "สมดุล" },
    { value: "daily", label: "บันทึกรายวัน" },
  ];

  return (
    <MobileShell>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />

        <AppHeader
          title="ประวัติกิจกรรม"
          subtitle="ติดตามความก้าวหน้าของคุณ"
          showBack
          showBell
          variant="soft"
          backTo="/profile"
        />

        <main className="relative z-10 flex-1 space-y-4 px-4 py-6 pb-24">
          {/* Summary Card */}
          <InfoCard className={`${cardClassName} rounded-3xl`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f6f0] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#1f6658]">
                    <TrendingUp size={12} />
                    LOG HISTORY
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    ติดตามความก้าวหน้า
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    บันทึกกิจกรรมและความก้าวหน้าของคุณทั้งหมด
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadLogs()}
                  disabled={loading}
                  className={`rounded-xl bg-white/80 p-2.5 shadow-sm transition hover:shadow-md ${
                    loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  aria-label="รีเฟรชข้อมูล"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white p-3">
                  <p className="text-xs font-medium text-slate-600">จำนวนบันทึก</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">{filteredLogs.length}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-sky-50 to-white p-3">
                  <p className="text-xs font-medium text-slate-600">วันที่บันทึก</p>
                  <p className="mt-1 text-2xl font-bold text-sky-600">{sortedDates.length}</p>
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Filter Section */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-md backdrop-blur transition hover:shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  ตัวกรอง: {filterOptions.find((f) => f.value === filter)?.label}
                </span>
              </div>
              <ChevronRight
                size={16}
                className={`text-slate-400 transition ${showFilterMenu ? "rotate-90" : ""}`}
              />
            </button>

            {showFilterMenu && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-xl backdrop-blur">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFilter(option.value);
                      setShowFilterMenu(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50 ${
                      filter === option.value ? "bg-slate-50" : ""
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        filter === option.value ? "text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {option.label}
                    </span>
                    {filter === option.value && (
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <InfoCard className={cardClassName}>
              <div className="flex items-center justify-center py-8">
                <RefreshCw size={24} className="animate-spin text-slate-400" />
                <span className="ml-3 text-sm text-slate-500">กำลังโหลดข้อมูล...</span>
              </div>
            </InfoCard>
          )}

          {/* Error State */}
          {error && !loading && (
            <InfoCard className={cardClassName}>
              <div className="space-y-3 text-center">
                <p className="text-sm text-rose-600">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadLogs()}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  ลองใหม่
                </button>
              </div>
            </InfoCard>
          )}

          {/* Log List */}
          {!loading && !error && filteredLogs.length === 0 && (
            <InfoCard className={cardClassName}>
              <div className="py-8 text-center">
                <Calendar size={48} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-600">ยังไม่มีบันทึกกิจกรรม</p>
                <p className="mt-1 text-xs text-slate-400">
                  เริ่มบันทึกกิจกรรมเพื่อติดตามความก้าวหน้าของคุณ
                </p>
              </div>
            </InfoCard>
          )}

          {!loading && !error && filteredLogs.length > 0 && (
            <div className="space-y-4">
              {sortedDates.map((date) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <Calendar size={14} className="text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-600">{formatDate(date)}</h3>
                  </div>

                  <div className="space-y-2">
                    {groupedLogs[date].map((log, index) => {
                      const colors = getCategoryColor(log.category);
                      return (
                        <InfoCard
                          key={`${log.id}-${index}`}
                          className={`${cardClassName} relative overflow-hidden rounded-2xl`}
                        >
                          <div
                            className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors.accent}`}
                          />

                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex rounded-full ${colors.bg} px-2.5 py-0.5 text-xs font-semibold ${colors.text}`}
                                  >
                                    {getCategoryLabel(log)}
                                  </span>
                                  {log.created_at && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <Clock size={12} />
                                      {formatTime(log.created_at)}
                                    </span>
                                  )}
                                </div>

                                {log.activity && (
                                  <p className="mt-1.5 text-sm font-medium text-slate-800">
                                    {log.activity}
                                  </p>
                                )}

                                {log.task && (
                                  <p className="mt-0.5 text-xs text-slate-600">{log.task}</p>
                                )}

                                {log.note && (
                                  <p className="mt-2 text-sm leading-6 text-slate-500">{log.note}</p>
                                )}
                              </div>

                              {typeof log.score === "number" && (
                                <div className="flex-shrink-0 text-right">
                                  <p className="text-xs text-slate-500">คะแนน</p>
                                  <p className="text-lg font-bold text-slate-900">{log.score}</p>
                                </div>
                              )}
                            </div>

                            {/* Additional log details */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              {log.mood && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-600">
                                  อารมณ์: {log.mood}
                                </span>
                              )}
                              {typeof log.energy === "number" && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-600">
                                  พลังงาน: {log.energy}
                                </span>
                              )}
                              {typeof log.stress === "number" && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-600">
                                  ความเครียด: {log.stress}
                                </span>
                              )}
                            </div>
                          </div>
                        </InfoCard>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <BottomNav variant="soft" />
      </div>
    </MobileShell>
  );
}
