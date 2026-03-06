import { Link, useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";

const CATEGORY_MAP: Record<string, { title: string; activities: string[] }> = {
  physical: {
    title: "Physical Wellness",
    activities: ["Sleep", "Nutrition", "Exercise", "Self Care"],
  },
  mental: {
    title: "Mental Wellness",
    activities: ["Breathing", "Mindfulness", "Reflection", "Rest"],
  },
  social: {
    title: "Social Wellness",
    activities: ["Family", "Friends", "Communication", "Community"],
  },
  balance: {
    title: "Work-Life Balance",
    activities: ["Planning", "Boundaries", "Recovery", "Focus"],
  },
};

export default function GoalCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const config = CATEGORY_MAP[category ?? "physical"] ?? CATEGORY_MAP.physical;

  return (
    <MobileShell>
      <AppHeader title={config.title} showBack showBell />

      <main className="space-y-4 px-4 py-4">
        <InfoCard>
          <h2 className="text-base font-semibold text-slate-900">
            Category Progress
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            View available activities and track progress in this area.
          </p>

          <div className="mt-4 h-3 rounded-full bg-slate-100">
            <div className="h-3 w-[58%] rounded-full bg-slate-900" />
          </div>
        </InfoCard>

        {config.activities.map((activity) => (
          <Link
            key={activity}
            to={`/goals/${category}/${activity.toLowerCase().replace(/\s+/g, "-")}`}
            className="block"
          >
            <InfoCard>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{activity}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Open activity details and update progress.
                  </p>
                </div>
                <span className="text-sm text-slate-400">›</span>
              </div>
            </InfoCard>
          </Link>
        ))}
      </main>
    </MobileShell>
  );
}