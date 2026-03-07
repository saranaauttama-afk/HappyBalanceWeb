import { useState } from "react";
import { useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { MENTAL_TASKS } from "../tasks/mentalTasks";

export default function MentalTaskPage() {
  const { task } = useParams<{ task?: string }>();
  const config = MENTAL_TASKS.find((item) => item.slug === task);

  const [score, setScore] = useState<number>(3);

  if (!config) {
    return (
      <MobileShell>
        <AppHeader title="ไม่พบกิจกรรม" showBack />
        <main className="p-6 text-center text-slate-500">
          ไม่พบกิจกรรมที่ต้องการ
        </main>
      </MobileShell>
    );
  }

  function handleSave() {
    console.log("mental task result", {
      task,
      score,
    });
  }

  return (
    <MobileShell>
      <AppHeader title={config.label} showBack showBell />

      <main className="space-y-6 px-4 py-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">{config.label}</h1>
          <p className="mt-2 text-sm text-slate-500">
            กรุณาประเมินระดับของคุณในวันนี้
          </p>

          <div className="mt-6">
            <input
              type="range"
              min={1}
              max={5}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-3 text-center text-lg font-semibold text-slate-900">
              ระดับ {score} / 5
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-2xl bg-[#c6968c] py-4 font-semibold text-white"
        >
          บันทึก
        </button>
      </main>
    </MobileShell>
  );
}