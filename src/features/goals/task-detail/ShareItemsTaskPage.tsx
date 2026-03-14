import { Gift, HandHeart } from "lucide-react";
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
  parseSocialTaskNote,
  syncSocialActivityGoal,
} from "./socialTaskShared";

type ShareHistoryItem = {
  id: string;
  date: string;
  count: number;
  score: number;
  point: number;
  achieved: boolean;
};

export default function ShareItemsTaskPage() {
  const userId = getCurrentUserId();

  const [shareCount, setShareCount] = useState(0);
  const [history, setHistory] = useState<ShareHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const activityKey = "workplace-relationship";
  const taskKey = "share-items-with-colleagues";

  const todayScore = useMemo(() => (shareCount > 0 ? 100 : 0), [shareCount]);

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

      const response = await logsService.listSocialTaskLogs(userId ?? undefined, {
        activity: activityKey,
        task: taskKey,
        limit: 90,
      });
      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถโหลดข้อมูลบันทึกได้");
      }

      const byDate = new Map<string, ShareHistoryItem>();
      [...(response.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .forEach((log) => {
          const parsed = parseSocialTaskNote(String(log.note));
          if (!parsed || parsed.activity !== activityKey || parsed.task !== taskKey) return;

          const count = Math.max(0, Math.round(getNumber(parsed.payload.share_count, 0)));
          const achieved = getBoolean(parsed.payload.achieved, count > 0 || parsed.score > 0);
          const point = getNumber(parsed.payload.point, achieved ? 1 : 0);

          if (byDate.has(log.log_date)) return;

          byDate.set(log.log_date, {
            id: log.id,
            date: log.log_date,
            count,
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
        setShareCount(nextHistory[0].count);
        return;
      }

      setShareCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
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

      const score = shareCount > 0 ? 100 : 0;
      const point = shareCount > 0 ? 1 : 0;
      const achieved = point > 0;

      const response = await logsService.createDailyLog({
        user_id: userId ?? undefined,
        log_date: getTodayDate(),
        mood: "task-workplace-share-items",
        energy: Math.max(1, Math.min(5, shareCount > 0 ? 3 + Math.min(shareCount, 2) : 1)),
        stress: achieved ? 1 : 4,
        note: JSON.stringify({
          entry_type: "social_task",
          category: "social",
          activity: activityKey,
          task: taskKey,
          score,
          payload: {
            share_count: shareCount,
            point,
            achieved,
            is_daily: true,
          },
        }),
      });

      if (!response.success) {
        throw new Error(response.error || "ไม่สามารถบันทึกข้อมูลได้");
      }

      await syncSocialActivityGoal(activityKey, userId ?? undefined);
      await loadContext();

      setSuccessMessage(
        achieved
          ? `บันทึกสำเร็จ วันนี้แบ่งปัน ${shareCount} ครั้ง ได้ +1 คะแนน`
          : "บันทึกสำเร็จ วันนี้ยังไม่มีจำนวนครั้งที่บันทึก"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <AppHeader title="แบ่งปันสิ่งของให้เพื่อนร่วมงาน" showBack showBell variant="soft" />

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
                <h2 className="text-lg font-semibold text-slate-900">บันทึกการแบ่งปันวันนี้</h2>
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

            <div className="mt-4 rounded-2xl bg-white px-4 py-4">
              <p className="text-center text-xs text-slate-500">จำนวนครั้งที่แบ่งปันให้เพื่อนร่วมงานวันนี้</p>
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShareCount((prev) => Math.max(prev - 1, 0))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-semibold text-slate-700"
                  aria-label="ลดจำนวนครั้ง"
                >
                  -
                </button>

                <input
                  type="number"
                  min={0}
                  max={30}
                  value={shareCount}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (!Number.isFinite(next)) return;
                    setShareCount(Math.max(0, Math.round(next)));
                  }}
                  className="w-28 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2 text-center text-3xl font-bold text-slate-900"
                />

                <button
                  type="button"
                  onClick={() => setShareCount((prev) => Math.min(prev + 1, 30))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-semibold text-slate-700"
                  aria-label="เพิ่มจำนวนครั้ง"
                >
                  +
                </button>
              </div>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {[1, 2, 3, 5].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setShareCount(preset)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      shareCount === preset
                        ? "border-[#d88d80] bg-[#fff1e9] text-[#b46e44]"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {preset} ครั้ง
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f5fbff] px-3 py-1.5 text-xs font-medium text-[#2e6a8b]">
              <HandHeart size={14} />
              วันนี้แบ่งปันแล้ว {shareCount} ครั้ง
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
            {saving ? "กำลังบันทึก..." : "บันทึกการแบ่งปันวันนี้"}
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
                    <p className="mt-1 text-xs text-slate-600">แบ่งปัน {item.count} ครั้ง</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff8dd] px-3 py-1.5 text-xs font-medium text-[#966300]">
            <Gift size={14} />
            บันทึกรายวันเพื่อสะสมคะแนนต่อเนื่อง
          </div>
        </main>
      </div>
    </MobileShell>
  );
}
