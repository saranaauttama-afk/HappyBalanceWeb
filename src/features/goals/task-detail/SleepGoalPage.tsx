import { useState } from "react"
import AppHeader from "../../../components/layout/AppHeader"
import MobileShell from "../../../components/layout/MobileShell"

export default function SleepGoalPage() {

  const [hour, setHour] = useState(8)
  const [minute, setMinute] = useState(0)

  function adjustHour(delta: number) {
    setHour((prev) => (prev + delta + 24) % 24)
  }

  function adjustMinute(delta: number) {
    setMinute((prev) => (prev + delta + 60) % 60)
  }

  function handleSave() {
    console.log("sleep goal", {
      hour,
      minute
    })
  }

  function format(value: number) {
    return value.toString().padStart(2, "0")
  }

  return (
    <MobileShell>

      <AppHeader title="การนอนหลับ" showBack showBell />

      <main className="space-y-6 px-4 py-6 text-center">

        <h2 className="text-2xl font-bold">
          เป้าหมายการนอนหลับ
        </h2>

        <div className="flex justify-center text-7xl">
          💤
        </div>

        <div className="flex justify-center items-center gap-6">

          <div className="flex flex-col items-center">
            <button onClick={() => adjustHour(1)}>▲</button>
            <div className="text-6xl font-bold">{format(hour)}</div>
            <button onClick={() => adjustHour(-1)}>▼</button>
          </div>

          <div className="text-6xl font-bold">:</div>

          <div className="flex flex-col items-center">
            <button onClick={() => adjustMinute(1)}>▲</button>
            <div className="text-6xl font-bold">{format(minute)}</div>
            <button onClick={() => adjustMinute(-1)}>▼</button>
          </div>

        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-xl bg-rose-400 py-3 font-semibold text-white"
        >
          บันทึก
        </button>

      </main>

    </MobileShell>
  )
}