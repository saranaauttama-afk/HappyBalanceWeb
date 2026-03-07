import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import BottomNav from "../../../components/layout/BottomNav";
import MobileShell from "../../../components/layout/MobileShell";
import TimeWheelPicker from "../../../components/ui/TimeWheelPicker";

type GoalSettingConfig = {
  categoryTitle: string;
  pageTitle: string;
  illustration: string;
  saveLabel: string;
};

const CONFIG_MAP: Record<string, GoalSettingConfig> = {
  rest: {
    categoryTitle: "การนอนหลับ",
    pageTitle: "เป้าหมายการนอนหลับ",
    illustration: "💤",
    saveLabel: "บันทึก",
  },
  "food-intake": {
    categoryTitle: "การรับประทานอาหาร",
    pageTitle: "เป้าหมายการรับประทานอาหาร",
    illustration: "🍽️",
    saveLabel: "บันทึก",
  },
  exercise: {
    categoryTitle: "การออกกำลังกาย",
    pageTitle: "เป้าหมายการออกกำลังกาย",
    illustration: "🏃",
    saveLabel: "บันทึก",
  },
  "body-hygiene": {
    categoryTitle: "การดูแลรักษาความสะอาดของร่างกาย",
    pageTitle: "เป้าหมายการดูแลสุขอนามัย",
    illustration: "🧼",
    saveLabel: "บันทึก",
  },
};

function getDefaultTimeByActivity(activity?: string) {
  if (activity === "rest") {
    return { hour: 8, minute: 0 };
  }

  return { hour: 8, minute: 0 };
}

export default function GoalSettingPage() {
  const navigate = useNavigate();
  const { category, activity } = useParams<{
    category: string;
    activity: string;
  }>();

  const config =
    CONFIG_MAP[activity ?? "rest"] ?? CONFIG_MAP.rest;

  const defaultTime = useMemo(
    () => getDefaultTimeByActivity(activity),
    [activity]
  );

  const [hour, setHour] = useState(defaultTime.hour);
  const [minute, setMinute] = useState(defaultTime.minute);

  function handleSave() {
    const payload = {
      category,
      activity,
      goalTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    };

    console.log("save goal setting", payload);
    navigate(`/goals/${category}/${activity}`);
  }

  return (
    <MobileShell withBottomNav>
      <div className="relative min-h-full overflow-hidden bg-[linear-gradient(180deg,#f9f2f6_0%,#eef7f6_100%)]">
        <AppHeader title={config.categoryTitle} showBack showBell />

        <main className="px-4 pb-6 pt-2">
          <div className="mx-auto max-w-sm">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {config.pageTitle}
              </h1>
            </div>

            <div className="mb-6 flex justify-center">
              <div className="flex h-44 w-44 items-center justify-center rounded-full bg-white/60 text-8xl shadow-sm ring-1 ring-white/70">
                {config.illustration}
              </div>
            </div>

            <div className="mb-8">
              <TimeWheelPicker
                hour={hour}
                minute={minute}
                onHourChange={setHour}
                onMinuteChange={setMinute}
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-2xl bg-[#c6968c] px-4 py-4 text-base font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              {config.saveLabel}
            </button>
          </div>
        </main>

        <BottomNav />
      </div>
    </MobileShell>
  );
}