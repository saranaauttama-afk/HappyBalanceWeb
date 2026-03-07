import { useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";

export default function ShareItemsTaskPage() {
  const [shareCount, setShareCount] = useState(4);
  const maxCount = 9;

  function handleAdd() {
    if (shareCount < maxCount) {
      setShareCount((prev) => prev + 1);
    }
  }

  function handleSave() {
    console.log("share items with colleagues", {
      count: shareCount,
    });
  }

  return (
    <MobileShell>
      <AppHeader title="แบ่งปันสิ่งของให้เพื่อนร่วมงาน" showBack showBell />

      <main className="space-y-6 px-4 py-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            แบ่งปันให้ผู้อื่น
          </h1>

          <p className="text-sm text-slate-500">
            บันทึกการแบ่งปันในวันนี้ของคุณ
          </p>
        </div>

        <div className="grid grid-cols-3 justify-items-center gap-4">
          {Array.from({ length: maxCount }).map((_, index) => {
            const filled = index < shareCount;
            const isAddSlot = index === shareCount && shareCount < maxCount;

            return (
              <div
                key={index}
                className={`flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                  filled
                    ? "border-teal-300 bg-teal-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                {filled ? (
                  <span className="text-3xl">🤲</span>
                ) : isAddSlot ? (
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="text-3xl font-bold text-slate-800"
                  >
                    +
                  </button>
                ) : null}
              </div>
            );
          })}
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