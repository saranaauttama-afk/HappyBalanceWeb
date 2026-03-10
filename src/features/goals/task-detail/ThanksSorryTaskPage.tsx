import { MessageSquareHeart, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { logsService } from "../../../services/logs.service";
import { getCurrentUserId } from "../../../utils/authSession";
import {
  formatThaiDate,
  getBoolean,
  getLogTimestamp,
  getNumber,
  getTodayDate,
  parseBalanceTaskNote,
  syncBalanceActivityGoal,
} from "./balanceTaskShared";

type ThanksSorryHistoryItem = {
  id: string;
  date: string;
  thanksCount: number;
  sorryCount: number;
  totalCount: number;
  score: number;
  point: number;
  achieved: boolean;
};

export default function ThanksSorryTaskPage() {
  const userId = getCurrentUserId();

  const [thanksCount, setThanksCount] = useState(0);
  const [sorryCount, setSorryCount] = useState(0);
  const [history, setHistory] = useState<ThanksSorryHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const activityKey = "family-social-balance";
  const taskKey = "say-thanks-or-sorry";

  const totalCount = thanksCount + sorryCount;
  const todayScore = useMemo(() => (totalCount > 0 ? 100 : 0), [totalCount]);

  const monthlyPoints = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    return history
      .filter((item) => item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + item.point, 0);
  }, [history]);

  const loadContext = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await logsService.listDailyLogs(userId ?? undefined);
      if (!response.success) {
        throw new Error(response.error || "Could not load daily logs");
      }

      const byDate = new Map<string, ThanksSorryHistoryItem>();
      [...(response.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .forEach((log) => {
          const parsed = parseBalanceTaskNote(String(log.note));
          if (!parsed || parsed.activity !== activityKey || parsed.task !== taskKey) return;

          const thanks = Math.max(0, Math.round(getNumber(parsed.payload.thanks_count, 0)));
          const sorry = Math.max(0, Math.round(getNumber(parsed.payload.sorry_count, 0)));
          const total = Math.max(0, Math.round(getNumber(parsed.payload.total_count, thanks + sorry)));
          const achieved = getBoolean(parsed.payload.achieved, total > 0 || parsed.score > 0);
          const point = getNumber(parsed.payload.point, achieved ? 1 : 0);

          if (byDate.has(log.log_date)) return;

          byDate.set(log.log_date, {
            id: log.id,
            date: log.log_date,
            thanksCount: thanks,
            sorryCount: sorry,
            totalCount: total,
            score: parsed.score,
            point: point > 0 ? 1 : 0,
            achieved,
          });
        });

      const nextHistory = Array.from(byDate.values())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);

      setHistory(nextHistory);

      if (nextHistory.length > 0 && nextHistory[0].date === getTodayDate()) {
        setThanksCount(nextHistory[0].thanksCount);
        setSorryCount(nextHistory[0].sorryCount);
        return;
      }

      setThanksCount(0);
      setSorryCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  async function handleSave() {
    setError(null);
    setSuccessMessage("");

    try {
      setSaving(true);

      const score = totalCount > 0 ? 100 : 0;
      const point = totalCount > 0 ? 1 : 0;
      const achieved = point > 0;

      const response = await logsService.createDailyLog({
        user_id: userId ?? undefined,
        log_date: getTodayDate(),
        mood: "task-family-social-thanks-sorry",
        energy: Math.max(1, Math.min(5, totalCount > 0 ? 3 + Math.min(totalCount, 2) : 1)),
        stress: achieved ? 1 : 4,
        note: JSON.stringify({
          entry_type: "balance_task",
          category: "balance",
          activity: activityKey,
          task: taskKey,
          score,
          payload: {
            thanks_count: thanksCount,
            sorry_count: sorryCount,
            total_count: totalCount,
            point,
            achieved,
            is_daily: true,
          },
        }),
      });

      if (!response.success) {
        throw new Error(response.error || "Could not save task");
      }

      await syncBalanceActivityGoal(activityKey, userId ?? undefined);
      await loadContext();

      setSuccessMessage(
        achieved
          ? `บันทึกสำเร็จ วันนี้พูดขอบคุณ/ขอโทษรวม ${totalCount} ครั้ง ได้ +1 คะแนน`
          : "บันทึกสำเร็จ วันนี้ยังไม่มีจำนวนครั้งที่บันทึก"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <AppHeader title="พูดขอบคุณ หรือขอโทษผู้อื่น" showBack showBell variant="soft" />

        <main className="space-y-4 px-4 py-4">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">บันทึกคำพูดเชิงบวกวันนี้</h2>
                <p className="text-sm text-slate-500">หัวข้อนี้เป็นรายวัน เก็บจำนวนครั้งในแต่ละวัน</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  todayScore > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {todayScore > 0 ? "วันนี้ +1 คะแนน" : "วันนี้ 0 คะแนน"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">พูดขอบคุณ</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setThanksCount((prev) => Math.max(prev - 1, 0))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700"
                    aria-label="ลดจำนวนขอบคุณ"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-slate-900">{thanksCount}</span>
                  <button
                    type="button"
                    onClick={() => setThanksCount((prev) => Math.min(prev + 1, 30))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700"
                    aria-label="เพิ่มจำนวนขอบคุณ"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">พูดขอโทษ</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSorryCount((prev) => Math.max(prev - 1, 0))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700"
                    aria-label="ลดจำนวนขอโทษ"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-slate-900">{sorryCount}</span>
                  <button
                    type="button"
                    onClick={() => setSorryCount((prev) => Math.min(prev + 1, 30))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700"
                    aria-label="เพิ่มจำนวนขอโทษ"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setThanksCount(preset);
                    setSorryCount(0);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  ขอบคุณ {preset} ครั้ง
                </button>
              ))}
              {[1, 2].map((preset) => (
                <button
                  key={`sorry-${preset}`}
                  type="button"
                  onClick={() => {
                    setThanksCount(0);
                    setSorryCount(preset);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  ขอโทษ {preset} ครั้ง
                </button>
              ))}
            </div>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f5fbff] px-3 py-1.5 text-xs font-medium text-[#2e6a8b]">
              <MessageSquareHeart size={14} />
              วันนี้รวม {totalCount} ครั้ง (ขอบคุณ {thanksCount} / ขอโทษ {sorryCount})
            </div>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#fff8dd] px-3 py-1.5 text-xs font-medium text-[#966300]">
              <Sparkles size={14} />
              ทำได้อย่างน้อย 1 ครั้ง จะได้ 1 คะแนน
            </div>
          </section>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || loading}
            className={`w-full rounded-2xl py-4 font-semibold text-white ${
              saving || loading ? "bg-slate-400" : "bg-[#c6968c]"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกวันนี้"}
          </button>

          <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900">ประวัติการบันทึกย้อนหลัง</h3>
              <span className="rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                เดือนนี้ได้ {monthlyPoints} คะแนน
              </span>
            </div>

            {loading ? (
              <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูลบันทึก...</p>
            ) : history.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการบันทึกไว้</p>
            ) : (
              <div className="mt-3 space-y-2">
                {history.map((item) => (
                  <div
                    key={`${item.date}-${item.id}`}
                    className={`rounded-2xl border px-3 py-3 ${
                      item.achieved ? "border-emerald-200 bg-emerald-50/70" : "border-rose-200 bg-rose-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{formatThaiDate(item.date)}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.achieved ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {item.point > 0 ? `+${item.point} คะแนน` : "0 คะแนน"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      ขอบคุณ {item.thanksCount} ครั้ง / ขอโทษ {item.sorryCount} ครั้ง
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </MobileShell>
  );
}
