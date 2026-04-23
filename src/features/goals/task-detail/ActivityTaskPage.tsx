import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlarmClockCheck,
  BedDouble,
  CircleCheckBig,
  CircleX,
  Droplets,
  Hourglass,
  Monitor,
  MoonStar,
  Sunrise,
} from "lucide-react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { goalsService } from "../../../services/goals.service";
import { logsService } from "../../../services/logs.service";
import { profileService } from "../../../services/profile.service";
import type { DailyLog, Goal } from "../../../types/models";
import { getCurrentUserId } from "../../../utils/authSession";
import { REST_TASKS, type TaskConfig } from "../tasks/restTasks";
import { getScaffoldedActivityConfig } from "../tasks/scaffoldedActivityTasks";
import ScaffoldedTaskPage from "./ScaffoldedTaskPage";
import { addDays, getStartOfWeek, isCurrentWeek, toDateKey } from "../../../utils/weekPeriod";
import WeekNavBar from "../../../components/ui/WeekNavBar";

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

type SleepOnTimeHistoryItem = {
  id: string;
  date: string;
  onTime: boolean;
  score: number;
  point: number;
  achieved: boolean;
};

type AvoidWaterBeforeBedHistoryItem = {
  id: string;
  date: string;
  avoidedLargeWater: boolean;
  score: number;
  point: number;
  achieved: boolean;
};

type NoLongLateNapHistoryItem = {
  id: string;
  date: string;
  noLongLateNap: boolean;
  score: number;
  point: number;
  achieved: boolean;
};

type NoFood4HoursBeforeBedHistoryItem = {
  id: string;
  date: string;
  noFood4HoursBeforeBed: boolean;
  score: number;
  point: number;
  achieved: boolean;
};

type LimitScreenTimeHistoryItem = {
  id: string;
  date: string;
  limitedScreenTime: boolean;
  score: number;
  point: number;
  achieved: boolean;
};

const REST_GENERIC_COPY: Record<
  string,
  {
    eyebrow: string;
    title: string;
    description: string;
    doneLabel: string;
    pendingLabel: string;
    saveLabel: string;
  }
> = {
  "limit-screen-time": {
    eyebrow: "SCREEN TIME",
    title: "คืนนี้ลดเวลาอยู่กับหน้าจอก่อนนอนได้ไหม",
    description: "ตั้งใจให้อยู่กับหน้าจอก่อนนอนไม่เกิน 60 นาที แล้วบันทึกผลของวันนี้",
    doneLabel: "ทำได้แล้ว",
    pendingLabel: "ยังทำไม่ได้",
    saveLabel: "บันทึกผลวันนี้",
  },
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
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
  const scaffoldedConfig =
    category === "physical" || category === "mental"
      ? getScaffoldedActivityConfig(category, activity)
      : undefined;

  if (scaffoldedConfig && task) {
    return <ScaffoldedTaskPage />;
  }

  const userId = getCurrentUserId();
  const isRestFlow = category === "physical" && activity === "rest";
  const [weekStartKey] = useState(() => {
    const saved = sessionStorage.getItem("goals-week");
    if (saved) return saved;
    return toDateKey(getStartOfWeek(new Date()));
  });
  const isViewingCurrentWeek = isCurrentWeek(weekStartKey);
  const weekStartDate = new Date(weekStartKey + "T00:00:00");
  const weekEndDate = addDays(weekStartDate, 6);
  const weekEndKey = toDateKey(weekEndDate);
  const config = REST_TASKS.find((t) => t.slug === task);
  const activeConfig = config ?? REST_TASKS[0];

  const [value, setValue] = useState<TaskValue>(null);
  const [waterCount, setWaterCount] = useState<number>(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [postSaveSyncing, setPostSaveSyncing] = useState(false);

  const [sleepHour, setSleepHour] = useState(8);
  const [sleepMinute, setSleepMinute] = useState(0);
  const [sleepTargetMinutes, setSleepTargetMinutes] = useState(8 * 60);
  const [sleepHistory, setSleepHistory] = useState<SleepHistoryItem[]>([]);
  const [sleepLoading, setSleepLoading] = useState(true);

  const [waterTargetGlasses, setWaterTargetGlasses] = useState(8);
  const [waterTargetMl, setWaterTargetMl] = useState(8 * 350);
  const [waterHistory, setWaterHistory] = useState<WaterHistoryItem[]>([]);
  const [waterLoading, setWaterLoading] = useState(true);
  const [hasLoadedWaterContext, setHasLoadedWaterContext] = useState(false);

  const [sleepOnTimeValue, setSleepOnTimeValue] = useState<boolean | null>(null);
  const [sleepOnTimeHistory, setSleepOnTimeHistory] = useState<SleepOnTimeHistoryItem[]>([]);
  const [sleepOnTimeLoading, setSleepOnTimeLoading] = useState(true);

  const [avoidWaterBeforeBedValue, setAvoidWaterBeforeBedValue] = useState<boolean | null>(null);
  const [avoidWaterBeforeBedHistory, setAvoidWaterBeforeBedHistory] = useState<
    AvoidWaterBeforeBedHistoryItem[]
  >([]);
  const [avoidWaterBeforeBedLoading, setAvoidWaterBeforeBedLoading] = useState(true);

  const [noLongLateNapValue, setNoLongLateNapValue] = useState<boolean | null>(null);
  const [noLongLateNapHistory, setNoLongLateNapHistory] = useState<NoLongLateNapHistoryItem[]>([]);
  const [noLongLateNapLoading, setNoLongLateNapLoading] = useState(true);

  const [noFood4HoursBeforeBedValue, setNoFood4HoursBeforeBedValue] = useState<boolean | null>(null);
  const [noFood4HoursBeforeBedHistory, setNoFood4HoursBeforeBedHistory] = useState<
    NoFood4HoursBeforeBedHistoryItem[]
  >([]);
  const [noFood4HoursBeforeBedLoading, setNoFood4HoursBeforeBedLoading] = useState(true);

  const [screenTimeValue, setScreenTimeValue] = useState<boolean | null>(null);
  const [screenTimeHistory, setScreenTimeHistory] = useState<LimitScreenTimeHistoryItem[]>([]);
  const [screenTimeLoading, setScreenTimeLoading] = useState(true);

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

  const monthlySleepOnTimePoints = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    return sleepOnTimeHistory
      .filter((item) => item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + item.point, 0);
  }, [sleepOnTimeHistory]);

  const monthlyAvoidWaterBeforeBedPoints = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    return avoidWaterBeforeBedHistory
      .filter((item) => item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + item.point, 0);
  }, [avoidWaterBeforeBedHistory]);

  const monthlyNoLongLateNapPoints = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    return noLongLateNapHistory
      .filter((item) => item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + item.point, 0);
  }, [noLongLateNapHistory]);

  const monthlyNoFood4HoursBeforeBedPoints = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    return noFood4HoursBeforeBedHistory
      .filter((item) => item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + item.point, 0);
  }, [noFood4HoursBeforeBedHistory]);

  const monthlyScreenTimePoints = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    return screenTimeHistory
      .filter((item) => item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + item.point, 0);
  }, [screenTimeHistory]);

  const isInitialWaterLoading = task === "drink-water" && !hasLoadedWaterContext;
  const activeTaskLoading = useMemo(() => {
    if (postSaveSyncing) return true;

    switch (task) {
      case "sleep":
        return sleepLoading;
      case "drink-water":
        return isInitialWaterLoading;
      case "sleep-on-time":
        return sleepOnTimeLoading;
      case "avoid-water-before-bed":
        return avoidWaterBeforeBedLoading;
      case "no-long-late-nap":
        return noLongLateNapLoading;
      case "no-food-4-hours-before-bed":
        return noFood4HoursBeforeBedLoading;
      case "limit-screen-time":
        return screenTimeLoading;
      default:
        return false;
    }
  }, [
    postSaveSyncing,
    task,
    sleepLoading,
    isInitialWaterLoading,
    sleepOnTimeLoading,
    avoidWaterBeforeBedLoading,
    noLongLateNapLoading,
    noFood4HoursBeforeBedLoading,
    screenTimeLoading,
  ]);

  const loadSleepContext = useCallback(async () => {
    if (!(isRestFlow && task === "sleep")) return;

    try {
      setSleepLoading(true);
      const [goalsResponse, logsResponse] = await Promise.all([
        goalsService.listGoals(userId ?? undefined),
        logsService.listRestTaskLogs(userId ?? undefined, {
          task: "sleep",
          limit: 30,
        }),
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

      if (history.length > 0 && history[0].date >= weekStartKey && history[0].date <= weekEndKey) {
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
        logsService.listRestTaskLogs(userId ?? undefined, {
          task: "drink-water",
          limit: 30,
        }),
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

      if (history.length > 0 && history[0].date >= weekStartKey && history[0].date <= weekEndKey) {
        setWaterCount(Math.max(0, Math.round(history[0].glasses)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setWaterLoading(false);
      setHasLoadedWaterContext(true);
    }
  }, [isRestFlow, task, userId]);

  const loadSleepOnTimeContext = useCallback(async () => {
    if (!(isRestFlow && task === "sleep-on-time")) return;

    try {
      setSleepOnTimeLoading(true);
      const logsResponse = await logsService.listRestTaskLogs(userId ?? undefined, {
        task: "sleep-on-time",
        limit: 30,
      });

      if (!logsResponse.success) {
        throw new Error(logsResponse.error || "Could not load daily logs");
      }

      const byDate = new Map<string, SleepOnTimeHistoryItem>();
      [...(logsResponse.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .forEach((log) => {
          const parsed = parseRestTaskNote(String(log.note));
          if (!parsed || parsed.task !== "sleep-on-time") return;

          const onTimeFromLog = getBoolean(parsed.payload.on_time, parsed.score > 0);
          const achievedFromLog = getBoolean(parsed.payload.achieved, onTimeFromLog);
          const pointFromLog = getNumber(parsed.payload.point, achievedFromLog ? 1 : 0);

          if (byDate.has(log.log_date)) return;

          byDate.set(log.log_date, {
            id: log.id,
            date: log.log_date,
            onTime: onTimeFromLog,
            score: parsed.score,
            point: pointFromLog > 0 ? 1 : 0,
            achieved: achievedFromLog,
          });
        });

      const history = Array.from(byDate.values())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);
      setSleepOnTimeHistory(history);

      if (history.length > 0 && history[0].date >= weekStartKey && history[0].date <= weekEndKey && history[0].onTime) {
        setSleepOnTimeValue(true);
        return;
      }

      setSleepOnTimeValue(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSleepOnTimeLoading(false);
    }
  }, [isRestFlow, task, userId]);

  const loadAvoidWaterBeforeBedContext = useCallback(async () => {
    if (!(isRestFlow && task === "avoid-water-before-bed")) return;

    try {
      setAvoidWaterBeforeBedLoading(true);
      const logsResponse = await logsService.listRestTaskLogs(userId ?? undefined, {
        task: "avoid-water-before-bed",
        limit: 30,
      });

      if (!logsResponse.success) {
        throw new Error(logsResponse.error || "Could not load daily logs");
      }

      const byDate = new Map<string, AvoidWaterBeforeBedHistoryItem>();
      [...(logsResponse.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .forEach((log) => {
          const parsed = parseRestTaskNote(String(log.note));
          if (!parsed || parsed.task !== "avoid-water-before-bed") return;

          const avoidedFromLog = getBoolean(
            parsed.payload.avoided_large_water_before_bed,
            parsed.score > 0
          );
          const achievedFromLog = getBoolean(parsed.payload.achieved, avoidedFromLog);
          const pointFromLog = getNumber(parsed.payload.point, achievedFromLog ? 1 : 0);

          if (byDate.has(log.log_date)) return;

          byDate.set(log.log_date, {
            id: log.id,
            date: log.log_date,
            avoidedLargeWater: avoidedFromLog,
            score: parsed.score,
            point: pointFromLog > 0 ? 1 : 0,
            achieved: achievedFromLog,
          });
        });

      const history = Array.from(byDate.values())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);
      setAvoidWaterBeforeBedHistory(history);

      if (history.length > 0 && history[0].date >= weekStartKey && history[0].date <= weekEndKey && history[0].avoidedLargeWater) {
        setAvoidWaterBeforeBedValue(true);
        return;
      }

      setAvoidWaterBeforeBedValue(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setAvoidWaterBeforeBedLoading(false);
    }
  }, [isRestFlow, task, userId]);

  const loadNoLongLateNapContext = useCallback(async () => {
    if (!(isRestFlow && task === "no-long-late-nap")) return;

    try {
      setNoLongLateNapLoading(true);
      const logsResponse = await logsService.listRestTaskLogs(userId ?? undefined, {
        task: "no-long-late-nap",
        limit: 30,
      });

      if (!logsResponse.success) {
        throw new Error(logsResponse.error || "Could not load daily logs");
      }

      const byDate = new Map<string, NoLongLateNapHistoryItem>();
      [...(logsResponse.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .forEach((log) => {
          const parsed = parseRestTaskNote(String(log.note));
          if (!parsed || parsed.task !== "no-long-late-nap") return;

          const noLongNapFromLog = getBoolean(parsed.payload.no_long_late_nap, parsed.score > 0);
          const achievedFromLog = getBoolean(parsed.payload.achieved, noLongNapFromLog);
          const pointFromLog = getNumber(parsed.payload.point, achievedFromLog ? 1 : 0);

          if (byDate.has(log.log_date)) return;

          byDate.set(log.log_date, {
            id: log.id,
            date: log.log_date,
            noLongLateNap: noLongNapFromLog,
            score: parsed.score,
            point: pointFromLog > 0 ? 1 : 0,
            achieved: achievedFromLog,
          });
        });

      const history = Array.from(byDate.values())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);
      setNoLongLateNapHistory(history);

      if (history.length > 0 && history[0].date >= weekStartKey && history[0].date <= weekEndKey && history[0].noLongLateNap) {
        setNoLongLateNapValue(true);
        return;
      }

      setNoLongLateNapValue(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setNoLongLateNapLoading(false);
    }
  }, [isRestFlow, task, userId]);

  const loadNoFood4HoursBeforeBedContext = useCallback(async () => {
    if (!(isRestFlow && task === "no-food-4-hours-before-bed")) return;

    try {
      setNoFood4HoursBeforeBedLoading(true);
      const logsResponse = await logsService.listRestTaskLogs(userId ?? undefined, {
        task: "no-food-4-hours-before-bed",
        limit: 30,
      });

      if (!logsResponse.success) {
        throw new Error(logsResponse.error || "Could not load daily logs");
      }

      const byDate = new Map<string, NoFood4HoursBeforeBedHistoryItem>();
      [...(logsResponse.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .forEach((log) => {
          const parsed = parseRestTaskNote(String(log.note));
          if (!parsed || parsed.task !== "no-food-4-hours-before-bed") return;

          const noFoodFromLog = getBoolean(parsed.payload.no_food_4_hours_before_bed, parsed.score > 0);
          const achievedFromLog = getBoolean(parsed.payload.achieved, noFoodFromLog);
          const pointFromLog = getNumber(parsed.payload.point, achievedFromLog ? 1 : 0);

          if (byDate.has(log.log_date)) return;

          byDate.set(log.log_date, {
            id: log.id,
            date: log.log_date,
            noFood4HoursBeforeBed: noFoodFromLog,
            score: parsed.score,
            point: pointFromLog > 0 ? 1 : 0,
            achieved: achievedFromLog,
          });
        });

      const history = Array.from(byDate.values())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);
      setNoFood4HoursBeforeBedHistory(history);

      if (history.length > 0 && history[0].date >= weekStartKey && history[0].date <= weekEndKey && history[0].noFood4HoursBeforeBed) {
        setNoFood4HoursBeforeBedValue(true);
        return;
      }

      setNoFood4HoursBeforeBedValue(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setNoFood4HoursBeforeBedLoading(false);
    }
  }, [isRestFlow, task, userId]);

  const loadScreenTimeContext = useCallback(async () => {
    if (!(isRestFlow && task === "limit-screen-time")) return;

    try {
      setScreenTimeLoading(true);
      const logsResponse = await logsService.listRestTaskLogs(userId ?? undefined, {
        task: "limit-screen-time",
        limit: 30,
      });

      if (!logsResponse.success) {
        throw new Error(logsResponse.error || "Could not load daily logs");
      }

      const byDate = new Map<string, LimitScreenTimeHistoryItem>();
      [...(logsResponse.data || [])]
        .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
        .forEach((log) => {
          const parsed = parseRestTaskNote(String(log.note));
          if (!parsed || parsed.task !== "limit-screen-time") return;

          const limitedFromLog = getBoolean(parsed.payload.limited_screen_time, parsed.score > 0);
          const achievedFromLog = getBoolean(parsed.payload.achieved, limitedFromLog);
          const pointFromLog = getNumber(parsed.payload.point, achievedFromLog ? 1 : 0);

          if (byDate.has(log.log_date)) return;

          byDate.set(log.log_date, {
            id: log.id,
            date: log.log_date,
            limitedScreenTime: limitedFromLog,
            score: parsed.score,
            point: pointFromLog > 0 ? 1 : 0,
            achieved: achievedFromLog,
          });
        });

      const history = Array.from(byDate.values())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);
      setScreenTimeHistory(history);

      if (history.length > 0 && history[0].date >= weekStartKey && history[0].date <= weekEndKey && history[0].limitedScreenTime) {
        setScreenTimeValue(true);
        return;
      }

      setScreenTimeValue(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setScreenTimeLoading(false);
    }
  }, [isRestFlow, task, userId]);

  useEffect(() => {
    void loadSleepContext();
  }, [loadSleepContext]);

  useEffect(() => {
    void loadWaterContext();
  }, [loadWaterContext]);

  useEffect(() => {
    void loadSleepOnTimeContext();
  }, [loadSleepOnTimeContext]);

  useEffect(() => {
    void loadAvoidWaterBeforeBedContext();
  }, [loadAvoidWaterBeforeBedContext]);

  useEffect(() => {
    void loadNoLongLateNapContext();
  }, [loadNoLongLateNapContext]);

  useEffect(() => {
    void loadNoFood4HoursBeforeBedContext();
  }, [loadNoFood4HoursBeforeBedContext]);

  useEffect(() => {
    void loadScreenTimeContext();
  }, [loadScreenTimeContext]);

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

        {activeTaskLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              {postSaveSyncing ? "กำลังอัปเดตข้อมูลล่าสุด..." : "กำลังโหลดข้อมูลเดิม..."}
            </div>
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
    const logsResponse = await logsService.listRestTaskLogs(userId ?? undefined, {
      limit: 240,
      forceRefresh: true,
    });
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

  async function runPostSaveSync(refreshContext?: () => Promise<void>) {
    if (!isRestFlow) return;

    try {
      setPostSaveSyncing(true);
      await syncRestGoalProgress();
      if (refreshContext) {
        await refreshContext();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError((prev) => prev ?? `บันทึกสำเร็จแล้ว แต่ซิงก์คะแนนมีปัญหา: ${message}`);
    } finally {
      setPostSaveSyncing(false);
    }
  }

  function renderGenericInput(currentConfig: TaskConfig) {
    if (currentConfig.type === "number") {
      return (
        <input
          type="number"
          placeholder="กรอกตัวเลข"
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
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setValue(true)}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            value === true
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <CircleCheckBig size={18} />
          Yes
        </button>

        <button
          type="button"
          onClick={() => setValue(false)}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            value === false
              ? "border-rose-300 bg-rose-50 text-rose-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <CircleX size={18} />
          No
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

        const nextSuccessMessage = achieved
          ? "บันทึกการนอนวันนี้สำเร็จ ได้ +1 คะแนน"
          : "บันทึกการนอนวันนี้สำเร็จ แต่ยังไม่ถึงเป้าหมาย";
        await runPostSaveSync(loadSleepContext);
        setSuccessMessage(nextSuccessMessage);
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

        const nextSuccessMessage = achieved
          ? "บันทึกการดื่มน้ำสัปดาห์นี้สำเร็จ ได้ +1 คะแนน"
          : "บันทึกการดื่มน้ำสัปดาห์นี้สำเร็จ แต่ยังไม่ถึงเป้าหมาย";
        await runPostSaveSync(loadWaterContext);
        setSuccessMessage(nextSuccessMessage);
        return;
      }

      if (task === "sleep-on-time") {
        if (sleepOnTimeValue === null) {
          setError("กรุณาเลือกคำตอบ Yes หรือ No ก่อนบันทึก");
          return;
        }

        const score = sleepOnTimeValue ? 100 : 0;
        const point = sleepOnTimeValue ? 1 : 0;
        const achieved = sleepOnTimeValue;

        await saveTaskLog({
          mood: "task-sleep-on-time",
          energy: sleepOnTimeValue ? 4 : 2,
          stress: sleepOnTimeValue ? 1 : 4,
          note: isRestFlow
            ? {
                entry_type: "rest_task",
                category: "physical",
                activity: "rest",
                task: "sleep-on-time",
                score,
                payload: {
                  on_time: sleepOnTimeValue,
                  point,
                  achieved,
                },
              }
            : {
                task,
                on_time: sleepOnTimeValue,
                point,
                achieved,
              },
        });

        const nextSuccessMessage = achieved
          ? "บันทึกวันนี้สำเร็จ เข้านอนและตื่นนอนตรงเวลา ได้ +1 คะแนน"
          : "บันทึกวันนี้สำเร็จ วันนี้ยังไม่ตรงเวลาที่ตั้งไว้";
        await runPostSaveSync(loadSleepOnTimeContext);
        setSuccessMessage(nextSuccessMessage);
        return;
      }

      if (task === "avoid-water-before-bed") {
        if (avoidWaterBeforeBedValue === null) {
          setError("กรุณาเลือกคำตอบ Yes หรือ No ก่อนบันทึก");
          return;
        }

        const score = avoidWaterBeforeBedValue ? 100 : 0;
        const point = avoidWaterBeforeBedValue ? 1 : 0;
        const achieved = avoidWaterBeforeBedValue;

        await saveTaskLog({
          mood: "task-avoid-water-before-bed",
          energy: avoidWaterBeforeBedValue ? 4 : 2,
          stress: avoidWaterBeforeBedValue ? 1 : 4,
          note: isRestFlow
            ? {
                entry_type: "rest_task",
                category: "physical",
                activity: "rest",
                task: "avoid-water-before-bed",
                score,
                payload: {
                  avoided_large_water_before_bed: avoidWaterBeforeBedValue,
                  point,
                  achieved,
                },
              }
            : {
                task,
                avoided_large_water_before_bed: avoidWaterBeforeBedValue,
                point,
                achieved,
              },
        });

        const nextSuccessMessage = achieved
          ? "บันทึกวันนี้สำเร็จ ได้ +1 คะแนน"
          : "บันทึกวันนี้สำเร็จ วันนี้ยังดื่มน้ำมากเกินไปก่อนนอน";
        await runPostSaveSync(loadAvoidWaterBeforeBedContext);
        setSuccessMessage(nextSuccessMessage);
        return;
      }

      if (task === "no-long-late-nap") {
        if (noLongLateNapValue === null) {
          setError("กรุณาเลือกคำตอบ Yes หรือ No ก่อนบันทึก");
          return;
        }

        const score = noLongLateNapValue ? 100 : 0;
        const point = noLongLateNapValue ? 1 : 0;
        const achieved = noLongLateNapValue;

        await saveTaskLog({
          mood: "task-no-long-late-nap",
          energy: noLongLateNapValue ? 4 : 2,
          stress: noLongLateNapValue ? 1 : 4,
          note: isRestFlow
            ? {
                entry_type: "rest_task",
                category: "physical",
                activity: "rest",
                task: "no-long-late-nap",
                score,
                payload: {
                  no_long_late_nap: noLongLateNapValue,
                  point,
                  achieved,
                },
              }
            : {
                task,
                no_long_late_nap: noLongLateNapValue,
                point,
                achieved,
              },
        });

        const nextSuccessMessage = achieved
          ? "บันทึกวันนี้สำเร็จ ได้ +1 คะแนน"
          : "บันทึกวันนี้สำเร็จ วันนี้งีบยาวเกินเงื่อนไข";
        await runPostSaveSync(loadNoLongLateNapContext);
        setSuccessMessage(nextSuccessMessage);
        return;
      }

      if (task === "no-food-4-hours-before-bed") {
        if (noFood4HoursBeforeBedValue === null) {
          setError("กรุณาเลือกคำตอบ Yes หรือ No ก่อนบันทึก");
          return;
        }

        const score = noFood4HoursBeforeBedValue ? 100 : 0;
        const point = noFood4HoursBeforeBedValue ? 1 : 0;
        const achieved = noFood4HoursBeforeBedValue;

        await saveTaskLog({
          mood: "task-no-food-4-hours-before-bed",
          energy: noFood4HoursBeforeBedValue ? 4 : 2,
          stress: noFood4HoursBeforeBedValue ? 1 : 4,
          note: isRestFlow
            ? {
                entry_type: "rest_task",
                category: "physical",
                activity: "rest",
                task: "no-food-4-hours-before-bed",
                score,
                payload: {
                  no_food_4_hours_before_bed: noFood4HoursBeforeBedValue,
                  point,
                  achieved,
                },
              }
            : {
                task,
                no_food_4_hours_before_bed: noFood4HoursBeforeBedValue,
                point,
                achieved,
              },
        });

        const nextSuccessMessage = achieved
          ? "บันทึกวันนี้สำเร็จ ได้ +1 คะแนน"
          : "บันทึกวันนี้สำเร็จ วันนี้ทานอาหารใกล้เวลานอนเกินไป";
        await runPostSaveSync(loadNoFood4HoursBeforeBedContext);
        setSuccessMessage(nextSuccessMessage);
        return;
      }

      if (task === "limit-screen-time") {
        if (screenTimeValue === null) {
          setError("กรุณาเลือกคำตอบ Yes หรือ No ก่อนบันทึก");
          return;
        }

        const score = screenTimeValue ? 100 : 0;
        const point = screenTimeValue ? 1 : 0;
        const achieved = screenTimeValue;

        await saveTaskLog({
          mood: "task-limit-screen-time",
          energy: screenTimeValue ? 4 : 2,
          stress: screenTimeValue ? 1 : 4,
          note: isRestFlow
            ? {
                entry_type: "rest_task",
                category: "physical",
                activity: "rest",
                task: "limit-screen-time",
                score,
                payload: {
                  limited_screen_time: screenTimeValue,
                  point,
                  achieved,
                },
              }
            : {
                task,
                limited_screen_time: screenTimeValue,
                point,
                achieved,
              },
        });

        const nextSuccessMessage = achieved
          ? "บันทึกวันนี้สำเร็จ ได้ +1 คะแนน"
          : "บันทึกวันนี้สำเร็จ วันนี้ยังใช้หน้าจอนานเกินไปก่อนนอน";
        await runPostSaveSync(loadScreenTimeContext);
        setSuccessMessage(nextSuccessMessage);
        return;
      }

      if (value === null) {
        setError("กรุณาเลือกคำตอบก่อนบันทึก");
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

      await runPostSaveSync();
      setSuccessMessage("บันทึกผลสำเร็จ");
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
          <WeekNavBar weekStartDate={weekStartDate} weekEndDate={weekEndDate} isCurrentWeek={isViewingCurrentWeek} />

          <main className={`space-y-4 px-4 py-4 ${activeTaskLoading ? "pointer-events-none opacity-70" : ""}`}>
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
                  สัปดาห์นี้ได้ {monthlySleepPoints} คะแนน
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
          <WeekNavBar weekStartDate={weekStartDate} weekEndDate={weekEndDate} isCurrentWeek={isViewingCurrentWeek} />

          <main className={`space-y-4 px-4 py-4 ${activeTaskLoading ? "pointer-events-none opacity-70" : ""}`}>
            {renderStatusBanner()}

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">บันทึกการดื่มน้ำสัปดาห์นี้</h2>
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

            {!isViewingCurrentWeek ? (
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
                ดูย้อนหลังเท่านั้น — บันทึกได้เฉพาะสัปดาห์ปัจจุบัน
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || waterLoading || isInitialWaterLoading}
                className={`w-full rounded-2xl py-4 font-semibold text-white ${
                  saving || waterLoading || isInitialWaterLoading ? "bg-slate-400" : "bg-[#c6968c]"
                }`}
              >
                {saving ? "กำลังบันทึก..." : isInitialWaterLoading ? "กำลังโหลด..." : "บันทึกการดื่มน้ำสัปดาห์นี้"}
              </button>
            )}

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">ประวัติการบันทึกย้อนหลัง</h3>
                <span className="rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                  สัปดาห์นี้ได้ {monthlyWaterPoints} คะแนน
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

          </main>
        </div>
      </MobileShell>
    );
  }

  if (task === "sleep-on-time") {
    return (
      <MobileShell>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <AppHeader title="เข้านอนและตื่นนอนตรงเวลา" showBack showBell variant="soft" />
          <WeekNavBar weekStartDate={weekStartDate} weekEndDate={weekEndDate} isCurrentWeek={isViewingCurrentWeek} />

          <main className={`space-y-4 px-4 py-4 ${activeTaskLoading ? "pointer-events-none opacity-70" : ""}`}>
            {renderStatusBanner()}

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">เช็กวินัยการนอนวันนี้</h2>
                  <p className="text-sm text-slate-500">วันนี้เข้านอนและตื่นนอนตามเวลาที่ตั้งไว้หรือไม่</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    sleepOnTimeValue === null
                      ? "bg-slate-100 text-slate-600"
                      : sleepOnTimeValue
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {sleepOnTimeValue === null
                    ? "ยังไม่เลือก"
                    : sleepOnTimeValue
                      ? "ได้ +1 คะแนน"
                      : "วันนี้ 0 คะแนน"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-[#f9fbff] px-3 py-2 text-xs text-slate-600">
                  <BedDouble size={14} className="text-[#5f6a86]" />
                  เข้านอนตรงเวลา
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f2fbf5] px-3 py-2 text-xs text-slate-600">
                  <Sunrise size={14} className="text-[#2f7b56]" />
                  ตื่นนอนตรงเวลา
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSleepOnTimeValue(true)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    sleepOnTimeValue === true
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CircleCheckBig size={18} />
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => setSleepOnTimeValue(false)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    sleepOnTimeValue === false
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CircleX size={18} />
                  No
                </button>
              </div>
            </section>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || sleepOnTimeLoading || sleepOnTimeValue === null}
              className={`w-full rounded-2xl py-4 font-semibold text-white ${
                saving || sleepOnTimeLoading || sleepOnTimeValue === null ? "bg-slate-400" : "bg-[#c6968c]"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกผลวันนี้"}
            </button>

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">ประวัติรายวัน</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                  <AlarmClockCheck size={13} />
                  สัปดาห์นี้ได้ {monthlySleepOnTimePoints} คะแนน
                </span>
              </div>

              {sleepOnTimeLoading ? (
                <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูลบันทึก...</p>
              ) : sleepOnTimeHistory.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการบันทึกสำหรับหัวข้อนี้</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {sleepOnTimeHistory.map((item) => (
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
                        ผลการทำวันนี้: {item.onTime ? "ตรงเวลา" : "ไม่ตรงเวลา"}
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

  if (task === "avoid-water-before-bed") {
    return (
      <MobileShell>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <AppHeader title="ไม่ดื่มน้ำปริมาณมากก่อนนอน" showBack showBell variant="soft" />
          <WeekNavBar weekStartDate={weekStartDate} weekEndDate={weekEndDate} isCurrentWeek={isViewingCurrentWeek} />

          <main className={`space-y-4 px-4 py-4 ${activeTaskLoading ? "pointer-events-none opacity-70" : ""}`}>
            {renderStatusBanner()}

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">เช็กพฤติกรรมก่อนนอน</h2>
                  <p className="text-sm text-slate-500">วันนี้หลีกเลี่ยงการดื่มน้ำปริมาณมากก่อนนอนได้หรือไม่</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    avoidWaterBeforeBedValue === null
                      ? "bg-slate-100 text-slate-600"
                      : avoidWaterBeforeBedValue
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {avoidWaterBeforeBedValue === null
                    ? "ยังไม่เลือก"
                    : avoidWaterBeforeBedValue
                      ? "ได้ +1 คะแนน"
                      : "วันนี้ 0 คะแนน"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-[#f2fbf5] px-3 py-2 text-xs text-slate-600">
                  <MoonStar size={14} className="text-[#2f7b56]" />
                  ลดการดื่มก่อนนอน
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f9fbff] px-3 py-2 text-xs text-slate-600">
                  <Droplets size={14} className="text-[#5f6a86]" />
                  ไม่ดื่มปริมาณมาก
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAvoidWaterBeforeBedValue(true)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    avoidWaterBeforeBedValue === true
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CircleCheckBig size={18} />
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => setAvoidWaterBeforeBedValue(false)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    avoidWaterBeforeBedValue === false
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CircleX size={18} />
                  No
                </button>
              </div>
            </section>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || avoidWaterBeforeBedLoading || avoidWaterBeforeBedValue === null}
              className={`w-full rounded-2xl py-4 font-semibold text-white ${
                saving || avoidWaterBeforeBedLoading || avoidWaterBeforeBedValue === null
                  ? "bg-slate-400"
                  : "bg-[#c6968c]"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกผลวันนี้"}
            </button>

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">ประวัติรายวัน</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                  <AlarmClockCheck size={13} />
                  สัปดาห์นี้ได้ {monthlyAvoidWaterBeforeBedPoints} คะแนน
                </span>
              </div>

              {avoidWaterBeforeBedLoading ? (
                <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูลบันทึก...</p>
              ) : avoidWaterBeforeBedHistory.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการบันทึกสำหรับหัวข้อนี้</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {avoidWaterBeforeBedHistory.map((item) => (
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
                        ผลการทำวันนี้: {item.avoidedLargeWater ? "หลีกเลี่ยงได้" : "ยังดื่มมากก่อนนอน"}
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

  if (task === "no-long-late-nap") {
    return (
      <MobileShell>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <AppHeader title="ไม่งีบหลับหลังบ่าย 3 โมงเกิน 1 ชม." showBack showBell variant="soft" />
          <WeekNavBar weekStartDate={weekStartDate} weekEndDate={weekEndDate} isCurrentWeek={isViewingCurrentWeek} />

          <main className={`space-y-4 px-4 py-4 ${activeTaskLoading ? "pointer-events-none opacity-70" : ""}`}>
            {renderStatusBanner()}

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">เช็กการงีบระหว่างวัน</h2>
                  <p className="text-sm text-slate-500">หลังบ่าย 3 โมง วันนี้งีบไม่เกิน 1 ชั่วโมงหรือไม่</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    noLongLateNapValue === null
                      ? "bg-slate-100 text-slate-600"
                      : noLongLateNapValue
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {noLongLateNapValue === null
                    ? "ยังไม่เลือก"
                    : noLongLateNapValue
                      ? "ได้ +1 คะแนน"
                      : "วันนี้ 0 คะแนน"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-[#f2fbf5] px-3 py-2 text-xs text-slate-600">
                  <MoonStar size={14} className="text-[#2f7b56]" />
                  ไม่งีบยาวช่วงเย็น
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f9fbff] px-3 py-2 text-xs text-slate-600">
                  <BedDouble size={14} className="text-[#5f6a86]" />
                  ไม่เกิน 1 ชั่วโมง
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNoLongLateNapValue(true)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    noLongLateNapValue === true
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CircleCheckBig size={18} />
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => setNoLongLateNapValue(false)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    noLongLateNapValue === false
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CircleX size={18} />
                  No
                </button>
              </div>
            </section>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || noLongLateNapLoading || noLongLateNapValue === null}
              className={`w-full rounded-2xl py-4 font-semibold text-white ${
                saving || noLongLateNapLoading || noLongLateNapValue === null ? "bg-slate-400" : "bg-[#c6968c]"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกผลวันนี้"}
            </button>

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">ประวัติรายวัน</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                  <AlarmClockCheck size={13} />
                  สัปดาห์นี้ได้ {monthlyNoLongLateNapPoints} คะแนน
                </span>
              </div>

              {noLongLateNapLoading ? (
                <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูลบันทึก...</p>
              ) : noLongLateNapHistory.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการบันทึกสำหรับหัวข้อนี้</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {noLongLateNapHistory.map((item) => (
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
                        ผลการทำวันนี้: {item.noLongLateNap ? "ผ่านเงื่อนไข" : "งีบเกินเงื่อนไข"}
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

  if (task === "no-food-4-hours-before-bed") {
    return (
      <MobileShell>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <AppHeader title="งดอาหารอย่างน้อย 4 ชม. ก่อนนอน" showBack showBell variant="soft" />
          <WeekNavBar weekStartDate={weekStartDate} weekEndDate={weekEndDate} isCurrentWeek={isViewingCurrentWeek} />

          <main className={`space-y-4 px-4 py-4 ${activeTaskLoading ? "pointer-events-none opacity-70" : ""}`}>
            {renderStatusBanner()}

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">เช็กอาหารก่อนนอน</h2>
                  <p className="text-sm text-slate-500">วันนี้งดอาหารอย่างน้อย 4 ชั่วโมงก่อนเข้านอนได้หรือไม่</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    noFood4HoursBeforeBedValue === null
                      ? "bg-slate-100 text-slate-600"
                      : noFood4HoursBeforeBedValue
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {noFood4HoursBeforeBedValue === null
                    ? "ยังไม่เลือก"
                    : noFood4HoursBeforeBedValue
                      ? "ได้ +1 คะแนน"
                      : "วันนี้ 0 คะแนน"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-[#f2fbf5] px-3 py-2 text-xs text-slate-600">
                  <MoonStar size={14} className="text-[#2f7b56]" />
                  เว้นช่วงก่อนนอน
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f9fbff] px-3 py-2 text-xs text-slate-600">
                  <BedDouble size={14} className="text-[#5f6a86]" />
                  อย่างน้อย 4 ชั่วโมง
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNoFood4HoursBeforeBedValue(true)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    noFood4HoursBeforeBedValue === true
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CircleCheckBig size={18} />
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => setNoFood4HoursBeforeBedValue(false)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    noFood4HoursBeforeBedValue === false
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CircleX size={18} />
                  No
                </button>
              </div>
            </section>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || noFood4HoursBeforeBedLoading || noFood4HoursBeforeBedValue === null}
              className={`w-full rounded-2xl py-4 font-semibold text-white ${
                saving || noFood4HoursBeforeBedLoading || noFood4HoursBeforeBedValue === null
                  ? "bg-slate-400"
                  : "bg-[#c6968c]"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกผลวันนี้"}
            </button>

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">ประวัติรายวัน</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                  <AlarmClockCheck size={13} />
                  สัปดาห์นี้ได้ {monthlyNoFood4HoursBeforeBedPoints} คะแนน
                </span>
              </div>

              {noFood4HoursBeforeBedLoading ? (
                <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูลบันทึก...</p>
              ) : noFood4HoursBeforeBedHistory.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการบันทึกสำหรับหัวข้อนี้</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {noFood4HoursBeforeBedHistory.map((item) => (
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
                        ผลการทำวันนี้: {item.noFood4HoursBeforeBed ? "ผ่านเงื่อนไข" : "ทานอาหารใกล้เวลานอน"}
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

  if (task === "limit-screen-time") {
    return (
      <MobileShell>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <AppHeader title="ลดเวลาอยู่กับหน้าจอก่อนนอน" showBack showBell variant="soft" />
          <WeekNavBar weekStartDate={weekStartDate} weekEndDate={weekEndDate} isCurrentWeek={isViewingCurrentWeek} />

          <main className={`space-y-4 px-4 py-4 ${activeTaskLoading ? "pointer-events-none opacity-70" : ""}`}>
            {renderStatusBanner()}

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">คืนนี้ลดเวลาอยู่กับหน้าจอก่อนนอนได้ไหม</h2>
                  <p className="text-sm text-slate-500">ตั้งใจให้อยู่กับหน้าจอก่อนนอนไม่เกิน 60 นาที</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    screenTimeValue === null
                      ? "bg-slate-100 text-slate-600"
                      : screenTimeValue
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {screenTimeValue === null
                    ? "ยังไม่เลือก"
                    : screenTimeValue
                      ? "ได้ +1 คะแนน"
                      : "วันนี้ 0 คะแนน"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-[#f9fbff] px-3 py-2 text-xs text-slate-600">
                  <Monitor size={14} className="text-[#5f6a86]" />
                  ลดเวลาหน้าจอ
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f2fbf5] px-3 py-2 text-xs text-slate-600">
                  <MoonStar size={14} className="text-[#2f7b56]" />
                  ไม่เกิน 60 นาที
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScreenTimeValue(true)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    screenTimeValue === true
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CircleCheckBig size={18} />
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => setScreenTimeValue(false)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    screenTimeValue === false
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CircleX size={18} />
                  No
                </button>
              </div>
            </section>

            {!isViewingCurrentWeek ? (
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
                ดูย้อนหลังเท่านั้น — บันทึกได้เฉพาะสัปดาห์ปัจจุบัน
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || screenTimeLoading || screenTimeValue === null}
                className={`w-full rounded-2xl py-4 font-semibold text-white ${
                  saving || screenTimeLoading || screenTimeValue === null ? "bg-slate-400" : "bg-[#c6968c]"
                }`}
              >
                {saving ? "กำลังบันทึก..." : "บันทึกผลวันนี้"}
              </button>
            )}

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">ประวัติรายวัน</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f2] px-2.5 py-1 text-xs font-medium text-[#2f7b56]">
                  <AlarmClockCheck size={13} />
                  สัปดาห์นี้ได้ {monthlyScreenTimePoints} คะแนน
                </span>
              </div>

              {screenTimeLoading ? (
                <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูลบันทึก...</p>
              ) : screenTimeHistory.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลการบันทึกสำหรับหัวข้อนี้</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {screenTimeHistory.map((item) => (
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
                        ผลการทำวันนี้: {item.limitedScreenTime ? "ลดเวลาหน้าจอได้" : "ใช้หน้าจอนานเกินไป"}
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

  if (!config) {
    return (
      <MobileShell>
        <AppHeader title="ไม่พบกิจกรรม" showBack />
        <main className="p-6 text-center text-slate-500">ไม่พบกิจกรรมที่ต้องการ</main>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <AppHeader title={activeConfig.label} showBack showBell variant="soft" />
        <WeekNavBar weekStartDate={weekStartDate} weekEndDate={weekEndDate} isCurrentWeek={isViewingCurrentWeek} />

        <main className={`space-y-4 px-4 py-4 ${activeTaskLoading ? "pointer-events-none opacity-70" : ""}`}>
          {renderStatusBanner()}

          <section className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">
                  {REST_GENERIC_COPY[activeConfig.slug]?.eyebrow ?? "DAILY CHECK"}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {REST_GENERIC_COPY[activeConfig.slug]?.title ?? activeConfig.label}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {REST_GENERIC_COPY[activeConfig.slug]?.description ?? "บันทึกผลของกิจกรรมนี้สำหรับวันนี้"}
                </p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6ec] text-[#a95f3a] shadow-sm">
                <Hourglass size={20} />
              </span>
            </div>

            <div className="mt-4 rounded-2xl bg-[#f8fbfd] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-600">สถานะของวันนี้</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    value === null
                      ? "bg-slate-100 text-slate-600"
                      : value
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {value === null ? "ยังไม่ได้เลือก" : value ? "ทำได้" : "ยังไม่ผ่าน"}
                </span>
              </div>
            </div>

            <div className="mt-4">{renderGenericInput(activeConfig)}</div>
          </section>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || value === null}
            className={`w-full rounded-2xl py-4 font-semibold text-white ${
              saving || value === null ? "bg-slate-400" : "bg-[#c6968c]"
            }`}
          >
            {saving ? "กำลังบันทึก..." : REST_GENERIC_COPY[activeConfig.slug]?.saveLabel ?? "บันทึกผลวันนี้"}
          </button>
        </main>
      </div>
    </MobileShell>
  );
}

