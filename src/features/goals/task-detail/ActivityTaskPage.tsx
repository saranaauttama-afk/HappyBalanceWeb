import { useState } from "react";
import { useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { logsService } from "../../../services/logs.service";
import { REST_TASKS, type TaskConfig } from "../tasks/restTasks";

type TaskValue = number | boolean | null;

type SleepLogItem = {
  day: string;
  hour: number;
  minute: number;
};

const DEFAULT_SLEEP_LOGS: SleepLogItem[] = [
  { day: "Monday", hour: 8, minute: 0 },
  { day: "Tuesday", hour: 8, minute: 0 },
  { day: "Wednesday", hour: 6, minute: 40 },
  { day: "Thursday", hour: 8, minute: 0 },
  { day: "Friday", hour: 7, minute: 0 },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function clampHour(value: number) {
  if (value < 0) return 23;
  if (value > 23) return 0;
  return value;
}

function clampMinute(value: number) {
  if (value < 0) return 59;
  if (value > 59) return 0;
  return value;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

type TimeAdjusterProps = {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

function TimeAdjuster({ value, onIncrease, onDecrease }: TimeAdjusterProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onIncrease}
        className="rounded px-1 text-xs text-rose-300"
      >
        ^
      </button>
      <span className="min-w-[24px] text-center text-xl font-bold text-slate-900">
        {pad(value)}
      </span>
      <button
        type="button"
        onClick={onDecrease}
        className="rounded px-1 text-xs text-rose-300"
      >
        v
      </button>
    </div>
  );
}

function WaterCup({ filled }: { filled: boolean }) {
  return (
    <div
      className={`h-16 w-10 rounded-b-xl rounded-t-md border-2 ${
        filled ? "border-sky-400 bg-sky-200" : "border-slate-300 bg-white"
      }`}
    />
  );
}

export default function ActivityTaskPage() {
  const { task } = useParams<{ task?: string }>();
  const config = REST_TASKS.find((t) => t.slug === task);

  const [value, setValue] = useState<TaskValue>(null);
  const [sleepLogs, setSleepLogs] = useState<SleepLogItem[]>(DEFAULT_SLEEP_LOGS);
  const [waterCount, setWaterCount] = useState<number>(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  if (!config) {
    return (
      <MobileShell>
        <AppHeader title="Task not found" showBack />
        <main className="p-6 text-center text-slate-500">Requested task was not found.</main>
      </MobileShell>
    );
  }

  function updateSleepHour(index: number, nextHour: number) {
    setSleepLogs((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, hour: clampHour(nextHour) } : item
      )
    );
  }

  function updateSleepMinute(index: number, nextMinute: number) {
    setSleepLogs((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, minute: clampMinute(nextMinute) } : item
      )
    );
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

  function renderStatusBanner() {
    return (
      <>
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
      </>
    );
  }

  async function saveTaskLog(input: {
    mood: string;
    energy: number;
    stress: number;
    note: string;
  }) {
    const response = await logsService.createDailyLog({
      log_date: getTodayDate(),
      mood: input.mood,
      energy: input.energy,
      stress: input.stress,
      note: input.note,
    });

    if (!response.success) {
      throw new Error(response.error || "Could not save task log");
    }
  }

  async function handleSave() {
    setError(null);
    setSuccessMessage("");

    try {
      setSaving(true);

      if (task === "sleep") {
        const averageHour =
          sleepLogs.reduce((sum, item) => sum + item.hour + item.minute / 60, 0) /
          sleepLogs.length;

        await saveTaskLog({
          mood: "task-sleep",
          energy: Math.round(averageHour),
          stress: 1,
          note: JSON.stringify({ task, sleepLogs, averageHour: Number(averageHour.toFixed(2)) }),
        });

        setSuccessMessage("Sleep log saved");
        return;
      }

      if (task === "drink-water") {
        await saveTaskLog({
          mood: "task-drink-water",
          energy: Math.round((waterCount / 15) * 5),
          stress: 1,
          note: JSON.stringify({ task, glasses: waterCount, ml: waterCount * 350 }),
        });

        setSuccessMessage("Water intake log saved");
        return;
      }

      if (value === null) {
        setError("Please enter or select a value first");
        return;
      }

      await saveTaskLog({
        mood: `task-${task ?? "unknown"}`,
        energy: typeof value === "number" ? value : value ? 5 : 1,
        stress: typeof value === "number" ? 1 : value ? 1 : 4,
        note: JSON.stringify({ task, value }),
      });

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
        <AppHeader title="Sleep" showBack showBell />

        <main className="space-y-4 px-4 py-6">
          {renderStatusBanner()}

          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">Sleep Tracking</h1>
            <p className="text-sm text-slate-600">Target: 8 hours per day</p>
          </div>

          <div className="space-y-3">
            {sleepLogs.map((item, index) => (
              <div key={item.day} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-700">{item.day} duration</p>

                  <div className="flex items-center gap-2">
                    <TimeAdjuster
                      value={item.hour}
                      onIncrease={() => updateSleepHour(index, item.hour + 1)}
                      onDecrease={() => updateSleepHour(index, item.hour - 1)}
                    />

                    <span className="text-xl font-bold text-slate-900">:</span>

                    <TimeAdjuster
                      value={item.minute}
                      onIncrease={() => updateSleepMinute(index, item.minute + 1)}
                      onDecrease={() => updateSleepMinute(index, item.minute - 1)}
                    />

                    <span className="text-sm text-slate-700">hr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className={`w-full rounded-2xl py-4 font-semibold text-white ${
              saving ? "bg-slate-400" : "bg-[#c6968c]"
            }`}
          >
            {saving ? "Saving..." : "Confirm"}
          </button>
        </main>
      </MobileShell>
    );
  }

  if (task === "drink-water") {
    const totalCups = 15;

    return (
      <MobileShell>
        <AppHeader title="Drink Water" showBack showBell />

        <main className="space-y-5 px-4 py-6">
          {renderStatusBanner()}

          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Drink Water</h1>
            <p className="text-sm text-slate-600">Track your water intake today</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setWaterCount((prev) => Math.max(prev - 1, 0))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-700"
              >
                -
              </button>

              <button
                type="button"
                onClick={() => setWaterCount((prev) => Math.min(prev + 1, totalCups))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-700"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-5 justify-items-center gap-4">
              {Array.from({ length: totalCups }).map((_, index) => (
                <WaterCup key={index} filled={index < waterCount} />
              ))}
            </div>

            <div className="mt-5 text-center text-sm text-slate-600">
              <span className="font-medium">{waterCount} cups</span> = {waterCount * 350} ml
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className={`w-full rounded-2xl py-4 font-semibold text-white ${
              saving ? "bg-slate-400" : "bg-[#c6968c]"
            }`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </main>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <AppHeader title={config.label} showBack showBell />

      <main className="space-y-6 px-4 py-6">
        {renderStatusBanner()}

        <div className="rounded-2xl bg-white p-6 shadow">{renderGenericInput(config)}</div>

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
