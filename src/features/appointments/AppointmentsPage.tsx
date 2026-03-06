import { useEffect, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { appointmentsService } from "../../services/appointments.service";
import type { Appointment } from "../../types/models";

function getDefaultAppointmentDateTime() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setHours(10, 0, 0, 0);
  return now.toISOString().slice(0, 16);
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [appointmentDate, setAppointmentDate] = useState(
    getDefaultAppointmentDateTime()
  );
  const [type, setType] = useState("consultation");
  const [note, setNote] = useState("");

  async function loadAppointments() {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentsService.listAppointments();

      if (!response.success) {
        throw new Error(response.error || "Failed to load appointments");
      }

      setAppointments(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAppointments();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage("");

      const response = await appointmentsService.createAppointment({
        appointment_date: new Date(appointmentDate).toISOString(),
        type,
        status: "pending",
        note,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create appointment");
      }

      setSuccessMessage("Appointment request submitted.");
      setNote("");
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell withBottomNav>
      <AppHeader title="Appointments" showBell />

      <main className="space-y-4 px-4 py-4">
        <InfoCard>
          <h2 className="text-base font-semibold text-slate-900">
            Appointment Request
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Request a session and review your upcoming appointments.
          </p>
        </InfoCard>

        <InfoCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Appointment Date
              </label>
              <input
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              >
                <option value="consultation">consultation</option>
                <option value="follow-up">follow-up</option>
                <option value="coaching">coaching</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="Add context for the request"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full rounded-2xl px-4 py-3 font-medium text-white ${
                saving ? "bg-slate-400" : "bg-slate-900"
              }`}
            >
              {saving ? "Submitting..." : "Request Appointment"}
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

        {loading ? (
          <InfoCard>
            <p className="text-sm text-slate-500">Loading appointments...</p>
          </InfoCard>
        ) : (
          <InfoCard>
            <h3 className="text-sm font-semibold text-slate-900">
              Upcoming Appointments
            </h3>

            {appointments.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No appointments yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {appointments.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-slate-50 px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {item.type}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(item.appointment_date).toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.note}
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>
        )}
      </main>

      <BottomNav />
    </MobileShell>
  );
}