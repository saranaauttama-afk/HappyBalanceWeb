import { Link } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { REST_TASKS } from "../tasks/restTasks";

export default function GoalActivityPage() {
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