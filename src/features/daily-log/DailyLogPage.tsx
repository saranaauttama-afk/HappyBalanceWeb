import { useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { logsService } from "../../services/logs.service";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyLogPage() {
  const [logDate, setLogDate] = useState(getTodayDate());
  const [mood, setMood] = useState("calm");
  const [energy, setEnergy] = useState("7");
  const [stress, setStress] = useState("3");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage("");

      const response = await logsService.createDailyLog({
        log_date: logDate,
        mood,
        energy: Number(energy),
        stress: Number(stress),
        note,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to save daily log");
      }

      setSuccessMessage("Daily log saved successfully.");
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <AppHeader title="Daily Log" showBack />

      <main className="space-y-4 px-4 py-4">
        <InfoCard>
          <h2 className="text-base font-semibold text-slate-900">
            Daily Check-In
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Record your mood, energy, stress, and notes for today.
          </p>
        </InfoCard>

        <InfoCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mood
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              >
                <option value="calm">calm</option>
                <option value="happy">happy</option>
                <option value="tired">tired</option>
                <option value="stressed">stressed</option>
                <option value="sad">sad</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Energy (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Stress (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={stress}
                onChange={(e) => setStress(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="How was your day?"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full rounded-2xl px-4 py-3 font-medium text-white ${
                saving ? "bg-slate-400" : "bg-slate-900"
              }`}
            >
              {saving ? "Saving..." : "Save Daily Log"}
            </button>
          </form>
        </InfoCard>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}
      </main>
    </MobileShell>
  );
}