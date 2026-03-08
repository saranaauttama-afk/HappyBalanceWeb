import { useState } from "react";
import { useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { goalsService } from "../../../services/goals.service";

export default function SleepGoalPage() {
  const { category, activity } = useParams<{ category?: string; activity?: string }>();

  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  function adjustHour(delta: number) {
    setHour((prev) => (prev + delta + 24) % 24);
  }

  function adjustMinute(delta: number) {
    setMinute((prev) => (prev + delta + 60) % 60);
  }

  async function handleSave() {
    setError(null);
    setSuccessMessage("");

    const targetValue = Number((hour + minute / 60).toFixed(2));

    try {
      setSaving(true);
      const response = await goalsService.createGoal({
        category: category ?? "physical",
        activity: activity ?? "sleep",
        current_value: 0,
        target_value: targetValue,
        status: "active",
      });

      if (!response.success) {
        throw new Error(response.error || "Could not save sleep goal");
      }

      setSuccessMessage("Sleep goal saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  function format(value: number) {
    return value.toString().padStart(2, "0");
  }

  return (
    <MobileShell>
      <AppHeader title="Sleep" showBack showBell />

      <main className="space-y-6 px-4 py-6 text-center">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <h2 className="text-2xl font-bold">Sleep Goal</h2>

        <div className="text-2xl text-slate-500">Set hours and minutes</div>

        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center">
            <button onClick={() => adjustHour(1)} aria-label="Increase hours">^</button>
            <div className="text-6xl font-bold">{format(hour)}</div>
            <button onClick={() => adjustHour(-1)} aria-label="Decrease hours">v</button>
          </div>

          <div className="text-6xl font-bold">:</div>

          <div className="flex flex-col items-center">
            <button onClick={() => adjustMinute(1)} aria-label="Increase minutes">^</button>
            <div className="text-6xl font-bold">{format(minute)}</div>
            <button onClick={() => adjustMinute(-1)} aria-label="Decrease minutes">v</button>
          </div>
        </div>

        <button
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
