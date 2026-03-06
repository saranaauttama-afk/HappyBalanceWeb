import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";
import { goalsService } from "../../../services/goals.service";

export default function CreateGoalPage() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("physical");
  const [activity, setActivity] = useState("sleep");
  const [currentValue, setCurrentValue] = useState("0");
  const [targetValue, setTargetValue] = useState("8");
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const response = await goalsService.createGoal({
        category,
        activity,
        current_value: Number(currentValue),
        target_value: Number(targetValue),
        status,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create goal");
      }

      navigate("/goals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <AppHeader title="Create Goal" showBack />

      <main className="space-y-4 px-4 py-4">
        <InfoCard>
          <h2 className="text-base font-semibold text-slate-900">
            New Goal
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create a goal entry for a wellness activity.
          </p>
        </InfoCard>

        <InfoCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              >
                <option value="physical">physical</option>
                <option value="mental">mental</option>
                <option value="social">social</option>
                <option value="balance">balance</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Activity
              </label>
              <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="sleep"
              />
            </div>

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
                onChange={(e) => setStatus(e.target.value)}
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
              {saving ? "Creating..." : "Create Goal"}
            </button>
          </form>
        </InfoCard>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </main>
    </MobileShell>
  );
}