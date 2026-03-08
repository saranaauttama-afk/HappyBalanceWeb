import { useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { logsService } from "../../services/logs.service";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function mapMoodScoreToText(value: number) {
  if (value >= 5) return "great";
  if (value >= 4) return "good";
  if (value >= 3) return "neutral";
  if (value >= 2) return "tired";
  return "low";
}

export default function DailyLogPage() {
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSave() {
    setError(null);
    setSuccessMessage("");

    try {
      setSaving(true);
      const response = await logsService.createDailyLog({
        log_date: getTodayDate(),
        mood: mapMoodScoreToText(mood),
        energy: mood,
        stress: 6 - mood,
        note: note.trim(),
      });

      if (!response.success) {
        throw new Error(response.error || "Could not save daily log");
      }

      setSuccessMessage("Daily log saved");
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

        <InfoCard>
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-900">How are you feeling today?</h2>

            <input
              type="range"
              min="1"
              max="5"
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full"
            />

            <p className="text-sm text-slate-500">Mood level: {mood}</p>
          </div>
        </InfoCard>

        <InfoCard>
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-900">Notes</h2>

            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write down how your day went..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>
        </InfoCard>

        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className={`w-full rounded-2xl py-3 font-medium text-white ${
            saving ? "bg-slate-400" : "bg-rose-300 hover:bg-rose-400"
          }`}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </main>
    </MobileShell>
  );
}
