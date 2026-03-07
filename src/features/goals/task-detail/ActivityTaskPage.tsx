import { useState } from "react";
import { useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { REST_TASKS, type TaskConfig } from "../tasks/restTasks";

type TaskValue = number | boolean | null;

type SleepLogItem = {
  day: string;
  hour: number;
  minute: number;
};

const DEFAULT_SLEEP_LOGS: SleepLogItem[] = [
  { day: "วันจันทร์", hour: 8, minute: 0 },
  { day: "วันอังคาร", hour: 8, minute: 0 },
  { day: "วันพุธ", hour: 6, minute: 40 },
  { day: "วันพฤหัสบดี", hour: 8, minute: 0 },
  { day: "วันศุกร์", hour: 7, minute: 0 },
];

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
      <span className="min-w-[24px] text-center text-xl font-bold text-slate-900">
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

function WaterCup({ filled }: { filled: boolean }) {
  return (
    <div
      className={`h-16 w-10 rounded-b-xl rounded-t-md border-2 ${
        filled
          ? "border-sky-400 bg-sky-200"
          : "border-slate-300 bg-white"
      }`}
    />
  );
}

export default function ActivityTaskPage() {
  const { task } = useParams<{ task?: string }>();
  const config = REST_TASKS.find((t) => t.slug === task);

  const [value, setValue] = useState<TaskValue>(null);
  const [sleepLogs, setSleepLogs] = useState<SleepLogItem[]>(DEFAULT_SLEEP_LOGS);
  const [waterCount, setWaterCount] = useState<number>(3);

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

  function updateSleepHour(index: number, nextHour: number) {
    setSleepLogs((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, hour: clampHour(nextHour) } : item
      )
    );
  }

  function updateSleepMinute(index: number, nextMinute: number) {
    setSleepLogs((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, minute: clampMinute(nextMinute) } : item
      )
    );
  }

  function renderGenericInput(currentConfig: TaskConfig) {
    if (currentConfig.type === "number") {
      return (
        <input
          type="number"
          placeholder="กรอกจำนวนชั่วโมง"
          className="w-full rounded-xl border p-3"
          value={typeof value === "number" ? value : ""}
          onChange={(e) => {
            const nextValue = e.target.value;
            setValue(nextValue === "" ? null : Number(nextValue));
          }}
        />
      );
    }

    return (
      <div className="flex gap-4">
        <button
          type="button"
          className={`flex-1 rounded-xl p-3 ${
            value === true ? "bg-green-400 text-white" : "bg-slate-100"
          }`}
          onClick={() => setValue(true)}
        >
          ทำได้
        </button>

        <button
          type="button"
          className={`flex-1 rounded-xl p-3 ${
            value === false ? "bg-rose-400 text-white" : "bg-slate-100"
          }`}
          onClick={() => setValue(false)}
        >
          ยังไม่ได้
        </button>
      </div>
    );
  }

  function handleSave() {
    if (task === "sleep") {
      console.log("sleep logs", sleepLogs);
      return;
    }

    if (task === "drink-water") {
      console.log("drink water", {
        glasses: waterCount,
        ml: waterCount * 350,
      });
      return;
    }

    if (value === null) return;

    console.log("task result", {
      task,
      value,
    });
  }

  if (task === "sleep") {
    return (
      <MobileShell>
        <AppHeader title="การนอนหลับ" showBack showBell />

        <main className="space-y-4 px-4 py-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">
              บันทึกการนอนหลับ
            </h1>
            <p className="text-sm text-slate-600">
              เป้าหมายในการนอนหลับวันละ 8 ชั่วโมง
            </p>
          </div>

          <div className="space-y-3">
            {sleepLogs.map((item, index) => (
              <div
                key={item.day}
                className="rounded-2xl bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-700">
                    {item.day} นอนหลับเป็นระยะเวลา
                  </p>

                  <div className="flex items-center gap-2">
                    <TimeAdjuster
                      value={item.hour}
                      onIncrease={() => updateSleepHour(index, item.hour + 1)}
                      onDecrease={() => updateSleepHour(index, item.hour - 1)}
                    />

                    <span className="text-xl font-bold text-slate-900">:</span>

                    <TimeAdjuster
                      value={item.minute}
                      onIncrease={() =>
                        updateSleepMinute(index, item.minute + 1)
                      }
                      onDecrease={() =>
                        updateSleepMinute(index, item.minute - 1)
                      }
                    />

                    <span className="text-sm text-slate-700">ชม.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-2xl bg-[#c6968c] py-4 font-semibold text-white"
          >
            ยืนยัน
          </button>
        </main>
      </MobileShell>
    );
  }

  if (task === "drink-water") {
    const totalCups = 15;

    return (
      <MobileShell>
        <AppHeader title="การดื่มน้ำ" showBack showBell />

        <main className="space-y-5 px-4 py-6">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold text-slate-900">การดื่มน้ำ</h1>
            <p className="text-sm text-slate-600">
              บันทึกการดื่มน้ำของคุณในวันนี้
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setWaterCount((prev) => Math.max(prev - 1, 0))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-700"
              >
                –
              </button>

              <button
                type="button"
                onClick={() =>
                  setWaterCount((prev) => Math.min(prev + 1, totalCups))
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-700"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-5 gap-4 justify-items-center">
              {Array.from({ length: totalCups }).map((_, index) => (
                <WaterCup key={index} filled={index < waterCount} />
              ))}
            </div>

            <div className="mt-5 text-center text-sm text-slate-600">
              <span className="font-medium">ดื่มแล้ว {waterCount} แก้ว</span>{" "}
              = {waterCount * 350} มิลลิลิตร
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

  return (
    <MobileShell>
      <AppHeader title={config.label} showBack showBell />

      <main className="space-y-6 px-4 py-6">
        <div className="rounded-2xl bg-white p-6 shadow">
          {renderGenericInput(config)}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-xl bg-rose-400 py-3 font-semibold text-white"
        >
          บันทึก
        </button>
      </main>
    </MobileShell>
  );
}