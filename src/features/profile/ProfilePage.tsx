import { useEffect, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import InfoCard from "../../components/ui/InfoCard";
import { profileService } from "../../services/profile.service";
import type { User } from "../../types/models";

const menuItems = [
  "Personal Info",
  "Counseling Record",
  "Wellness Result",
  "Settings",
  "Help",
];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUser() {
    try {
      setLoading(true);
      setError(null);

      const response = await profileService.getUser();

      if (!response.success) {
        throw new Error(response.error || "Failed to load profile");
      }

      setUser(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUser();
  }, []);

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DU";

  return (
    <MobileShell withBottomNav>
      <AppHeader title="Profile" />

      <main className="space-y-4 px-4 py-4">
        {loading ? (
          <InfoCard>
            <p className="text-sm text-slate-500">Loading profile...</p>
          </InfoCard>
        ) : error ? (
          <InfoCard>
            <div className="space-y-3">
              <p className="text-sm text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => void loadUser()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Retry
              </button>
            </div>
          </InfoCard>
        ) : user ? (
          <InfoCard>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700">
                {initials}
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  {user.full_name}
                </h2>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="text-sm text-slate-500">{user.phone}</p>
              </div>
            </div>
          </InfoCard>
        ) : (
          <InfoCard>
            <p className="text-sm text-slate-500">No profile data found.</p>
          </InfoCard>
        )}

        <div className="space-y-3">
          {menuItems.map((item) => (
            <InfoCard key={item}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{item}</span>
                <span className="text-sm text-slate-400">›</span>
              </div>
            </InfoCard>
          ))}
        </div>
      </main>

      <BottomNav />
    </MobileShell>
  );
}