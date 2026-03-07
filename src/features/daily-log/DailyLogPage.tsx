import { useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";

export default function DailyLogPage() {
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");

  function handleSave() {
    console.log({ mood, note });
    alert("บันทึกเรียบร้อย");
  }

  return (
    <MobileShell>
      <AppHeader title="บันทึกประจำวัน" showBack />

      <main className="space-y-4 px-4 py-4">

        <InfoCard>
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-900">
              วันนี้คุณรู้สึกอย่างไร
            </h2>

            <input
              type="range"
              min="1"
              max="5"
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full"
            />

            <p className="text-sm text-slate-500">
              ระดับอารมณ์: {mood}
            </p>
          </div>
        </InfoCard>

        <InfoCard>
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-900">
              บันทึกความรู้สึก
            </h2>

            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เขียนสิ่งที่เกิดขึ้นในวันนี้..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>
        </InfoCard>

        <button
          onClick={handleSave}
          className="w-full rounded-2xl bg-rose-300 py-3 font-medium text-white hover:bg-rose-400"
        >
          บันทึก
        </button>

      </main>
    </MobileShell>
  );
}