import { Activity, Crown, Dumbbell, Heart, Search, ShieldCheck, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import MobileShell from "../../components/layout/MobileShell";
import { adminService, type AdminUserRow } from "../../services/admin.service";
import { getCurrentUser } from "../../utils/authSession";

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

function UserDetailSheet({ u, onClose }: { u: AdminUserRow; onClose: () => void }) {
  const isAdminUser = ADMIN_EMAILS.has(u.email);
  const initial = (u.fullName || u.email).charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative rounded-t-3xl bg-white px-5 pb-8 pt-5 shadow-2xl"
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

        {/* score bars */}
        <div className="space-y-2.5">
          {SCORE_ROWS.map(({ label, key, icon: Icon, color, text }) => {
            const score = u[key] as number | null;
            return (
              <div key={key} className="flex items-center gap-3">
                <Icon size={13} className="shrink-0 text-slate-400" />
                <span className="w-12 text-xs text-slate-600">{label}</span>
                <ScoreBar score={score} color={color} />
                <span className={`w-8 text-right text-sm font-semibold ${score !== null ? text : "text-slate-300"}`}>
                  {score ?? "-"}
                </span>
              </div>
            );
          })}
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
                    <button
                      key={u.userId}
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      className={`grid w-full grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2 px-4 py-3 text-left active:opacity-70 ${isAdminRow ? "bg-amber-50/70" : "hover:bg-slate-50/60"}`}
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
    </MobileShell>
  );
}
