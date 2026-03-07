import { useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";

export default function SmileTaskPage() {

  const [smileCount, setSmileCount] = useState(1);

  const maxSmile = 9;

  function handleAdd() {
    if (smileCount < maxSmile) {
      setSmileCount(smileCount + 1);
    }
  }

  function handleSave() {
    console.log("smile today", smileCount);
  }

  return (
    <MobileShell>
      <AppHeader title="ยิ้มเสมอเมื่อเจอเรื่องน่าผิดหวัง" showBack showBell />

      <main className="space-y-6 px-4 py-6">

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            วันนี้คุณยิ้มแล้วหรือยัง
          </h1>

          <p className="text-sm text-slate-500">
            บันทึกรอยยิ้มของคุณในวันนี้
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 justify-items-center">

          {Array.from({ length: maxSmile }).map((_, index) => {

            const filled = index < smileCount;

            return (
              <div
                key={index}
                className={`flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                  filled
                    ? "border-yellow-400 bg-yellow-100"
                    : "border-slate-200 bg-white"
                }`}
              >
                {index === smileCount - 1 ? (
                  <button
                    onClick={handleAdd}
                    className="text-2xl font-bold text-slate-800"
                  >
                    +
                  </button>
                ) : filled ? (
                  <span className="text-3xl">😊</span>
                ) : null}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-2xl bg-[#c6968c] py-4 font-semibold text-white"
        >
          บันทึก
        </button>

      </main>
    </MobileShell>
  );
}