import { useParams } from "react-router-dom";
import { useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";

type ActivityConfig = {
  title: string;
  description: string;
  checklist: string[];
  goalLabel: string;
};

const ACTIVITY_MAP: Record<string, ActivityConfig> = {
  "food-intake": {
    title: "การรับประทานอาหาร",
    description: "กิจกรรมที่เกี่ยวข้องกับการดูแลพฤติกรรมการรับประทานอาหาร",
    checklist: [
      "รับประทานอาหารให้ครบ 3 มื้อ",
      "ลดอาหารที่มีไขมันและน้ำตาลสูง",
      "รับประทานผักและผลไม้ให้เพียงพอ",
      "ดื่มน้ำสะอาดให้เพียงพอในแต่ละวัน",
    ],
    goalLabel: "เป้าหมายการรับประทานอาหาร",
  },

  rest: {
    title: "การพักผ่อน",
    description: "กิจกรรมที่เกี่ยวข้องกับการพักผ่อนและการนอนหลับ",
    checklist: [
      "จำกัดการใช้หน้าจอก่อนนอน",
      "เข้านอนและตื่นนอนให้เป็นเวลา",
      "หลีกเลี่ยงการดื่มน้ำจำนวนมากก่อนนอน",
      "ไม่งีบหลับนานเกินไปในช่วงเย็น",
      "หลีกเลี่ยงการรับประทานอาหารก่อนนอนหลายชั่วโมง",
    ],
    goalLabel: "Sleep Goal",
  },

  exercise: {
    title: "การออกกำลังกาย",
    description: "กิจกรรมที่เกี่ยวข้องกับการออกกำลังกายเพื่อสุขภาพ",
    checklist: [
      "ออกกำลังกายอย่างน้อยสัปดาห์ละ 3 ครั้ง",
      "เลือกกิจกรรมที่เหมาะสมกับสภาพร่างกาย",
      "อบอุ่นร่างกายก่อนออกกำลังกาย",
      "พักผ่อนให้เพียงพอหลังการออกกำลังกาย",
    ],
    goalLabel: "เป้าหมายการออกกำลังกาย",
  },

  "body-hygiene": {
    title: "การดูแลรักษาความสะอาดของร่างกาย",
    description: "กิจกรรมที่เกี่ยวข้องกับการดูแลสุขอนามัยส่วนบุคคล",
    checklist: [
      "อาบน้ำอย่างสม่ำเสมอ",
      "ล้างมือก่อนรับประทานอาหาร",
      "ดูแลความสะอาดของเสื้อผ้า",
      "รักษาความสะอาดของที่อยู่อาศัย",
    ],
    goalLabel: "เป้าหมายการดูแลสุขอนามัย",
  },
};

export default function GoalActivityPage() {
  const { activity } = useParams<{ activity: string }>();
  const config = ACTIVITY_MAP[activity ?? "rest"] ?? ACTIVITY_MAP.rest;

  const [goal, setGoal] = useState("");

  function handleSave() {
    console.log("save goal", goal);
    alert("บันทึกเป้าหมายเรียบร้อย");
  }

  return (
    <MobileShell>
      <AppHeader title={config.title} showBack showBell />

      <main className="space-y-4 px-4 py-4">
        <InfoCard>
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">
              {config.title}
            </h2>

            <p className="text-sm text-slate-500 leading-6">
              {config.description}
            </p>
          </div>
        </InfoCard>

        <InfoCard>
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">
              แนวทางการปฏิบัติ
            </h3>

            <ul className="space-y-2 text-sm text-slate-600">
              {config.checklist.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </InfoCard>

        <InfoCard>
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">
              {config.goalLabel}
            </h3>

            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="ตั้งเป้าหมายของคุณ"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />

            <button
              onClick={handleSave}
              className="w-full rounded-2xl bg-rose-300 px-4 py-3 font-medium text-white hover:bg-rose-400"
            >
              บันทึก
            </button>
          </div>
        </InfoCard>
      </main>
    </MobileShell>
  );
}