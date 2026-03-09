import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { goalsService } from "../../../services/goals.service";
import { logsService } from "../../../services/logs.service";
import { profileService } from "../../../services/profile.service";
import type { DailyLog, Goal } from "../../../types/models";
import { getCurrentUserId } from "../../../utils/authSession";
import { REST_TASKS, type TaskConfig } from "../tasks/restTasks";

type TaskValue = number | boolean | null;

type RestTaskNotePayload = {
  entry_type: "rest_task";
  category: "physical";
  activity: "rest";
  task: string;
  score: number;
  payload: Record<string, unknown>;
};

type ParsedRestTaskNote = {
  task: string;
  score: number;
  payload: Record<string, unknown>;
};

type SleepHistoryItem = {
  id: string;
  date: string;
  sleptMinutes: number;
  targetMinutes: number;
  score: number;
  point: number;
  achieved: boolean;
};

type WaterHistoryItem = {
  id: string;
  date: string;
  glasses: number;
  targetGlasses: number;
  score: number;
  point: number;
  achieved: boolean;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function clampHour(value: number) {
  if (value < 0) return 23;
  if (value > 23) return 0;
  return value;
}

function clampMinute(value: number) {
  if (value < 0) return 55;
  if (value > 55) return 0;
  return value;
}

function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
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

function getGoalTimestamp(goal: Goal) {
  const updatedAt = goal.updated_at ? new Date(goal.updated_at).getTime() : Number.NaN;
  if (Number.isFinite(updatedAt)) return updatedAt;

  const createdAt = goal.created_at ? new Date(goal.created_at).getTime() : Number.NaN;
  if (Number.isFinite(createdAt)) return createdAt;

  return 0;
}

function findLatestGoal(goals: Goal[], matcher: (goal: Goal) => boolean) {
  const filtered = goals.filter(matcher);
  if (filtered.length === 0) return null;

  return filtered.sort((a, b) => getGoalTimestamp(b) - getGoalTimestamp(a))[0];
}

function getNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toPositiveNumber(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed;
}

function getBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
}

function parseRestTaskNote(note: string): ParsedRestTaskNote | null {
  if (!note) return null;

  try {
    const parsed = JSON.parse(note) as Partial<RestTaskNotePayload>;

    if (parsed.entry_type !== "rest_task") return null;
    if (parsed.category !== "physical") return null;
    if (parsed.activity !== "rest") return null;
    if (!parsed.task) return null;

    const score = Number(parsed.score);
    if (!Number.isFinite(score)) return null;

    return {
      task: parsed.task,
      score: Math.max(0, Math.min(100, Math.round(score))),
      payload:
        parsed.payload && typeof parsed.payload === "object"
          ? (parsed.payload as Record<string, unknown>)
          : {},
    };
  } catch {
    return null;
  }
}

function minutesToText(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${pad(hour)}:${pad(minute)}`;
}

function formatThaiDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function computeSleepScore(sleptMinutes: number, targetMinutes: number) {
  if (targetMinutes <= 0) return 0;
  return sleptMinutes >= targetMinutes ? 100 : 0;
}

function computeSleepPoint(sleptMinutes: number, targetMinutes: number) {
  if (targetMinutes <= 0) return 0;
  return sleptMinutes >= targetMinutes ? 1 : 0;
}

function computeWaterScore(glasses: number, targetGlasses: number) {
  if (targetGlasses <= 0) return 0;
  return glasses >= targetGlasses ? 100 : 0;
}

function computeWaterPoint(glasses: number, targetGlasses: number) {
  if (targetGlasses <= 0) return 0;
  return glasses >= targetGlasses ? 1 : 0;
}

function glassesToMl(glasses: number) {
  return glasses * 350;
}

function mlToGlasses(ml: number) {
  if (ml <= 0) return 0;
  return Math.max(1, Math.round(ml / 350));
}

type TimeAdjusterProps = {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

function TimeAdjuster({ value, onIncrease, onDecrease }: TimeAdjusterProps) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={onIncrease} className="rounded px-1 text-xs text-rose-300">
        ^
      </button>
      <span className="min-w-[24px] text-center text-xl font-bold text-slate-900">{pad(value)}</span>
      <button type="button" onClick={onDecrease} className="rounded px-1 text-xs text-rose-300">
        v
      </button>
    </div>
  );
}

export default function ActivityTaskPage() {
  const { category, activity, task } = useParams<{
    category?: string;
    activity?: string;
    task?: string;
  }>();

  const userId = getCurrentUserId();
  const isRestFlow = category === "physical" && activity === "rest";
  const config = REST_TASKS.find((t) => t.slug === task);
  const activeConfig = config ?? REST_TASKS[0];

  const [value, setValue] = useState<TaskValue>(null);
  const [waterCount, setWaterCount] = useState<number>(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [sleepHour, setSleepHour] = useState(8);
  const [sleepMinute, setSleepMinute] = useState(0);
  const [sleepTargetMinutes, setSleepTargetMinutes] = useState(8 * 60);
  const [sleepHistory, setSleepHistory] = useState<SleepHistoryItem[]>([]);
  const [sleepLoading, setSleepLoading] = useState(false);

  const [waterTargetGlasses, setWaterTargetGlasses] = useState(8);
  const [waterTargetMl, setWaterTargetMl] = useState(8 * 350);
  const [waterHistory, setWaterHistory] = useState<WaterHistoryItem[]>([]);
  const [waterLoading, setWaterLoading] = useState(false);
  const [hasLoadedWaterContext, setHasLoadedWaterContext] = useState(false);

  const todaySleepScore = useMemo(() => {
    const sleptMinutes = sleepHour * 60 + sleepMinute;
    return computeSleepScore(sleptMinutes, sleepTargetMinutes);
  }, [sleepHour, sleepMinute, sleepTargetMinutes]);

  const monthlySleepPoints = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    return sleepHistory
      .filter((item) => item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + item.point, 0);
  }, [sleepHistory]);

  const todayWaterScore = useMemo(() => {
    return computeWaterScore(waterCount, waterTargetGlasses);
  }, [waterCount, waterTargetGlasses]);

  const monthlyWaterPoints = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    return waterHistory
      .filter((item) => item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + item.point, 0);
  }, [waterHistory]);

  const isInitialWaterLoading = task === "drink-water" && !hasLoadedWaterContext;

  const loadSleepContext = useCallback(async () => {
    if (!(isRestFlow && task === "sleep")) return;

    try {
      setSleepLoading(true);
      const [goalsResponse, logsResponse] = await Promise.all([
        goalsService.listGoals(userId ?? undefined),
        logsService.listDailyLogs(userId ?? undefined),
      ]);

      if (!goalsResponse.success) {
        throw new Error(goalsResponse.error || "Could not load goals");
      }

      if (!logsResponse.success) {
        throw new Error(logsResponse.error || "Could not load daily logs");
      }

      const goals = goalsResponse.data || [];
      const sleepGoal = findLatestGoal(
        goals,
        (goal) => goal.category === "physical" && goal.activity === "sleep"
      );
      const legacyRestGoal = findLatestGoal(
        goals,
        (goal) =>
          goal.category === "physical" &&
          goal.activity === "rest" &&
          Number(goal.target_value) > 0 &&
          Number(goal.target_value) <= 24
      );
      const selectedGoal = sleepGoal ?? legacyRestGoal;

      const targetMinutes = Math.max(1, Math.round((Number(selectedGoal?.target_value) || 8) * 60));
      setSleepTargetMinutes(targetMinutes);

      const byDate = new Map<string, SleepHistoryItem>();
      [...(logsResponse.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .forEach((log) => {
          const parsed = parseRestTaskNote(String(log.note));
          if (!parsed || parsed.task !== "sleep") return;

          const sleptMinutes = getNumber(parsed.payload.slept_minutes, 0);
          const targetFromLog = getNumber(parsed.payload.target_minutes, targetMinutes);
          const achievedFromLog = getBoolean(parsed.payload.achieved, parsed.score > 0);
          const pointFromLog = getNumber(
            parsed.payload.point,
            achievedFromLog ? 1 : 0
          );

          if (byDate.has(log.log_date)) return;

          byDate.set(log.log_date, {
            id: log.id,
            date: log.log_date,
            sleptMinutes,
            targetMinutes: targetFromLog,
            score: parsed.score,
            point: pointFromLog > 0 ? 1 : 0,
            achieved: achievedFromLog,
          });
        });

      const history = Array.from(byDate.values())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);

      setSleepHistory(history);

      if (history.length > 0 && history[0].date === getTodayDate()) {
        setSleepHour(Math.floor(history[0].sleptMinutes / 60));
        setSleepMinute(history[0].sleptMinutes % 60);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSleepLoading(false);
    }
  }, [isRestFlow, task, userId]);

  const loadWaterContext = useCallback(async () => {
    if (!(isRestFlow && task === "drink-water")) return;

    try {
      setWaterLoading(true);
      const [userResponse, logsResponse] = await Promise.all([
        profileService.getUser(userId ?? undefined),
        logsService.listDailyLogs(userId ?? undefined),
      ]);

      if (!userResponse.success) {
        throw new Error(userResponse.error || "Could not load profile");
      }

      if (!logsResponse.success) {
        throw new Error(logsResponse.error || "Could not load daily logs");
      }

      const targetMlFromProfile = toPositiveNumber(userResponse.data?.water_goal_ml);
      const targetGlasses =
        targetMlFromProfile > 0 ? mlToGlasses(targetMlFromProfile) : 8;

      setWaterTargetMl(targetMlFromProfile > 0 ? targetMlFromProfile : glassesToMl(targetGlasses));
      setWaterTargetGlasses(targetGlasses);

      const byDate = new Map<string, WaterHistoryItem>();
      [...(logsResponse.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .forEach((log) => {
          const parsed = parseRestTaskNote(String(log.note));
          if (!parsed || parsed.task !== "drink-water") return;

          const glasses = getNumber(parsed.payload.glasses, 0);
          const targetFromLog = getNumber(parsed.payload.target_glasses, targetGlasses);
          const achievedFromLog = getBoolean(parsed.payload.achieved, parsed.score > 0);
          const pointFromLog = getNumber(parsed.payload.point, achievedFromLog ? 1 : 0);

          if (byDate.has(log.log_date)) return;

          byDate.set(log.log_date, {
            id: log.id,
            date: log.log_date,
            glasses,
            targetGlasses: Math.max(1, Math.round(targetFromLog)),
            score: parsed.score,
            point: pointFromLog > 0 ? 1 : 0,
            achieved: achievedFromLog,
          });
        });

      const history = Array.from(byDate.values())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);
      setWaterHistory(history);

      if (history.length > 0 && history[0].date === getTodayDate()) {
        setWaterCount(Math.max(0, Math.round(history[0].glasses)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setWaterLoading(false);
      setHasLoadedWaterContext(true);
    }
  }, [isRestFlow, task, userId]);

  useEffect(() => {
    void loadSleepContext();
  }, [loadSleepContext]);

  useEffect(() => {
    void loadWaterContext();
  }, [loadWaterContext]);

  function renderStatusBanner() {
    return (
      <>
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}
      </>
    );
  }

  async function saveTaskLog(input: {
    mood: string;
    energy: number;
    stress: number;
    note: Record<string, unknown>;
  }) {
    const response = await logsService.createDailyLog({
      user_id: userId ?? undefined,
      log_date: getTodayDate(),
      mood: input.mood,
      energy: input.energy,
      stress: input.stress,
      note: JSON.stringify(input.note),
    });

    if (!response.success) {
      throw new Error(response.error || "Could not save task log");
    }
  }

  async function syncRestGoalProgress() {
    const logsResponse = await logsService.listDailyLogs(userId ?? undefined);
    if (!logsResponse.success) {
      throw new Error(logsResponse.error || "Could not load daily logs");
    }

    const latestByTask = new Map<string, number>();
    const sleepByDate = new Map<string, number>();
    const waterByDate = new Map<string, number>();

    [...(logsResponse.data || [])]
      .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
      .forEach((log) => {
        const parsed = parseRestTaskNote(String(log.note));
        if (!parsed) return;

        if (parsed.task === "sleep") {
          if (sleepByDate.has(log.log_date)) return;
          sleepByDate.set(log.log_date, parsed.score);
          return;
        }

        if (parsed.task === "drink-water") {
          if (waterByDate.has(log.log_date)) return;
          waterByDate.set(log.log_date, parsed.score);
          return;
        }

        if (latestByTask.has(parsed.task)) return;
        latestByTask.set(parsed.task, parsed.score);
      });

    const sleepScores = Array.from(sleepByDate.values()).slice(0, 7);
    if (sleepScores.length > 0) {
      const avgSleepScore = Math.round(
        sleepScores.reduce((sum, score) => sum + score, 0) / sleepScores.length
      );
      latestByTask.set("sleep", avgSleepScore);
    }

    const waterScores = Array.from(waterByDate.values()).slice(0, 7);
    if (waterScores.length > 0) {
      const avgWaterScore = Math.round(
        waterScores.reduce((sum, score) => sum + score, 0) / waterScores.length
      );
      latestByTask.set("drink-water", avgWaterScore);
    }

    const scores = Array.from(latestByTask.values());
    const averageScore =
      scores.length === 0
        ? 0
        : Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    const goalsResponse = await goalsService.listGoals(userId ?? undefined);
    if (!goalsResponse.success) {
      throw new Error(goalsResponse.error || "Could not load goals");
    }

    const restGoal = findLatestGoal(
      goalsResponse.data || [],
      (goal) => goal.category === "physical" && goal.activity === "rest"
    );

    if (restGoal) {
      const updateResponse = await goalsService.updateGoal({
        id: restGoal.id,
        current_value: averageScore,
        target_value: 100,
        status: averageScore >= 100 ? "completed" : "active",
      });

      if (!updateResponse.success) {
        throw new Error(updateResponse.error || "Could not update rest goal");
      }
      return;
    }

    const createResponse = await goalsService.createGoal({
      user_id: userId ?? undefined,
      category: "physical",
      activity: "rest",
      current_value: averageScore,
      target_value: 100,
      status: averageScore >= 100 ? "completed" : "active",
    });

    if (!createResponse.success) {
      throw new Error(createResponse.error || "Could not create rest goal");
    }
  }

  function renderGenericInput(currentConfig: TaskConfig) {
    if (currentConfig.type === "number") {
      return (
        <input
          type="number"
          placeholder="Enter a number"
          className="w-full rounded-xl border p-3"
          value={typeof value === "number" ? value : ""}
          onChange={(e) => {
            const nextValue = e.target.value;
            setValue(nextValue === "" ? null : Number(nextValue));
          }}
        />
      );
    }

    return (
      <div className="flex gap-4">
        <button
          type="button"
          className={`flex-1 rounded-xl p-3 ${
            value === true ? "bg-green-400 text-white" : "bg-slate-100"
          }`}
          onClick={() => setValue(true)}
        >
          Done
        </button>

        <button
          type="button"
          className={`flex-1 rounded-xl p-3 ${
            value === false ? "bg-rose-400 text-white" : "bg-slate-100"
          }`}
          onClick={() => setValue(false)}
        >
          Not yet
        </button>
      </div>
    );
  }

  async function handleSave() {
    setError(null);
    setSuccessMessage("");

    try {
      setSaving(true);

      if (task === "sleep") {
        const sleptMinutes = sleepHour * 60 + sleepMinute;
        const score = computeSleepScore(sleptMinutes, sleepTargetMinutes);
        const point = computeSleepPoint(sleptMinutes, sleepTargetMinutes);
        const achieved = point > 0;

        await saveTaskLog({
          mood: "task-sleep",
          energy: Math.round(sleptMinutes / 60),
          stress: achieved ? 1 : 4,
          note: isRestFlow
            ? {
                entry_type: "rest_task",
                category: "physical",
                activity: "rest",
                task: "sleep",
                score,
                payload: {
                  slept_minutes: sleptMinutes,
                  target_minutes: sleepTargetMinutes,
                  point,
                  achieved,
                },
              }
            : {
                task,
                slept_minutes: sleptMinutes,
                target_minutes: sleepTargetMinutes,
                point,
                achieved,
              },
        });

        if (isRestFlow) {
          await syncRestGoalProgress();
          await loadSleepContext();
        }

        setSuccessMessage(
          achieved
            ? "บันทึกการนอนวันนี้สำเร็จ ได้ +1 คะแนน"
            : "บันทึกการนอนวันนี้สำเร็จ แต่ยังไม่ถึงเป้าหมาย"
        );
        return;
      }

      if (task === "drink-water") {
        const score = computeWaterScore(waterCount, waterTargetGlasses);
        const point = computeWaterPoint(waterCount, waterTargetGlasses);
        const achieved = point > 0;

        await saveTaskLog({
          mood: "task-drink-water",
          energy: Math.max(
            1,
            Math.min(5, Math.round((waterCount / Math.max(waterTargetGlasses, 1)) * 5))
          ),
          stress: achieved ? 1 : 4,
          note: isRestFlow
            ? {
                entry_type: "rest_task",
                category: "physical",
                activity: "rest",
                task: "drink-water",
                score,
                payload: {
                  glasses: waterCount,
                  ml: glassesToMl(waterCount),
                  target_glasses: waterTargetGlasses,
                  point,
                  achieved,
                },
              }
            : {
                task,
                glasses: waterCount,
                ml: glassesToMl(waterCount),
                target_glasses: waterTargetGlasses,
                point,
                achieved,
              },
        });

        if (isRestFlow) {
          await syncRestGoalProgress();
          await loadWaterContext();
        }
        setSuccessMessage(
          achieved
            ? "บันทึกการดื่มน้ำวันนี้สำเร็จ ได้ +1 คะแนน"
            : "บันทึกการดื่มน้ำวันนี้สำเร็จ แต่ยังไม่ถึงเป้าหมาย"
        );
        return;
      }

      if (value === null) {
        setError("Please enter or select a value first");
        return;
      }

      const score =
        typeof value === "number"
          ? Math.max(
              0,
              Math.min(100, Math.round((value / Math.max(activeConfig.target ?? 1, 1)) * 100))
            )
          : value
          ? 100
          : 0;

      await saveTaskLog({
        mood: `task-${task ?? "unknown"}`,
        energy: typeof value === "number" ? value : value ? 5 : 1,
        stress: typeof value === "number" ? 1 : value ? 1 : 4,
        note: isRestFlow
          ? {
              entry_type: "rest_task",
              category: "physical",
              activity: "rest",
              task: task ?? "unknown",
              score,
              payload: { value },
            }
          : { task, value },
      });

      if (isRestFlow) {
        await syncRestGoalProgress();
      }
      setSuccessMessage("Task result saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  if (task === "sleep") {
    return (
      <MobileShell>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <AppHeader title="การนอนหลับ" showBack showBell variant="soft" />

          <main className="space-y-4 px-4 py-4">
            {renderStatusBanner()}

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">บันทึกการนอนวันนี้</h2>
                  <p className="text-sm text-slate-500">เป้าหมายรายวัน {minutesToText(sleepTargetMinutes)} ชม.</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    todaySleepScore > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {todaySleepScore > 0 ? "ผ่านเป้าหมาย +1 คะแนน" : "ต่ำกว่าเป้าหมาย 0 คะแนน"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-center text-xs text-slate-500">ชั่วโมง</p>
                  <div className="mt-1 flex items-center gap-2">
                    <TimeAdjuster
                      value={sleepHour}
                      onIncrease={() => setSleepHour((prev) => clampHour(prev + 1))}
                      onDecrease={() => setSleepHour((prev) => clampHour(prev - 1))}
                    />
                  </div>
                </div>

                <span className="text-2xl font-bold text-slate-700">:</span>

                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-center text-xs text-slate-500">นาที</p>
                  <div className="mt-1 flex items-center gap-2">
                    <TimeAdjuster
                      value={sleepMinute}
                      onIncrease={() => setSleepMinute((prev) => clampMinute(prev + 5))}
                      onDecrease={() => setSleepMinute((prev) => clampMinute(prev - 5))}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                เวลาที่บันทึกวันนี้: <span className="font-semibold text-slate-900">{minutesToText(sleepHour * 60 + sleepMinute)} ชม.</span>
              </div>
            </section>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || sleepLoading}
              className={`w-full rounded-2xl py-4 font-semibold text-white ${
                saving || sleepLoading ? "bg-slate-400" : "bg-[#c6968c]"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการนอนวันนี้"}
            </button>

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">ประวัติการบันทึกย้อนหลัง</h3>
                <span className="rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                  เดือนนี้ได้ {monthlySleepPoints} คะแนน
                </span>
              </div>

              {sleepLoading ? (
                <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูลบันทึก...</p>
              ) : sleepHistory.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการนอนที่บันทึกไว้</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {sleepHistory.map((item) => (
                    <div
                      key={`${item.date}-${item.id}`}
                      className={`rounded-2xl border px-3 py-3 ${
                        item.achieved
                          ? "border-emerald-200 bg-emerald-50/70"
                          : "border-rose-200 bg-rose-50/70"
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
                        นอน {minutesToText(item.sleptMinutes)} ชม. / เป้าหมาย {minutesToText(item.targetMinutes)} ชม.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <p className="text-xs text-slate-500">
              ข้อมูลนี้บันทึกในชีต <span className="font-semibold">daily_logs</span> และดึงมาแสดงจาก API ทุกครั้งที่เข้า
              หน้านี้
            </p>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (task === "drink-water") {
    return (
      <MobileShell>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <AppHeader title="การดื่มน้ำ" showBack showBell variant="soft" />

          <main className="space-y-4 px-4 py-4">
            {renderStatusBanner()}

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">บันทึกการดื่มน้ำวันนี้</h2>
                  {isInitialWaterLoading ? (
                    <div className="mt-1 h-5 w-52 animate-pulse rounded-md bg-slate-200" />
                  ) : (
                    <p className="text-sm text-slate-500">
                      เป้าหมายรายวัน {waterTargetGlasses} แก้ว (~{Math.round(waterTargetMl)} ml)
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    isInitialWaterLoading
                      ? "bg-slate-100 text-slate-500"
                      : todayWaterScore > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {isInitialWaterLoading
                    ? "กำลังโหลดเป้าหมาย..."
                    : todayWaterScore > 0
                      ? "ผ่านเป้าหมาย +1 คะแนน"
                      : "ต่ำกว่าเป้าหมาย 0 คะแนน"}
                </span>
              </div>

              <div className="mt-3">
                <Link
                  to="/profile/settings/water-goal"
                  className="inline-flex items-center rounded-full border border-[#c8e2ef] bg-[#eef8fd] px-3 py-1.5 text-xs font-medium text-[#2e6a8b]"
                >
                  ปรับเป้าหมายที่หน้า Settings
                </Link>
              </div>

              <div className="mt-4 rounded-2xl bg-white px-4 py-4">
                {isInitialWaterLoading ? (
                  <div className="space-y-3">
                    <div className="mx-auto h-4 w-36 animate-pulse rounded bg-slate-200" />
                    <div className="mx-auto h-12 w-56 animate-pulse rounded-xl bg-slate-100" />
                    <div className="mx-auto h-8 w-60 animate-pulse rounded-full bg-slate-100" />
                  </div>
                ) : (
                  <>
                    <p className="text-center text-xs text-slate-500">จำนวนแก้วที่ดื่มวันนี้</p>
                    <div className="mt-2 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setWaterCount((prev) => Math.max(prev - 1, 0))}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-semibold text-slate-700"
                        aria-label="ลดจำนวนแก้วน้ำ"
                      >
                        -
                      </button>

                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={waterCount}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          if (!Number.isFinite(next)) return;
                          setWaterCount(Math.max(0, Math.round(next)));
                        }}
                        className="w-28 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2 text-center text-3xl font-bold text-slate-900"
                      />

                      <button
                        type="button"
                        onClick={() => setWaterCount((prev) => Math.min(prev + 1, 40))}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-semibold text-slate-700"
                        aria-label="เพิ่มจำนวนแก้วน้ำ"
                      >
                        +
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {[4, 6, 8, 10, 12].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setWaterCount(preset)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                            waterCount === preset
                              ? "border-[#d88d80] bg-[#fff1e9] text-[#b46e44]"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {preset} แก้ว
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {isInitialWaterLoading ? (
                  <span className="inline-block h-5 w-40 animate-pulse rounded bg-slate-200" />
                ) : (
                  <>
                    วันนี้ดื่มแล้ว <span className="font-semibold text-slate-900">{waterCount} แก้ว</span> (
                    {glassesToMl(waterCount)} ml)
                  </>
                )}
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>ความคืบหน้าต่อเป้าหมาย</span>
                  <span className="font-semibold text-slate-900">
                    {isInitialWaterLoading
                      ? "-"
                      : `${Math.min(100, Math.round((waterCount / Math.max(waterTargetGlasses, 1)) * 100))}%`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#8cc2db] to-[#7fc3a0]"
                    style={{
                      width: isInitialWaterLoading
                        ? "0%"
                        : `${Math.min(100, Math.round((waterCount / Math.max(waterTargetGlasses, 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || waterLoading || isInitialWaterLoading}
              className={`w-full rounded-2xl py-4 font-semibold text-white ${
                saving || waterLoading || isInitialWaterLoading ? "bg-slate-400" : "bg-[#c6968c]"
              }`}
            >
              {saving ? "กำลังบันทึก..." : isInitialWaterLoading ? "กำลังโหลด..." : "บันทึกการดื่มน้ำวันนี้"}
            </button>

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">ประวัติการบันทึกย้อนหลัง</h3>
                <span className="rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                  เดือนนี้ได้ {monthlyWaterPoints} คะแนน
                </span>
              </div>

              {waterLoading || isInitialWaterLoading ? (
                <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูลบันทึก...</p>
              ) : waterHistory.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการดื่มน้ำที่บันทึกไว้</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {waterHistory.map((item) => (
                    <div
                      key={`${item.date}-${item.id}`}
                      className={`rounded-2xl border px-3 py-3 ${
                        item.achieved
                          ? "border-emerald-200 bg-emerald-50/70"
                          : "border-rose-200 bg-rose-50/70"
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
                        ดื่ม {item.glasses} แก้ว ({glassesToMl(item.glasses)} ml) / เป้าหมาย {item.targetGlasses} แก้ว
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <p className="text-xs text-slate-500">
              ข้อมูลนี้บันทึกในชีต <span className="font-semibold">daily_logs</span> และดึงมาแสดงจาก API ทุกครั้งที่เข้า
              หน้านี้
            </p>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (!config) {
    return (
      <MobileShell>
        <AppHeader title="Task not found" showBack />
        <main className="p-6 text-center text-slate-500">Requested task was not found.</main>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <AppHeader title={activeConfig.label} showBack showBell />

      <main className="space-y-6 px-4 py-6">
        {renderStatusBanner()}

        <div className="rounded-2xl bg-white p-6 shadow">{renderGenericInput(activeConfig)}</div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className={`w-full rounded-xl py-3 font-semibold text-white ${
            saving ? "bg-slate-400" : "bg-rose-400"
          }`}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </main>
    </MobileShell>
  );
}
