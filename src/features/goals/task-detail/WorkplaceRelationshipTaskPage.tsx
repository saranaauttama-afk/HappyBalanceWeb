import { useState } from "react";
import { useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { WORKPLACE_RELATIONSHIP_TASKS } from "../tasks/workplaceRelationshipTasks";

export default function WorkplaceRelationshipTaskPage() {
  const { task } = useParams<{ task?: string }>();
  const config = WORKPLACE_RELATIONSHIP_TASKS.find((item) => item.slug === task);
  const [done, setDone] = useState<boolean | null>(null);

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
    console.log("workplace relationship task", {
      task,
      done,
    });
  }

  return (
    <MobileShell>
      <AppHeader title={config.label} showBack showBell />

      <main className="space-y-6 px-4 py-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">{config.label}</h1>
          <p className="mt-2 text-sm text-slate-500">
            กรุณาบันทึกว่าคุณทำกิจกรรมนี้ได้หรือไม่
          </p>

          <div className="mt-6 flex gap-4">
            <button
              type="button"
              className={`flex-1 rounded-2xl p-4 font-medium ${
                done === true
                  ? "bg-green-400 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
              onClick={() => setDone(true)}
            >
              ทำได้
            </button>

            <button
              type="button"
              className={`flex-1 rounded-2xl p-4 font-medium ${
                done === false
                  ? "bg-rose-400 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
              onClick={() => setDone(false)}
            >
              ยังไม่ได้
            </button>
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