import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { goalsService } from "../../services/goals.service";
import type { Goal } from "../../types/models";

const categoryConfig = [
  { key: "physical", label: "Physical Wellness" },
  { key: "mental", label: "Mental Wellness" },
  { key: "social", label: "Social Wellness" },
  { key: "balance", label: "Work-Life Balance" },
];

type CategorySummary = {
  key: string;
  label: string;
  count: number;
  progress: number;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadGoals() {
    try {
      setLoading(true);
      setError(null);

      const response = await goalsService.listGoals();

      if (!response.success) {
        throw new Error(response.error || "Failed to load goals");
      }

      setGoals(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGoals();
  }, []);

  const summaries = useMemo<CategorySummary[]>(() => {
    return categoryConfig.map((category) => {
      const items = goals.filter((goal) => goal.category === category.key);

      const progress =
        items.length === 0
          ? 0
          : Math.round(
              (items.reduce((sum, item) => {
                const current = Number(item.current_value) || 0;
                const target = Number(item.target_value) || 0;
                if (target <= 0) return sum;
                return sum + Math.min(current / target, 1);
              }, 0) /
                items.length) *
                100
            );

      return {
        key: category.key,
        label: category.label,
        count: items.length,
        progress,
      };
    });
  }, [goals]);

  const overallProgress =
    summaries.length > 0
      ? Math.round(
          summaries.reduce((sum, item) => sum + item.progress, 0) /
            summaries.length
        )
      : 0;

  return (
    <MobileShell withBottomNav>
      <AppHeader title="Goals" showBell />

      <main className="space-y-4 px-4 py-4">
        {loading ? (
          <InfoCard>
            <p className="text-sm text-slate-500">Loading goals...</p>
          </InfoCard>
        ) : error ? (
          <InfoCard>
            <div className="space-y-3">
              <p className="text-sm text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => void loadGoals()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Retry
              </button>
            </div>
          </InfoCard>
        ) : (
          <>
            <InfoCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Balance Summary
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Progress across your wellness categories.
                  </p>
                </div>

                <Link
                  to="/goals/create"
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                >
                  Create Goal
                </Link>
              </div>

              <div className="mt-4 h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-slate-900 transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Overall progress: {overallProgress}%
              </p>
            </InfoCard>

            {summaries.map((category) => (
              <Link
                key={category.key}
                to={`/goals/${category.key}`}
                className="block"
              >
                <InfoCard>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">
                        {category.label}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {category.count} activities • {category.progress}%
                        progress
                      </p>

                      <div className="mt-3 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-slate-900 transition-all"
                          style={{ width: `${category.progress}%` }}
                        />
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      View
                    </span>
                  </div>
                </InfoCard>
              </Link>
            ))}

            {goals.length === 0 ? (
              <InfoCard>
                <p className="text-sm text-slate-500">
                  No goals yet. Create your first goal to get started.
                </p>
              </InfoCard>
            ) : null}
          </>
        )}
      </main>

      <BottomNav />
    </MobileShell>
  );
}