import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { goalsService } from "../../services/goals.service";
import { profileService } from "../../services/profile.service";
import type { Goal, User } from "../../types/models";

const categories = [
  { key: "physical", label: "Physical" },
  { key: "mental", label: "Mental" },
  { key: "social", label: "Social" },
  { key: "balance", label: "Balance" },
];

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHomeData() {
    try {
      setLoading(true);
      setError(null);

      const [userResponse, goalsResponse] = await Promise.all([
        profileService.getUser(),
        goalsService.listGoals(),
      ]);

      if (!userResponse.success) {
        throw new Error(userResponse.error || "Failed to load user");
      }

      if (!goalsResponse.success) {
        throw new Error(goalsResponse.error || "Failed to load goals");
      }

      setUser(userResponse.data);
      setGoals(goalsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHomeData();
  }, []);

  const categoryStats = useMemo(() => {
    return categories.map((category) => {
      const items = goals.filter((goal) => goal.category === category.key);

      const score =
        items.length === 0
          ? 0
          : Math.round(
              items.reduce((sum, item) => {
                const current = Number(item.current_value) || 0;
                const target = Number(item.target_value) || 0;
                if (target <= 0) return sum;
                return sum + Math.min(current / target, 1);
              }, 0) /
                items.length *
                100
            );

      return {
        ...category,
        score,
      };
    });
  }, [goals]);

  const recentGoals = useMemo(() => goals.slice(0, 3), [goals]);

  return (
    <MobileShell withBottomNav>
      <AppHeader
        title="Home"
        subtitle={
          loading
            ? "Loading..."
            : user
            ? `Welcome back, ${user.full_name}`
            : "Welcome back"
        }
        showBell
      />

      <main className="space-y-4 px-4 py-4">
        {loading ? (
          <InfoCard>
            <p className="text-sm text-slate-500">Loading dashboard...</p>
          </InfoCard>
        ) : error ? (
          <InfoCard>
            <div className="space-y-3">
              <p className="text-sm text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => void loadHomeData()}
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
                    Wellness Overview
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Your current category progress based on saved goals.
                  </p>
                </div>

                <Link
                  to="/daily-log"
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                >
                  Daily Log
                </Link>
              </div>
            </InfoCard>

            <div className="grid grid-cols-2 gap-4">
              {categoryStats.map((item) => (
                <InfoCard key={item.key}>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {item.score}
                  </p>
                  <p className="text-xs text-slate-400">score</p>
                </InfoCard>
              ))}
            </div>

            <InfoCard>
              <h3 className="text-sm font-semibold text-slate-900">
                Recent Goals
              </h3>

              {recentGoals.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  No goal data yet. Add sample rows in Google Sheets first.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {recentGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="rounded-xl bg-slate-50 px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">
                            {goal.activity}
                          </p>
                          <p className="text-sm text-slate-500">
                            {goal.category} • {goal.current_value}/
                            {goal.target_value}
                          </p>
                        </div>

                        <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                          {goal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>

            <InfoCard>
              <h3 className="text-sm font-semibold text-slate-900">Articles</h3>
              <p className="mt-2 text-sm text-slate-500">
                Static article cards for MVP, real content later.
              </p>
            </InfoCard>
          </>
        )}
      </main>

      <BottomNav />
    </MobileShell>
  );
}