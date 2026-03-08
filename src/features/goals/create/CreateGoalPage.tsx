import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";
import { goalsService } from "../../../services/goals.service";

export default function CreateGoalPage() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("physical");
  const [activity, setActivity] = useState("");
  const [target, setTarget] = useState("8");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedActivity = activity.trim();
    const targetValue = Number(target);

    if (!normalizedActivity) {
      setError("Please enter an activity");
      return;
    }

    if (!Number.isFinite(targetValue) || targetValue <= 0) {
      setError("Target must be a number greater than 0");
      return;
    }

    try {
      setSaving(true);
      const response = await goalsService.createGoal({
        category,
        activity: normalizedActivity,
        current_value: 0,
        target_value: targetValue,
        status: "active",
      });

      if (!response.success) {
        throw new Error(response.error || "Could not save goal");
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div>
              <label className="text-sm font-medium text-slate-700">Category</label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="physical">Physical</option>
                <option value="mental">Mental</option>
                <option value="social">Social</option>
                <option value="balance">Balance</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Activity</label>

              <input
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Example: exercise"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Target</label>

              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                type="number"
                min={1}
                step="0.5"
                placeholder="Example: 8"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full rounded-2xl py-3 font-medium text-white ${
                saving ? "bg-slate-400" : "bg-rose-300 hover:bg-rose-400"
              }`}
            >
              {saving ? "Saving..." : "Save Goal"}
            </button>
          </form>
        </InfoCard>
      </main>
    </MobileShell>
  );
}
