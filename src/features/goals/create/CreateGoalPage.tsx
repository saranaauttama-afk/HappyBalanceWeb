import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";

export default function CreateGoalPage() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("physical");
  const [activity, setActivity] = useState("");
  const [target, setTarget] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log({ category, activity, target });
    navigate("/goals");
  }

  return (
    <MobileShell>
      <AppHeader title="เพิ่มเป้าหมาย" showBack />

      <main className="space-y-4 px-4 py-4">
        <InfoCard>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-sm font-medium text-slate-700">
                หมวดหมู่
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="physical">สุขภาวะทางกาย</option>
                <option value="mental">สุขภาวะทางใจ</option>
                <option value="social">สุขภาวะทางสังคม</option>
                <option value="balance">สมดุลชีวิต</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                กิจกรรม
              </label>

              <input
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="เช่น การออกกำลังกาย"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                เป้าหมาย
              </label>

              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="เช่น 3 ครั้งต่อสัปดาห์"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-rose-300 py-3 font-medium text-white hover:bg-rose-400"
            >
              บันทึกเป้าหมาย
            </button>

          </form>
        </InfoCard>
      </main>
    </MobileShell>
  );
}