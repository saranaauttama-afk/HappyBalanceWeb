import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";
import { goalsService } from "../../../services/goals.service";
import type { Goal } from "../../../types/models";

function formatSlug(value?: string) {
  if (!value) return "";
  return value.toLowerCase().replace(/\s+/g, "-");
}

function formatTitle(value?: string) {
  if (!value) return "Activity";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function GoalActivityPage() {
  const { category, activity } = useParams<{
    category: string;
    activity: string;
  }>();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [currentValue, setCurrentValue] = useState("0");
  const [targetValue, setTargetValue] = useState("8");
  const [status, setStatus] = useState<"active" | "completed" | "paused">(
    "active"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  async function loadGoal() {
    try {
      setLoading(true);
      setError(null);

      const response = await goalsService.listGoals();

      if (!response.success) {
        throw new Error(response.error || "Failed to load goals");
      }

      const matchedGoal =
        (response.data || []).find(
          (item) =>
            item.category === category &&
            formatSlug(item.activity) === formatSlug(activity)
        ) || null;

      setGoal(matchedGoal);

      if (matchedGoal) {
        setCurrentValue(String(matchedGoal.current_value ?? 0));
        setTargetValue(String(matchedGoal.target_value ?? 0));
        setStatus(
          (matchedGoal.status as "active" | "completed" | "paused") || "active"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGoal();
  }, [category, activity]);

  const progress = useMemo(() => {
    const current = Number(currentValue) || 0;
    const target = Number(targetValue) || 0;
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }, [currentValue, targetValue]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!goal) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage("");

      const response = await goalsService.updateGoal({
        id: goal.id,
        current_value: Number(currentValue),
        target_value: Number(targetValue),
        status,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to update goal");
      }

      setGoal(response.data);
      setSuccessMessage("Activity updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <AppHeader title={formatTitle(activity)} showBack showBell />

      <main className="space-y-4 px-4 py-4">
        {loading ? (
          <InfoCard>
            <p className="text-sm text-slate-500">Loading activity...</p>
          </InfoCard>
        ) : error ? (
          <InfoCard>
            <div className="space-y-3">
              <p className="text-sm text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => void loadGoal()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Retry
              </button>
            </div>
          </InfoCard>
        ) : !goal ? (
          <InfoCard>
            <p className="text-sm text-slate-500">
              No goal found for this activity. Add a matching row in Google
              Sheets first.
            </p>
          </InfoCard>
        ) : (
          <>
            <InfoCard>
              <h2 className="text-base font-semibold text-slate-900">
                Current Activity
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Category: {goal.category}
              </p>

              <div className="mt-4 h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-slate-900 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Progress: {progress}%
              </p>
            </InfoCard>

            <InfoCard>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Current Value
                  </label>
                  <input
                    type="number"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as "active" | "completed" | "paused"
                      )
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  >
                    <option value="active">active</option>
                    <option value="completed">completed</option>
                    <option value="paused">paused</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full rounded-2xl px-4 py-3 font-medium text-white ${
                    saving ? "bg-slate-400" : "bg-slate-900"
                  }`}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </form>
            </InfoCard>

            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}
          </>
        )}
      </main>
    </MobileShell>
  );
}