import { Activity, AlertTriangle, Crown, Dumbbell, Heart, Search, ShieldCheck, Trash2, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import MobileShell from "../../components/layout/MobileShell";
import { adminService, type AdminActivityScore, type AdminUserRow } from "../../services/admin.service";
import { settingsService, type CategoryEnabled, type CategoryKey } from "../../services/settings.service";
import { getCurrentUser } from "../../utils/authSession";

const ACTIVITY_LABELS: Record<string, string> = {
  "rest":                    "พักผ่อน",
  "food-intake":             "โภชนาการ",
  "exercise":                "ออกกำลังกาย",
  "body-hygiene":            "สุขอนามัย",
  "positive-thinking":       "คิดบวก",
  "stress-level":            "จัดการความเครียด",
  "life-satisfaction":       "ความพึงพอใจในชีวิต",
  "self-worth":              "คุณค่าในตนเอง",
  "family-relationship":     "ความสัมพันธ์ครอบครัว",
  "community-participation": "การมีส่วนร่วมชุมชน",
  "workplace-relationship":  "ความสัมพันธ์ที่ทำงาน",
  "family-social-balance":   "สมดุลครอบครัว-สังคม",
  "work-balance":            "สมดุลการทำงาน",
  "personal-life-balance":   "สมดุลชีวิตส่วนตัว",
};

const ADMIN_EMAILS = new Set(["chaninatwattana@gmail.com", "kwansrn@hotmail.com"]);

function ScorePill({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">-</span>;
  }
  const cls =
    score >= 80 ? "bg-emerald-100 text-emerald-700" :
    score >= 60 ? "bg-sky-100 text-sky-700" :
    score >= 40 ? "bg-amber-100 text-amber-700" :
                  "bg-rose-100 text-rose-700";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{score}</span>;
}

function ScoreBar({ score, color }: { score: number | null; color: string }) {
  const pct = score ?? 0;
  return (
    <div className="flex-1 rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function avgOf(users: AdminUserRow[], key: keyof AdminUserRow) {
  const vals = users.map((u) => u[key]).filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return null;
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}

function formatThaiMonth(dateStr: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

const SCORE_ROWS = [
  { label: "ร่างกาย", key: "physical" as const, icon: Dumbbell, color: "bg-emerald-400", text: "text-emerald-600" },
  { label: "จิตใจ",   key: "mental"   as const, icon: Heart,    color: "bg-sky-400",     text: "text-sky-600"     },
  { label: "สังคม",   key: "social"   as const, icon: ShieldCheck, color: "bg-violet-400", text: "text-violet-600" },
  { label: "สมดุล",  key: "balance"  as const, icon: Activity,  color: "bg-amber-400",   text: "text-amber-600"   },
];

function ActivityRows({ activities, category, color }: { activities: AdminActivityScore[]; category: string; color: string }) {
  const rows = activities.filter((a) => a.category === category);
  if (rows.length === 0) return null;
  return (
    <div className="mt-1 space-y-1.5 pl-5">
      {rows.map((a) => (
        <div key={a.activity} className="flex items-center gap-2">
          <span className="w-32 shrink-0 truncate text-[11px] text-slate-400">
            {ACTIVITY_LABELS[a.activity] ?? a.activity}
          </span>
          <div className="flex-1 rounded-full bg-slate-100">
            <div className={`h-1.5 rounded-full ${color} opacity-70`} style={{ width: `${a.score}%` }} />
          </div>
          <span className="w-6 shrink-0 text-right text-[11px] text-slate-500">{a.score}</span>
        </div>
      ))}
    </div>
  );
}

function UserDetailSheet({ u, onClose }: { u: AdminUserRow; onClose: () => void }) {
  const isAdminUser = ADMIN_EMAILS.has(u.email);
  const initial = (u.fullName || u.email).charAt(0).toUpperCase();
  const hasActivities = u.activities.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* constrain to mobile shell width */}
      <div className="relative mx-auto w-full max-w-120">
        <div
          className="max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* drag pill */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

          {/* close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-slate-100 p-1.5 text-slate-400 hover:bg-slate-200"
          >
            <X size={16} />
          </button>

          {/* avatar + name */}
          <div className="mb-5 flex items-center gap-3">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ${isAdminUser ? "bg-linear-to-br from-amber-400 to-amber-600" : "bg-linear-to-br from-[#4e7498] to-[#2f556a]"}`}>
              {initial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-semibold text-slate-800">{u.fullName || "—"}</p>
                {isAdminUser && (
                  <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                    <Crown size={9} />Admin
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-slate-400">{u.email}</p>
            </div>
          </div>

          {/* stats */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[11px] text-slate-400">บันทึกทั้งหมด</p>
              <p className="mt-0.5 text-2xl font-bold text-slate-800">{u.logCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[11px] text-slate-400">ใช้งานล่าสุด</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">{formatThaiMonth(u.lastActive)}</p>
            </div>
          </div>

          {/* category scores + sub-activities */}
          <div className="space-y-3">
            {SCORE_ROWS.map(({ label, key, icon: Icon, color, text }) => {
              const score = u[key] as number | null;
              return (
                <div key={key}>
                  <div className="flex items-center gap-3">
                    <Icon size={13} className="shrink-0 text-slate-400" />
                    <span className="w-12 text-xs font-medium text-slate-600">{label}</span>
                    <ScoreBar score={score} color={color} />
                    <span className={`w-8 text-right text-sm font-semibold ${score !== null ? text : "text-slate-300"}`}>
                      {score ?? "-"}
                    </span>
                  </div>
                  {hasActivities && (
                    <ActivityRows activities={u.activities} category={key} color={color} />
                  )}
                </div>
              );
            })}
          </div>

          {!hasActivities && (
            <p className="mt-3 text-center text-xs text-slate-400">ยังไม่มีข้อมูลกิจกรรม</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  u,
  deleting,
  onConfirm,
  onCancel,
}: {
  u: AdminUserRow;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const initial = (u.fullName || u.email).charAt(0).toUpperCase();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative mx-auto w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
          <AlertTriangle size={26} className="text-rose-500" />
        </div>

        <h3 className="mb-1 text-center text-base font-bold text-slate-800">ลบผู้ใช้งาน?</h3>
        <p className="mb-5 text-center text-xs text-slate-500">การกระทำนี้ไม่สามารถยกเลิกได้</p>

        {/* User info */}
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#4e7498] to-[#2f556a] text-sm font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{u.fullName || "—"}</p>
            <p className="truncate text-[11px] text-slate-400">{u.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 active:opacity-70"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-2xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-sm active:opacity-80 disabled:opacity-60"
          >
            {deleting ? "กำลังลบ..." : "ลบ"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const userEmail = useMemo(() => getCurrentUser()?.email ?? "", []);
  const isAdmin = ADMIN_EMAILS.has(userEmail);

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"email" | "physical" | "mental" | "social" | "balance" | "lastActive">("lastActive");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [categoryEnabled, setCategoryEnabled] = useState<CategoryEnabled>({
    physical: true, mental: true, social: true, balance: true,
  });
  const [savedSettings, setSavedSettings] = useState<CategoryEnabled>({
    physical: true, mental: true, social: true, balance: true,
  });
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"ok" | "error" | null>(null);
  const [settingsLoadError, setSettingsLoadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate("/home", { replace: true });
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getDashboard(userEmail);
        if (!res.success) throw new Error(res.error || "โหลดข้อมูลไม่สำเร็จ");
        setUsers(res.data?.users ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [isAdmin, userEmail]);

  useEffect(() => {
    if (!isAdmin) return;
    settingsService.invalidateCache();
    settingsService.getCategorySettings({ fresh: true }).then(({ data, error }) => {
      setCategoryEnabled(data.categoryEnabled);
      setSavedSettings(data.categoryEnabled);
      setSettingsLoadError(error ?? null);
    });
  }, [isAdmin]);

  function handleToggle(cat: CategoryKey, next: boolean) {
    setCategoryEnabled((prev) => ({ ...prev, [cat]: next }));
  }

  const hasChanges = (Object.keys(categoryEnabled) as CategoryKey[]).some(
    (k) => categoryEnabled[k] !== savedSettings[k]
  );

  async function handleSaveSettings() {
    setSaving(true);
    setSaveResult(null);
    try {
      const cats = Object.keys(categoryEnabled) as CategoryKey[];
      const results = await Promise.all(
        cats.map((cat) => settingsService.updateCategoryEnabled(userEmail, cat, categoryEnabled[cat]))
      );
      const allOk = results.every((r) => r.success);
      if (allOk) {
        setSavedSettings({ ...categoryEnabled });
        setSaveResult("ok");
      } else {
        setSaveResult("error");
      }
    } catch {
      setSaveResult("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await adminService.deleteUser(userEmail, deleteTarget.userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.userId !== deleteTarget.userId));
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter(
        (u) =>
          !q ||
          u.email.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        // admins always on top
        const aIsAdmin = ADMIN_EMAILS.has(a.email);
        const bIsAdmin = ADMIN_EMAILS.has(b.email);
        if (aIsAdmin !== bIsAdmin) return aIsAdmin ? -1 : 1;

        let av: string | number | null = a[sortKey] as string | number | null;
        let bv: string | number | null = b[sortKey] as string | number | null;
        if (av === null) av = sortDir === "asc" ? Infinity : -Infinity;
        if (bv === null) bv = sortDir === "asc" ? Infinity : -Infinity;
        if (typeof av === "string" && typeof bv === "string") {
          return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        return sortDir === "asc"
          ? (av as number) - (bv as number)
          : (bv as number) - (av as number);
      });
  }, [users, search, sortKey, sortDir]);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const activeThisMonth = users.filter((u) => u.lastActive?.startsWith(thisMonth)).length;

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortBtn({ col, label }: { col: typeof sortKey; label: string }) {
    const active = sortKey === col;
    return (
      <button
        type="button"
        onClick={() => toggleSort(col)}
        className={`whitespace-nowrap text-xs font-medium ${active ? "text-[#2f556a]" : "text-slate-500"}`}
      >
        {label}{active ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
      </button>
    );
  }

  if (!isAdmin) return null;

  return (
    <MobileShell>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <AppHeader title="Admin Dashboard" showBack variant="soft" subtitle="ภาพรวมผู้ใช้งานทั้งหมด" />

        <main className="space-y-4 px-4 py-4">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : null}

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#4e7498]" />
                <p className="text-xs text-slate-500">ผู้ใช้ทั้งหมด</p>
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-900">{loading ? "—" : users.length}</p>
              <p className="text-xs text-slate-400">active เดือนนี้ {loading ? "—" : activeThisMonth} คน</p>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur">
              <p className="text-xs text-slate-500">คะแนนเฉลี่ย (ทุกหมวด)</p>
              {loading ? (
                <p className="mt-2 text-slate-400">กำลังโหลด...</p>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {[
                    { label: "กาย", val: avgOf(users, "physical"), color: "text-emerald-600" },
                    { label: "จิต", val: avgOf(users, "mental"), color: "text-sky-600" },
                    { label: "สังคม", val: avgOf(users, "social"), color: "text-violet-600" },
                    { label: "สมดุล", val: avgOf(users, "balance"), color: "text-amber-600" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500">{label}</span>
                      <span className={`text-sm font-semibold ${color}`}>{val ?? "-"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category avg bar */}
          {!loading && users.length > 0 && (
            <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur">
              <p className="mb-3 text-sm font-semibold text-slate-700">คะแนนเฉลี่ยแยกหมวด</p>
              {SCORE_ROWS.map(({ label, key, icon: Icon, color }) => {
                const avg = avgOf(users, key) ?? 0;
                return (
                  <div key={key} className="mb-2 flex items-center gap-3">
                    <Icon size={14} className="shrink-0 text-slate-400" />
                    <span className="w-12 text-xs text-slate-600">{label}</span>
                    <div className="flex-1 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${avg}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-semibold text-slate-700">{avg}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Category toggles */}
          <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur">
            <p className="mb-3 text-sm font-semibold text-slate-700">เปิด/ปิดแบบสอบถามแต่ละหมวด</p>
            {settingsLoadError && (
              <p className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-[11px] text-rose-500">
                โหลดค่าจาก server ไม่สำเร็จ — แสดงค่า default<br />
                <span className="opacity-70">{settingsLoadError}</span>
              </p>
            )}
            <div className="space-y-2">
              {SCORE_ROWS.map(({ label, key, icon: Icon }) => {
                const enabled = categoryEnabled[key];
                const onColor = { physical: "bg-emerald-400", mental: "bg-sky-400", social: "bg-violet-400", balance: "bg-amber-400" }[key];
                return (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon size={15} className={enabled ? "text-slate-500" : "text-slate-300"} />
                      <span className={`text-sm ${enabled ? "text-slate-700" : "text-slate-400"}`}>{label}</span>
                      {!enabled && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">ปิดใช้งาน</span>
                      )}
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      disabled={saving}
                      onClick={() => handleToggle(key, !enabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${enabled ? onColor : "bg-slate-200"} ${saving ? "opacity-50" : ""}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              disabled={!hasChanges || saving}
              onClick={() => void handleSaveSettings()}
              className={`mt-4 w-full rounded-2xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                hasChanges && !saving
                  ? "bg-[#2f556a] text-white shadow-sm active:opacity-80"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            {saveResult === "ok" && (
              <p className="mt-2 text-center text-xs text-emerald-600">บันทึกสำเร็จ</p>
            )}
            {saveResult === "error" && (
              <p className="mt-2 text-center text-xs text-rose-500">บันทึกไม่สำเร็จ — กรุณาตรวจสอบว่า deploy GAS version ใหม่แล้ว</p>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อหรืออีเมล..."
              className="w-full rounded-2xl border border-white/70 bg-white/80 py-2.5 pl-9 pr-4 text-sm shadow-sm outline-none focus:border-[#4e7498] backdrop-blur"
            />
          </div>

          {/* User table */}
          <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2">
              <SortBtn col="email" label="ผู้ใช้" />
              <SortBtn col="physical" label="กาย" />
              <SortBtn col="mental" label="จิต" />
              <SortBtn col="social" label="สังคม" />
              <SortBtn col="balance" label="สมดุล" />
            </div>

            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#4e7498]" />
                <p className="mt-2">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                {search ? "ไม่พบผู้ใช้ที่ค้นหา" : "ยังไม่มีข้อมูลผู้ใช้"}
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((u) => {
                  const isAdminRow = ADMIN_EMAILS.has(u.email);
                  return (
                    <div
                      key={u.userId}
                      className={`flex items-center gap-1 pr-2 ${isAdminRow ? "bg-amber-50/70" : ""}`}
                    >
                      {/* clickable info area */}
                      <button
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="grid min-w-0 flex-1 grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2 px-4 py-3 text-left active:opacity-70"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {u.fullName || "—"}
                            </p>
                            {isAdminRow && <Crown size={11} className="shrink-0 text-amber-500" />}
                          </div>
                          <p className="truncate text-[11px] text-slate-400">{u.email}</p>
                          <p className="text-[11px] text-slate-400">
                            {u.lastActive ? formatThaiMonth(u.lastActive) : "ยังไม่มีข้อมูล"}
                          </p>
                        </div>
                        <ScorePill score={u.physical} />
                        <ScorePill score={u.mental} />
                        <ScorePill score={u.social} />
                        <ScorePill score={u.balance} />
                      </button>

                      {/* delete button — only for non-admin users */}
                      {!isAdminRow && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(u)}
                          className="shrink-0 rounded-xl p-2 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-400 active:opacity-70"
                          aria-label="ลบผู้ใช้"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="pb-2 text-center text-xs text-slate-400">
            แสดง {filtered.length} / {users.length} รายการ
          </p>
        </main>
      </div>

      {selectedUser && (
        <UserDetailSheet u={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          u={deleteTarget}
          deleting={deleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </MobileShell>
  );
}
