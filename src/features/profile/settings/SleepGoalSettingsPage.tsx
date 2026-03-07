import { useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function clampHour(value: number) {
  if (value < 0) return 23;
  if (value > 23) return 0;
  return value;
}

function clampMinute(value: number) {
  if (value < 0) return 59;
  if (value > 59) return 0;
  return value;
}

type TimeAdjusterProps = {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

function TimeAdjuster({
  value,
  onIncrease,
  onDecrease,
}: TimeAdjusterProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onIncrease}
        className="rounded px-1 text-xs text-rose-300"
      >
        ▲
      </button>
      <span className="min-w-[28px] text-center text-2xl font-bold text-slate-900">
        {pad(value)}
      </span>
      <button
        type="button"
        onClick={onDecrease}
        className="rounded px-1 text-xs text-rose-300"
      >
        ▼
      </button>
    </div>
  );
}

export default function SleepGoalSettingsPage() {
  const [sleepHour, setSleepHour] = useState(8);
  const [sleepMinute, setSleepMinute] = useState(0);

  function handleSave() {
    console.log("save sleep goal", {
      sleepGoalHour: sleepHour,
      sleepGoalMinute: sleepMinute,
    });
  }

  return (
    <MobileShell>
      <AppHeader title="เป้าหมายการนอนหลับ" showBack showBell />

      <main className="space-y-5 px-4 py-6">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">
              เป้าหมายการนอนหลับ
            </h1>
            <p className="text-sm text-slate-600">
              กำหนดเป้าหมายจำนวนชั่วโมงการนอนหลับต่อวัน
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <TimeAdjuster
              value={sleepHour}
              onIncrease={() => setSleepHour((prev) => clampHour(prev + 1))}
              onDecrease={() => setSleepHour((prev) => clampHour(prev - 1))}
            />

            <span className="text-2xl font-bold text-slate-900">:</span>

            <TimeAdjuster
              value={sleepMinute}
              onIncrease={() =>
                setSleepMinute((prev) => clampMinute(prev + 1))
              }
              onDecrease={() =>
                setSleepMinute((prev) => clampMinute(prev - 1))
              }
            />
          </div>

          <p className="mt-4 text-center text-sm text-slate-500">
            เป้าหมายปัจจุบัน {pad(sleepHour)}:{pad(sleepMinute)} ชั่วโมง
          </p>
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