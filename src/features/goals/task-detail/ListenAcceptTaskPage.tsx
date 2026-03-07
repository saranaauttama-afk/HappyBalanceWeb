import { useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";

export default function ListenAcceptTaskPage() {
  const [listenCount, setListenCount] = useState(5);
  const maxCount = 9;

  function handleAdd() {
    if (listenCount < maxCount) {
      setListenCount((prev) => prev + 1);
    }
  }

  function handleSave() {
    console.log("listen and accept", {
      count: listenCount,
    });
  }

  return (
    <MobileShell>
      <AppHeader title="ฟังผู้อื่นพูดและยอมรับในความคิดเห็นของผู้อื่น" showBack showBell />

      <main className="space-y-6 px-4 py-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            การรับฟังและยอมรับ
          </h1>

          <p className="text-sm text-slate-500">
            บันทึกการรับฟังผู้อื่นในวันนี้ของคุณ
          </p>
        </div>

        <div className="grid grid-cols-3 justify-items-center gap-4">
          {Array.from({ length: maxCount }).map((_, index) => {
            const filled = index < listenCount;
            const isAddSlot = index === listenCount && listenCount < maxCount;

            return (
              <div
                key={index}
                className={`flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                  filled
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                {filled ? (
                  <span className="text-3xl">👂</span>
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