import { useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";

type BubbleType = "thanks" | "sorry";

export default function ThanksSorryTaskPage() {
  const [items, setItems] = useState<BubbleType[]>(["thanks", "sorry"]);
  const maxCount = 9;

  function handleAdd() {
    if (items.length >= maxCount) return;

    setItems((prev) => [...prev, prev.length % 2 === 0 ? "thanks" : "sorry"]);
  }

  function handleSave() {
    console.log("thanks sorry task", {
      items,
    });
  }

  return (
    <MobileShell>
      <AppHeader title="พูดขอบคุณ หรือขอโทษผู้อื่น" showBack showBell />

      <main className="space-y-6 px-4 py-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            “ขอบคุณ” ให้ได้
            <br />
            “ขอโทษ” ให้เป็น
          </h1>

          <p className="text-sm text-slate-500">
            บันทึกการขอบคุณหรือขอโทษในวันนี้ของคุณ
          </p>
        </div>

        <div className="grid grid-cols-3 justify-items-center gap-4">
          {Array.from({ length: maxCount }).map((_, index) => {
            const item = items[index];
            const isAddSlot = index === items.length && items.length < maxCount;

            return (
              <div
                key={index}
                className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-200 bg-white"
              >
                {item === "thanks" ? (
                  <span className="text-xs font-bold text-indigo-500">
                    Thank
                    <br />
                    you
                  </span>
                ) : item === "sorry" ? (
                  <span className="text-lg font-bold text-yellow-500">
                    Sorry
                  </span>
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