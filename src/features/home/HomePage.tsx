import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleUserRound,
  Sparkles,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import BottomNav from "../../components/layout/BottomNav";
import MobileShell from "../../components/layout/MobileShell";
import WellbeingRadarChart from "../../components/charts/WellbeingRadarChart";
import InfoCard from "../../components/ui/InfoCard";
import { articlesService } from "../../services/articles.service";
import { goalsService } from "../../services/goals.service";
import { profileService } from "../../services/profile.service";
import type { Article, Goal, User } from "../../types/models";
import { getCurrentUserId } from "../../utils/authSession";
import { useLiveScores } from "../../hooks/useLiveScores";
import { toDateKey, getStartOfMonth, getEndOfMonth } from "../../utils/weekPeriod";

const FALLBACK_ARTICLES: Article[] = [
  {
    id: "fallback-1",
    title: "แนวทางสร้างสุขสมดุลในชีวิตประจำวัน",
    description: "เทคนิคเล็ก ๆ ที่ช่วยให้จัดสมดุลกาย ใจ และงานได้ดีขึ้นทุกวัน",
  },
  {
    id: "fallback-2",
    title: "ดูแลใจให้แข็งแรงในวันที่เหนื่อย",
    description: "วิธีรีเซ็ตอารมณ์และฟื้นพลังใจแบบทำได้จริงในเวลาไม่นาน",
  },
];

const ARTICLE_AUTOPLAY_MS = 4500;

function formatThaiDate(value: Date) {
  return value.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPublishedDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}


export default function HomePage() {
  const userId = getCurrentUserId();
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeArticleIndex, setActiveArticleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthStart = useMemo(() => getStartOfMonth(new Date()), []);
  const from = useMemo(() => toDateKey(monthStart), [monthStart]);
  const to = useMemo(() => toDateKey(getEndOfMonth(monthStart)), [monthStart]);
  const { liveScores } = useLiveScores(userId, from, to);

  const scores = useMemo(() => ({
    physical: liveScores?.physical ?? 0,
    mental: liveScores?.mental ?? 0,
    social: liveScores?.social ?? 0,
    balance: liveScores?.balance ?? 0,
  }), [liveScores]);

  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [userResponse, goalsResponse] = await Promise.all([
        profileService.getUser(userId ?? undefined),
        goalsService.listGoals(userId ?? undefined),
      ]);

      if (!userResponse.success) {
        throw new Error(userResponse.error || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
      }

      if (!goalsResponse.success) {
        throw new Error(goalsResponse.error || "ไม่สามารถโหลดข้อมูลเป้าหมายได้");
      }

      setUser(userResponse.data);
      setGoals(goalsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadArticles = useCallback(async () => {
    const response = await articlesService.listArticles(5);
    if (response.success && Array.isArray(response.data) && response.data.length > 0) {
      setArticles(response.data);
      return;
    }

    setArticles(FALLBACK_ARTICLES);
  }, []);

  useEffect(() => {
    void loadHomeData();
    void loadArticles();
  }, [loadArticles, loadHomeData]);

  const topArticles = useMemo(
    () => (articles.length > 0 ? articles.slice(0, 5) : FALLBACK_ARTICLES),
    [articles]
  );

  useEffect(() => {
    setActiveArticleIndex((prev) => (prev >= topArticles.length ? 0 : prev));
  }, [topArticles.length]);

  useEffect(() => {
    if (topArticles.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveArticleIndex((prev) => (prev + 1) % topArticles.length);
    }, ARTICLE_AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [topArticles]);

  const goalSummary = useMemo(() => {
    const active = goals.filter((goal) => goal.status === "active").length;
    const completed = goals.filter((goal) => goal.status === "completed").length;
    const completionRate = goals.length > 0 ? Math.round((completed / goals.length) * 100) : 0;

    return {
      total: goals.length,
      active,
      completed,
      completionRate,
    };
  }, [goals]);

  const wellbeingAverage = useMemo(() => {
    return Math.round((scores.physical + scores.mental + scores.social + scores.balance) / 4);
  }, [scores.balance, scores.mental, scores.physical, scores.social]);

  const scoreItems = [
    { label: "กาย", value: scores.physical, color: "bg-[#f2f8ff] text-[#1f4962]" },
    { label: "ใจ", value: scores.mental, color: "bg-[#f1fbf4] text-[#1f5f3d]" },
    { label: "สังคม", value: scores.social, color: "bg-[#fff6ed] text-[#7a4b24]" },
    { label: "สมดุล", value: scores.balance, color: "bg-[#fff2f6] text-[#7a2a48]" },
  ];

  const quickActions = [
    {
      to: "/goals",
      label: "เป้าหมาย",
      description: "อัปเดตความคืบหน้า",
      Icon: Target,
      style: "bg-[#edf7ff] text-[#2f5f7c]",
    },
    {
      to: "/appointments",
      label: "การนัดหมาย",
      description: "จองเวลาและติดตาม",
      Icon: CalendarDays,
      style: "bg-[#fff2eb] text-[#8a5a3a]",
    },
    {
      to: "/profile",
      label: "บัญชี",
      description: "จัดการข้อมูลส่วนตัว",
      Icon: CircleUserRound,
      style: "bg-[#eef8f2] text-[#2f6a4f]",
    },
  ];

  function showArticle(index: number) {
    const total = topArticles.length;
    if (total === 0) return;
    const nextIndex = (index + total) % total;
    setActiveArticleIndex(nextIndex);
  }

  return (
    <MobileShell>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
        <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

        <AppHeader
          title="หน้าหลัก"
          showBell
          variant="soft"
          subtitle={
            loading
              ? "กำลังโหลดข้อมูล..."
              : user
              ? `สวัสดี, ${user.full_name}`
              : "สวัสดี"
          }
        />

        <main className="relative z-10 space-y-4 px-4 py-4">
          {loading ? (
            <>
              <InfoCard className="rounded-3xl border-white/70 bg-white/80">
                <p className="text-sm text-slate-500">กำลังโหลดข้อมูลหน้าหลัก...</p>
              </InfoCard>
              <InfoCard className="rounded-3xl border-white/70 bg-white/80">
                <p className="text-sm text-slate-500">กำลังเตรียมบทความแนะนำ...</p>
              </InfoCard>
            </>
          ) : error ? (
            <InfoCard className="rounded-3xl border-rose-200 bg-rose-50">
              <div className="space-y-3">
                <p className="text-sm text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    void loadHomeData();
                    void loadArticles();
                  }}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  ลองใหม่
                </button>
              </div>
            </InfoCard>
          ) : (
            <>
              <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.9)_0%,rgba(245,253,255,0.86)_48%,rgba(237,251,243,0.88)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#9ad4be]/20 blur-3xl" />
                <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">HAPPY BALANCE TODAY</p>
                <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">ภาพรวมสุขสมดุลของคุณ</h2>
                <p className="mt-1 text-sm text-slate-600">{formatThaiDate(new Date())}</p>

                <div className="mt-4 rounded-2xl border border-white/80 bg-white/75 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                    <span>ความคืบหน้าโดยรวม</span>
                    <span className="font-semibold text-slate-900">{wellbeingAverage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${wellbeingAverage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-[#f8fafc] px-2 py-3">
                    <p className="text-xs text-slate-500">ทั้งหมด</p>
                    <p className="text-lg font-bold text-slate-900">{goalSummary.total}</p>
                  </div>
                  <div className="rounded-2xl bg-[#ecfdf3] px-2 py-3">
                    <p className="text-xs text-slate-500">กำลังทำ</p>
                    <p className="text-lg font-bold text-[#166534]">{goalSummary.active}</p>
                  </div>
                  <div className="rounded-2xl bg-[#fff7ed] px-2 py-3">
                    <p className="text-xs text-slate-500">สำเร็จ</p>
                    <p className="text-lg font-bold text-[#9a3412]">{goalSummary.completed}</p>
                  </div>
                </div>
              </section>

              <InfoCard className="rounded-3xl border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-900">ทางลัดที่ใช้บ่อย</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {quickActions.map((action) => (
                      <Link
                        key={action.to}
                        to={action.to}
                        className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <span
                          className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${action.style}`}
                        >
                          <action.Icon size={17} />
                        </span>
                        <p className="text-xs font-semibold text-slate-900">{action.label}</p>
                        <p className="mt-1 text-[11px] leading-4 text-slate-500">{action.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </InfoCard>

              <InfoCard className="rounded-3xl border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">สถานะสุขสมดุลของคุณ</h3>
                    <span className="rounded-full bg-[#f5fbff] px-3 py-1 text-xs font-semibold text-[#315d75]">
                      เฉลี่ย {wellbeingAverage}%
                    </span>
                  </div>

                  <WellbeingRadarChart
                    physical={scores.physical}
                    mental={scores.mental}
                    social={scores.social}
                    balance={scores.balance}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {scoreItems.map((item) => (
                      <div key={item.label} className={`rounded-xl px-3 py-2 ${item.color}`}>
                        <p className="text-xs">{item.label}</p>
                        <p className="text-lg font-bold">{item.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </InfoCard>

              <InfoCard className="rounded-3xl border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">บทความแนะนำ</h3>
                      <p className="mt-1 text-sm text-slate-500">แตะเพื่อดูรายละเอียดบทความ</p>
                    </div>

                    {topArticles.length > 1 ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => showArticle(activeArticleIndex - 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          aria-label="บทความก่อนหน้า"
                        >
                          <ArrowLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => showArticle(activeArticleIndex + 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          aria-label="บทความถัดไป"
                        >
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80">
                    <div
                      className="flex transition-transform duration-700 ease-in-out"
                      style={{ transform: `translateX(-${activeArticleIndex * 100}%)` }}
                    >
                      {topArticles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/articles/${encodeURIComponent(article.id)}`}
                          state={{ article }}
                          className="block w-full flex-shrink-0 p-4"
                        >
                          {article.image_url ? (
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="h-36 w-full rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-[#f9f4ef] to-[#eef8f4] text-[#4f6a79]">
                              <span className="inline-flex items-center gap-2 text-sm font-medium">
                                <Sparkles size={16} />
                                Happy Balance Article
                              </span>
                            </div>
                          )}
                          <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">{article.title}</p>
                          <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">
                            {article.description}
                          </p>
                          {formatPublishedDate(article.published_at ?? article.created_at) ? (
                            <p className="mt-3 text-[11px] text-slate-400">
                              {formatPublishedDate(article.published_at ?? article.created_at)}
                            </p>
                          ) : null}
                          <p className="mt-2 text-xs font-medium text-[#b46e44]">แตะเพื่ออ่านรายละเอียด</p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {topArticles.length > 1 ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {topArticles.map((article, index) => (
                          <button
                            key={article.id}
                            type="button"
                            onClick={() => showArticle(index)}
                            aria-label={`ไปบทความที่ ${index + 1}`}
                            className={`h-2.5 rounded-full transition-all ${
                              index === activeArticleIndex
                                ? "w-6 bg-[#d88d80]"
                                : "w-2.5 bg-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        {activeArticleIndex + 1}/{topArticles.length}
                      </p>
                    </div>
                  ) : null}
                </div>
              </InfoCard>
            </>
          )}
        </main>

        <BottomNav variant="soft" />
      </div>
    </MobileShell>
  );
}
