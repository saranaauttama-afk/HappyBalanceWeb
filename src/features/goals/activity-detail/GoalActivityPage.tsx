import { Link, useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { REST_TASKS } from "../tasks/restTasks";
import { MENTAL_TASKS } from "../tasks/mentalTasks";
import { POSITIVE_THINKING_TASKS } from "../tasks/positiveThinkingTasks";

function getMentalTitle(activity?: string) {
  if (activity === "positive-thinking") return "การมองโลกในแง่บวก";
  if (activity === "stress-level") return "ระดับความเครียด";
  if (activity === "life-satisfaction") return "ระดับความพึงพอใจในชีวิต";
  if (activity === "self-worth") return "การรู้สึกมีคุณค่าในตนเอง";
  return "กิจกรรม";
}

export default function GoalActivityPage() {
  const { category, activity } = useParams<{
    category: string;
    activity: string;
  }>();

  if (category === "physical" && activity === "rest") {
    return (
      <MobileShell>
        <AppHeader title="การพักผ่อน" showBack showBell />

        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🛏️</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-300 text-4xl font-bold text-slate-900">
                7
              </div>
              <span className="text-4xl">🛏️</span>
            </div>
          </div>

          <div className="space-y-3">
            {REST_TASKS.map((task) => (
              <Link
                key={task.slug}
                to={`/goals/physical/rest/${task.slug}`}
                className={`block rounded-2xl border px-4 py-4 text-center text-base font-medium ${
                  task.completed
                    ? "border-green-400 bg-green-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {task.label}
              </Link>
            ))}
          </div>
        </main>
      </MobileShell>
    );
  }

  if (category === "mental" && activity === "positive-thinking") {
    return (
      <MobileShell>
        <AppHeader title="การมองโลกในแง่บวก" showBack showBell />

        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌤️</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-300 text-4xl font-bold text-slate-900">
                6
              </div>
              <span className="text-4xl">🌤️</span>
            </div>
          </div>

          <div className="space-y-3">
            {POSITIVE_THINKING_TASKS.map((task) => {
  const path =
    task.slug === "smile-when-disappointed"
      ? "/goals/mental/positive-thinking/smile-when-disappointed"
      : `/goals/mental/positive-thinking/${task.slug}`;

  return (
    <Link
      key={task.slug}
      to={path}
      className={`block rounded-2xl border px-4 py-4 text-center text-base font-medium ${
        task.completed
          ? "border-green-400 bg-green-50 text-slate-900"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      {task.label}
    </Link>
  );
})}
          </div>
        </main>
      </MobileShell>
    );
  }

  if (category === "mental") {
    const currentTask = MENTAL_TASKS.find((task) => task.slug === activity);

    return (
      <MobileShell>
        <AppHeader title={getMentalTitle(activity)} showBack showBell />

        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🧠</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pink-200 text-4xl font-bold text-slate-900">
                6
              </div>
              <span className="text-4xl">🧠</span>
            </div>
          </div>

          {currentTask ? (
            <Link
              to={`/goals/mental/${currentTask.slug}/task`}
              className={`block rounded-2xl border px-4 py-4 text-center text-base font-medium ${
                currentTask.completed
                  ? "border-pink-300 bg-pink-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {currentTask.label}
            </Link>
          ) : (
            <div className="rounded-2xl bg-white px-4 py-6 text-center text-slate-500 shadow-sm">
              ยังไม่มีข้อมูลกิจกรรม
            </div>
          )}
        </main>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <AppHeader title="กิจกรรม" showBack showBell />
      <main className="px-4 py-6 text-center text-slate-500">
        ยังไม่มีข้อมูลกิจกรรม
      </main>
    </MobileShell>
  );
}