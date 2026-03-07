import { useMemo, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";

function calculateWaterGoal(weightKg: number) {
  if (!weightKg || Number.isNaN(weightKg) || weightKg <= 0) {
    return 0;
  }

  return Math.round(weightKg * 2.2 * 30);
}

export default function WaterGoalSettingsPage() {
  const [weight, setWeight] = useState<string>("");

  const waterGoalMl = useMemo(() => {
    return calculateWaterGoal(Number(weight));
  }, [weight]);

  function handleSave() {
    console.log("save water goal", {
      weightKg: Number(weight),
      waterGoalMl,
    });
  }

  return (
    <MobileShell>
      <AppHeader title="เป้าหมายการดื่มน้ำ" showBack showBell />

      <main className="space-y-6 px-4 py-6">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold text-slate-900">การดื่มน้ำ</h1>
          <p className="text-sm text-slate-600">
            คำนวณปริมาณการดื่มน้ำต่อวันของคุณ
          </p>
        </div>

        <div className="rounded-3xl bg-[#b9dbea] p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-800">
            <span className="rounded-full bg-white px-3 py-2 font-medium">
              น้ำหนักตัว
            </span>

            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="กิโลกรัม"
              className="w-24 rounded-full border border-transparent bg-white px-3 py-2 text-center outline-none"
            />

            <span className="font-semibold">x 2.2 x 30 =</span>

            <span className="rounded-full bg-white px-3 py-2 font-medium">
              มิลลิลิตร
            </span>
          </div>

          <p className="mt-4 text-center text-xs text-slate-700">
            * 1,000 มิลลิลิตร = 1 ลิตร
          </p>
        </div>

        <div className="space-y-3 text-center">
          <p className="text-lg font-medium text-slate-900">
            คุณควรดื่มน้ำในปริมาณที่ไม่น้อยกว่า
          </p>

          <div className="mx-auto flex w-56 items-center justify-center rounded-3xl bg-white px-4 py-5 shadow-sm">
            <span className="text-2xl font-bold text-slate-900">
              {waterGoalMl > 0 ? `${waterGoalMl} มิลลิลิตร` : "มิลลิลิตร"}
            </span>
          </div>

          <p className="text-lg text-slate-900">ใน 1 วัน</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={waterGoalMl <= 0}
          className={`w-full rounded-2xl py-4 font-semibold text-white ${
            waterGoalMl > 0
              ? "bg-[#c6968c]"
              : "cursor-not-allowed bg-slate-300"
          }`}
        >
          บันทึก
        </button>
      </main>
    </MobileShell>
  );
}