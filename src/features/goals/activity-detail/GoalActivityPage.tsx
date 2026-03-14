import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { logsService } from "../../../services/logs.service";
import { getCurrentUserId } from "../../../utils/authSession";
import { POSITIVE_THINKING_TASKS } from "../tasks/positiveThinkingTasks";
import { STRESS_TASKS } from "../tasks/stressTasks";
import { SOCIAL_TASKS } from "../tasks/socialTasks";
import { FAMILY_RELATIONSHIP_TASKS } from "../tasks/familyRelationshipTasks";
import { WORKPLACE_RELATIONSHIP_TASKS } from "../tasks/workplaceRelationshipTasks";
import { BALANCE_TASKS } from "../tasks/balanceTasks";
import { FAMILY_SOCIAL_BALANCE_TASKS } from "../tasks/familySocialBalanceTasks";
import { PERSONAL_LIFE_BALANCE_TASKS } from "../tasks/personalLifeBalanceTasks";
import { WORK_BALANCE_TASKS } from "../tasks/workBalanceTasks";
import { ChevronRight, Smile, Sparkles, Sun } from "lucide-react";
import {
  getLogTimestamp as getPositiveThinkingLogTimestamp,
  parsePositiveThinkingTaskNote,
} from "../task-detail/positiveThinkingTaskShared";
import {
  getLogTimestamp as getStressLogTimestamp,
  parseStressTaskNote,
} from "../task-detail/stressTaskShared";
import {
  getLogTimestamp as getSocialLogTimestamp,
  parseSocialTaskNote,
} from "../task-detail/socialTaskShared";
import {
  getLogTimestamp as getBalanceLogTimestamp,
  parseBalanceTaskNote,
} from "../task-detail/balanceTaskShared";

const PHYSICAL_UNDER_CONSTRUCTION_MAP: Record<
  string,
  {
    title: string;
    subtitle: string;
    emoji: string;
    tips: string[];
  }
> = {
  "food-intake": {
    title: "การรับประทานอาหาร",
    subtitle: "เตรียมหน้าสำหรับติดตามพฤติกรรมการกินและบันทึกคะแนน",
    emoji: "🥗",
    tips: [
      "กำลังเตรียมฟอร์มบันทึกมื้ออาหารและคุณภาพอาหาร",
      "กำลังเชื่อมคะแนนเพื่อให้สะท้อนบนกราฟสุขภาวะทางกาย",
    ],
  },
  exercise: {
    title: "การออกกำลังกาย",
    subtitle: "เตรียมหน้าสำหรับติดตามการเคลื่อนไหวและกิจกรรมทางกาย",
    emoji: "🏃",
    tips: [
      "กำลังเตรียมการบันทึกกิจกรรมออกกำลังกายในแต่ละวัน",
      "กำลังวางรูปแบบคะแนนให้คำนวณตามความสม่ำเสมอ",
    ],
  },
  "body-hygiene": {
    title: "การดูแลรักษาความสะอาดของร่างกาย",
    subtitle: "เตรียมหน้าสำหรับติดตามกิจวัตรดูแลสุขอนามัย",
    emoji: "🧼",
    tips: [
      "กำลังเตรียมรายการกิจวัตรด้านสุขอนามัยที่ต้องการติดตาม",
      "กำลังเชื่อมข้อมูลเพื่ออัปเดตคะแนนสุขภาวะทางกาย",
    ],
  },
};

const MENTAL_UNDER_CONSTRUCTION_MAP: Record<
  string,
  {
    title: string;
    subtitle: string;
    emoji: string;
    tips: string[];
  }
> = {
  "life-satisfaction": {
    title: "ระดับความพึงพอใจในชีวิต",
    subtitle: "เตรียมหน้าสำหรับติดตามมุมมองความพึงพอใจต่อชีวิตในภาพรวม",
    emoji: "🌷",
    tips: [
      "กำลังเตรียมแบบประเมินและฟอร์มบันทึกสำหรับดูแนวโน้มในแต่ละช่วงเวลา",
      "กำลังออกแบบคะแนนเพื่อให้สะท้อนบนกราฟสุขภาวะทางใจ",
    ],
  },
  "self-worth": {
    title: "การรู้สึกมีคุณค่าในตนเอง",
    subtitle: "เตรียมหน้าสำหรับติดตามการรับรู้คุณค่าและความมั่นใจในตัวเอง",
    emoji: "💗",
    tips: [
      "กำลังเตรียมชุดคำถามและการบันทึกผลที่เข้าใจง่ายสำหรับผู้ใช้",
      "กำลังเชื่อมข้อมูลเพื่ออัปเดตคะแนนสุขภาวะทางใจให้ครบทุกหัวข้อ",
    ],
  },
};
function getMentalTitle(activity?: string) {
  if (activity === "positive-thinking") return "การมองโลกในแง่บวก";
  if (activity === "stress-level") return "ระดับความเครียด";
  if (activity === "life-satisfaction") return "ระดับความพึงพอใจในชีวิต";
  if (activity === "self-worth") return "การรู้สึกมีคุณค่าในตนเอง";
  return "กิจกรรม";
}
function getSocialTitle(activity?: string) {
  if (activity === "family-relationship") {
    return "ความสัมพันธ์ระหว่างสมาชิกในครอบครัว";
  }
  if (activity === "community-participation") {
    return "การมีส่วนร่วมในชุมชนและสังคมรอบข้าง";
  }
  if (activity === "workplace-relationship") {
    return "ความสัมพันธ์ในที่ทำงาน";
  }
  return "กิจกรรม";
}

export default function GoalActivityPage() {
  const { category, activity } = useParams<{
    category: string;
    activity: string;
  }>();
  const userId = getCurrentUserId();

  const [positiveThinkingCompletion, setPositiveThinkingCompletion] = useState<Record<string, boolean>>({});
  const [positiveThinkingLoading, setPositiveThinkingLoading] = useState(false);
  const [stressCompletion, setStressCompletion] = useState<Record<string, boolean>>({});
  const [stressLoading, setStressLoading] = useState(false);
  const [socialCompletion, setSocialCompletion] = useState<Record<string, boolean>>({});
  const [socialLoading, setSocialLoading] = useState(false);
  const [balanceCompletion, setBalanceCompletion] = useState<Record<string, boolean>>({});
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    if (category !== "mental" || activity !== "positive-thinking") {
      setPositiveThinkingCompletion({});
      setPositiveThinkingLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPositiveThinkingCompletion() {
      try {
        setPositiveThinkingLoading(true);

        const response = await logsService.listMentalTaskLogs(userId ?? undefined, {
          activity: "positive-thinking",
          limit: 240,
        });

        if (!response.success) {
          if (!cancelled) {
            setPositiveThinkingCompletion({});
          }
          return;
        }

        const completionByTask = new Map<string, boolean>();
        [...(response.data || [])]
          .sort((a, b) => getPositiveThinkingLogTimestamp(b) - getPositiveThinkingLogTimestamp(a))
          .forEach((log) => {
            const parsed = parsePositiveThinkingTaskNote(String(log.note));
            if (!parsed || completionByTask.has(parsed.task)) return;
            completionByTask.set(parsed.task, parsed.score > 0);
          });

        if (!cancelled) {
          setPositiveThinkingCompletion(Object.fromEntries(completionByTask));
        }
      } finally {
        if (!cancelled) {
          setPositiveThinkingLoading(false);
        }
      }
    }

    void loadPositiveThinkingCompletion();

    return () => {
      cancelled = true;
    };
  }, [activity, category, userId]);

  useEffect(() => {
    if (category !== "mental" || activity !== "stress-level") {
      setStressCompletion({});
      setStressLoading(false);
      return;
    }

    let cancelled = false;

    async function loadStressCompletion() {
      try {
        setStressLoading(true);

        const response = await logsService.listMentalTaskLogs(userId ?? undefined, {
          activity: "stress-level",
          limit: 240,
        });

        if (!response.success) {
          if (!cancelled) {
            setStressCompletion({});
          }
          return;
        }

        const completionByTask = new Map<string, boolean>();
        [...(response.data || [])]
          .sort((a, b) => getStressLogTimestamp(b) - getStressLogTimestamp(a))
          .forEach((log) => {
            const parsed = parseStressTaskNote(String(log.note));
            if (!parsed || completionByTask.has(parsed.task)) return;
            completionByTask.set(parsed.task, parsed.score > 0);
          });

        if (!cancelled) {
          setStressCompletion(Object.fromEntries(completionByTask));
        }
      } finally {
        if (!cancelled) {
          setStressLoading(false);
        }
      }
    }

    void loadStressCompletion();

    return () => {
      cancelled = true;
    };
  }, [activity, category, userId]);

  useEffect(() => {
    if (
      category !== "social" ||
      !activity ||
      !["family-relationship", "community-participation", "workplace-relationship"].includes(activity)
    ) {
      setSocialCompletion({});
      setSocialLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSocialCompletion() {
      try {
        setSocialLoading(true);

        const response = await logsService.listSocialTaskLogs(userId ?? undefined, {
          activity,
          limit: 240,
        });

        if (!response.success) {
          if (!cancelled) {
            setSocialCompletion({});
          }
          return;
        }

        const completionByTask = new Map<string, boolean>();
        [...(response.data || [])]
          .sort((a, b) => getSocialLogTimestamp(b) - getSocialLogTimestamp(a))
          .forEach((log) => {
            const parsed = parseSocialTaskNote(String(log.note));
            if (!parsed || parsed.activity !== activity || completionByTask.has(parsed.task)) return;
            completionByTask.set(parsed.task, parsed.score > 0);
          });

        if (!cancelled) {
          setSocialCompletion(Object.fromEntries(completionByTask));
        }
      } finally {
        if (!cancelled) {
          setSocialLoading(false);
        }
      }
    }

    void loadSocialCompletion();

    return () => {
      cancelled = true;
    };
  }, [activity, category, userId]);

  useEffect(() => {
    if (
      category !== "balance" ||
      !activity ||
      !["family-social-balance", "work-balance", "personal-life-balance"].includes(activity)
    ) {
      setBalanceCompletion({});
      setBalanceLoading(false);
      return;
    }

    let cancelled = false;

    async function loadBalanceCompletion() {
      try {
        setBalanceLoading(true);

        const response = await logsService.listBalanceTaskLogs(userId ?? undefined, {
          activity,
          limit: 240,
        });

        if (!response.success) {
          if (!cancelled) {
            setBalanceCompletion({});
          }
          return;
        }

        const completionByTask = new Map<string, boolean>();
        [...(response.data || [])]
          .sort((a, b) => getBalanceLogTimestamp(b) - getBalanceLogTimestamp(a))
          .forEach((log) => {
            const parsed = parseBalanceTaskNote(String(log.note));
            if (!parsed || parsed.activity !== activity || completionByTask.has(parsed.task)) return;
            completionByTask.set(parsed.task, parsed.score > 0);
          });

        if (!cancelled) {
          setBalanceCompletion(Object.fromEntries(completionByTask));
        }
      } finally {
        if (!cancelled) {
          setBalanceLoading(false);
        }
      }
    }

    void loadBalanceCompletion();

    return () => {
      cancelled = true;
    };
  }, [activity, category, userId]);

  const positiveThinkingTasks = useMemo(
    () =>
      POSITIVE_THINKING_TASKS.map((task) => ({
        ...task,
        completed: positiveThinkingCompletion[task.slug] ?? false,
      })),
    [positiveThinkingCompletion]
  );

  const stressTasks = useMemo(
    () =>
      STRESS_TASKS.map((task) => ({
        ...task,
        completed: stressCompletion[task.slug] ?? false,
      })),
    [stressCompletion]
  );

  const familyRelationshipTasks = useMemo(
    () =>
      FAMILY_RELATIONSHIP_TASKS.map((task) => ({
        ...task,
        completed: socialCompletion[task.slug] ?? false,
      })),
    [socialCompletion]
  );

  const workplaceRelationshipTasks = useMemo(
    () =>
      WORKPLACE_RELATIONSHIP_TASKS.map((task) => ({
        ...task,
        completed: socialCompletion[task.slug] ?? false,
      })),
    [socialCompletion]
  );

  const familySocialBalanceTasks = useMemo(
    () =>
      FAMILY_SOCIAL_BALANCE_TASKS.map((task) => ({
        ...task,
        completed: balanceCompletion[task.slug] ?? false,
      })),
    [balanceCompletion]
  );

  const workBalanceTasks = useMemo(
    () =>
      WORK_BALANCE_TASKS.map((task) => ({
        ...task,
        completed: balanceCompletion[task.slug] ?? false,
      })),
    [balanceCompletion]
  );

  const personalLifeBalanceTasks = useMemo(
    () =>
      PERSONAL_LIFE_BALANCE_TASKS.map((task) => ({
        ...task,
        completed: balanceCompletion[task.slug] ?? false,
      })),
    [balanceCompletion]
  );

  const communityParticipationTask = useMemo(() => {
    const task = SOCIAL_TASKS.find((item) => item.slug === "community-participation");
    if (!task) return null;
    return {
      ...task,
      completed: socialCompletion["community-participation-overall"] ?? false,
    };
  }, [socialCompletion]);

  if (category === "physical" && activity) {
    const physicalConfig = PHYSICAL_UNDER_CONSTRUCTION_MAP[activity];

    if (physicalConfig) {
      return (
        <MobileShell>
          <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
            <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

            <AppHeader title={physicalConfig.title} showBack showBell variant="soft" subtitle="กำลังพัฒนาหน้านี้ให้พร้อมใช้งานเต็มรูปแบบ" />

            <main className="relative z-10 space-y-4 px-4 py-4">
              <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">UNDER CONSTRUCTION</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                    {physicalConfig.emoji}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{physicalConfig.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{physicalConfig.subtitle}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
                <h3 className="text-base font-semibold text-slate-900">สิ่งที่จะมีในหน้านี้</h3>
                <div className="mt-3 space-y-2">
                  {physicalConfig.tips.map((tip) => (
                    <div key={tip} className="rounded-2xl border border-[#dcecf5] bg-[#f6fbff] px-3 py-2 text-sm text-slate-600">
                      {tip}
                    </div>
                  ))}
                </div>
              </section>

              <Link
                to="/goals/physical"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#c8e2ef] bg-[#eef8fd] px-4 py-3 text-sm font-medium text-[#2e6a8b]"
              >
                กลับไปหน้าสุขภาวะทางกาย
              </Link>
            </main>
          </div>
        </MobileShell>
      );
    }
  }

  if (category === "mental" && activity === "positive-thinking") {
    const completedCount = positiveThinkingTasks.filter((task) => task.completed).length;
    const totalCount = positiveThinkingTasks.length;
    const progressPercent =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="การมองโลกในแง่บวก"
            showBack
            showBell
            variant="soft"
            subtitle="บันทึกกิจกรรมเล็ก ๆ ที่ช่วยให้ใจมองโลกในมุมที่ดีขึ้น"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/80 p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)]">
              <div className="pointer-events-none absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.95)_8%,rgba(255,255,255,0.82)_42%,rgba(255,245,224,0.64)_72%,rgba(227,249,239,0.54)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.52)_0%,rgba(255,255,255,0)_26%)]" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.32)_48%,rgba(255,255,255,0.7)_100%)]" />
              </div>

              <div className="relative z-10">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">POSITIVE THINKING</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-extrabold leading-tight text-slate-900">
                      ฝึกมองสิ่งรอบตัวในด้านที่ช่วยให้ใจเบาขึ้น
                    </h2>
                    <p className="mt-1 max-w-xs text-sm text-slate-700">
                      เก็บกิจกรรมเล็ก ๆ ที่ช่วยให้เราค่อย ๆ มองโลกในมุมที่อ่อนโยนและมีพลังขึ้น
                    </p>
                  </div>
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.38)_100%)] text-[#2e6a8b] shadow-[0_12px_24px_rgba(78,104,96,0.16)] backdrop-blur-md">
                    <Sparkles size={22} />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#fff4a8_0%,#f4e46c_44%,#e3d24b_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.42),0_12px_24px_rgba(160,138,46,0.18)]">
                    {completedCount}
                  </div>
                  <div className="min-w-0 flex-1 rounded-[24px] border border-white/60 bg-white/55 px-4 py-3 shadow-[0_10px_24px_rgba(31,47,61,0.08)] backdrop-blur-sm">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                      <span>ความคืบหน้าของหัวข้อนี้</span>
                      <span className="font-semibold text-slate-900">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/80">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      ทำได้แล้ว {completedCount} / {totalCount} หัวข้อ
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {positiveThinkingTasks.map((task) => {
                const path =
                  task.slug === "smile-when-disappointed"
                    ? "/goals/mental/positive-thinking/smile-when-disappointed"
                    : `/goals/mental/positive-thinking/${task.slug}`;

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">{task.subtitle}</p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                positiveThinkingLoading
                                  ? "bg-slate-100 text-slate-500"
                                  : task.completed
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {positiveThinkingLoading ? "กำลังโหลด" : task.completed ? "บันทึกแล้ว" : "รอบันทึก"}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.type === "counter"
                                  ? "bg-[#fff4ec] text-[#a95f3a]"
                                  : "bg-[#eef8fd] text-[#2e6a8b]"
                              }`}
                            >
                              {task.type === "counter" ? <Smile size={12} /> : null}
                              {task.type === "counter" ? "Counter" : "Yes / No"}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }
  if (category === "mental" && activity === "stress-level") {
    const completedCount = stressTasks.filter((task) => task.completed).length;
    const totalCount = stressTasks.length;
    const progressPercent =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="ระดับความเครียด"
            showBack
            showBell
            variant="soft"
            subtitle="ติดตามกิจกรรมเล็ก ๆ ที่ช่วยให้ร่างกายและใจค่อย ๆ ผ่อนลง"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/80 p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)]">
              <div className="pointer-events-none absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.93)_10%,rgba(255,250,232,0.8)_46%,rgba(236,252,247,0.62)_74%,rgba(230,244,255,0.56)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0)_30%)]" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.28)_48%,rgba(255,255,255,0.7)_100%)]" />
              </div>

              <div className="relative z-10">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">STRESS LEVEL</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-extrabold leading-tight text-slate-900">
                      ค่อย ๆ ลดความตึงเครียดด้วยกิจกรรมที่ทำได้จริง
                    </h2>
                    <p className="mt-1 max-w-xs text-sm text-slate-700">
                      ให้เวลากับกิจกรรมเรียบง่ายที่ช่วยให้ร่างกายและใจค่อย ๆ ผ่อนลงในแต่ละวัน
                    </p>
                  </div>
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.36)_100%)] text-[#2e6a8b] shadow-[0_12px_24px_rgba(78,104,96,0.16)] backdrop-blur-md">
                    <Sparkles size={22} />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#fff4a8_0%,#f4e46c_44%,#e3d24b_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.42),0_12px_24px_rgba(160,138,46,0.18)]">
                    {completedCount}
                  </div>
                  <div className="min-w-0 flex-1 rounded-[24px] border border-white/60 bg-white/55 px-4 py-3 shadow-[0_10px_24px_rgba(31,47,61,0.08)] backdrop-blur-sm">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                      <span>ความคืบหน้าของหัวข้อนี้</span>
                      <span className="font-semibold text-slate-900">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/80">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      ทำได้แล้ว {completedCount} / {totalCount} หัวข้อ
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {stressTasks.map((task) => {
                const path =
                  task.slug === "get-sunlight"
                    ? "/goals/mental/stress-level/get-sunlight"
                    : `/goals/mental/stress-level/${task.slug}`;

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">{task.subtitle}</p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                stressLoading
                                  ? "bg-slate-100 text-slate-500"
                                  : task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {stressLoading ? "กำลังโหลด" : task.completed ? "บันทึกแล้ว" : "รอบันทึก"}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.type === "counter"
                                  ? "bg-[#fff8dd] text-[#966300]"
                                  : "bg-[#eef8fd] text-[#2e6a8b]"
                              }`}
                            >
                              {task.type === "counter" ? <Sun size={12} /> : null}
                              {task.type === "counter" ? "Counter" : "Yes / No"}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }
    if (category === "social" && activity === "family-relationship") {
    const completedCount = familyRelationshipTasks.filter((task) => task.completed).length;
    const totalCount = familyRelationshipTasks.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="ความสัมพันธ์ระหว่างสมาชิกในครอบครัว"
            showBack
            showBell
            variant="soft"
            subtitle="บันทึกความสัมพันธ์ที่ดีในบ้านอย่างต่อเนื่อง"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#18211d] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.22)]">
              <div className="pointer-events-none absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,14,0.5)_0%,rgba(8,12,16,0.66)_40%,rgba(9,14,18,0.84)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12)_0%,rgba(24,33,29,0)_30%)]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-white/75">FAMILY RELATIONSHIP</p>
                    <p className="mt-2 text-2xl font-extrabold leading-tight text-white/90">Grow kindness at home</p>
                  </div>
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] text-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md">
                    👨‍👩‍👧
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#f8f0a1_0%,#eddc4c_52%,#d5c033_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.28),0_12px_24px_rgba(0,0,0,0.16)]">
                    {completedCount}
                  </div>
                  <div className="min-w-0 flex-1 pt-6">
                    <div className="mb-1 flex items-center justify-between text-xs text-white/75">
                      <span>Total progress</span>
                      <span className="font-semibold text-white">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/20">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white/90">Completed {completedCount} / {totalCount} tasks</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {familyRelationshipTasks.map((task) => {
                const path =
                  task.slug === "listen-and-accept"
                    ? "/goals/social/family-relationship/listen-and-accept"
                    : `/goals/social/family-relationship/${task.slug}`;
                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">{task.subtitle}</p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                socialLoading
                                  ? "bg-slate-100 text-slate-500"
                                  : task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {socialLoading ? "กำลังโหลด" : task.completed ? "บันทึกแล้ว" : "รอบันทึก"}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.type === "counter"
                                  ? "bg-[#fff5ea] text-[#9a5b34]"
                                  : "bg-[#eef8fd] text-[#2e6a8b]"
                              }`}
                            >
                              {task.type === "counter" ? "Counter" : "Yes / No"}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

    if (category === "social" && activity === "community-participation") {
    const currentTask = communityParticipationTask;
    const completedCount = currentTask?.completed ? 1 : 0;
    const totalCount = 1;
    const progressPercent = completedCount === 1 ? 100 : 0;

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="การมีส่วนร่วมในชุมชนและสังคมรอบข้าง"
            showBack
            showBell
            variant="soft"
            subtitle="ประเมินภาพรวมด้วยคำตอบแบบ Yes / No"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#18211d] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.22)]">
              <div className="pointer-events-none absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,14,0.5)_0%,rgba(8,12,16,0.66)_40%,rgba(9,14,18,0.84)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12)_0%,rgba(24,33,29,0)_30%)]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-white/75">COMMUNITY PARTICIPATION</p>
                    <p className="mt-2 text-2xl font-extrabold leading-tight text-white/90">Stay connected beyond your circle</p>
                  </div>
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] text-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md">
                    🤝
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#f8f0a1_0%,#eddc4c_52%,#d5c033_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.28),0_12px_24px_rgba(0,0,0,0.16)]">
                    {completedCount}
                  </div>
                  <div className="min-w-0 flex-1 pt-6">
                    <div className="mb-1 flex items-center justify-between text-xs text-white/75">
                      <span>Total progress</span>
                      <span className="font-semibold text-white">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/20">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white/90">Completed {completedCount} / {totalCount} tasks</p>
                  </div>
                </div>
              </div>
            </section>

            <Link
              to="/goals/social/community-participation/task"
              className="block rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold leading-7 text-slate-900">
                    {currentTask?.label ?? "การมีส่วนร่วมในชุมชนและสังคมรอบข้าง"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {currentTask?.subtitle ?? "เปิดใจมีส่วนร่วมกับผู้คนและกิจกรรมรอบตัวอย่างเหมาะสม"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        socialLoading
                          ? "bg-slate-100 text-slate-500"
                          : currentTask?.completed
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {socialLoading ? "กำลังโหลด" : currentTask?.completed ? "บันทึกแล้ว" : "รอบันทึก"}
                    </span>
                    <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                      Yes / No
                    </span>
                  </div>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                  <ChevronRight size={16} />
                </span>
              </div>
            </Link>
          </main>
        </div>
      </MobileShell>
    );
  }

    if (category === "social" && activity === "workplace-relationship") {
    const completedCount = workplaceRelationshipTasks.filter((task) => task.completed).length;
    const totalCount = workplaceRelationshipTasks.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="ความสัมพันธ์ในที่ทำงาน"
            showBack
            showBell
            variant="soft"
            subtitle="สร้างบรรยากาศการทำงานที่ร่วมมือกันได้ดี"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#18211d] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.22)]">
              <div className="pointer-events-none absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,14,0.5)_0%,rgba(8,12,16,0.66)_40%,rgba(9,14,18,0.84)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12)_0%,rgba(24,33,29,0)_30%)]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-white/75">WORKPLACE RELATIONSHIP</p>
                    <p className="mt-2 text-2xl font-extrabold leading-tight text-white/90">Work better with people around you</p>
                  </div>
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] text-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md">
                    💼
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#f8f0a1_0%,#eddc4c_52%,#d5c033_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.28),0_12px_24px_rgba(0,0,0,0.16)]">
                    {completedCount}
                  </div>
                  <div className="min-w-0 flex-1 pt-6">
                    <div className="mb-1 flex items-center justify-between text-xs text-white/75">
                      <span>Total progress</span>
                      <span className="font-semibold text-white">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/20">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white/90">Completed {completedCount} / {totalCount} tasks</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {workplaceRelationshipTasks.map((task) => {
                const path =
                  task.slug === "share-items-with-colleagues"
                    ? "/goals/social/workplace-relationship/share-items-with-colleagues"
                    : `/goals/social/workplace-relationship/${task.slug}`;

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">{task.subtitle}</p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                socialLoading
                                  ? "bg-slate-100 text-slate-500"
                                  : task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {socialLoading ? "กำลังโหลด" : task.completed ? "บันทึกแล้ว" : "รอบันทึก"}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.type === "counter"
                                  ? "bg-[#fff5ea] text-[#9a5b34]"
                                  : "bg-[#eef8fd] text-[#2e6a8b]"
                              }`}
                            >
                              {task.type === "counter" ? "Counter" : "Yes / No"}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "balance" && activity === "family-social-balance") {
    const completedCount = familySocialBalanceTasks.filter((task) => task.completed).length;
    const totalCount = familySocialBalanceTasks.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="สมดุลระหว่างครอบครัวและสังคม"
            showBack
            showBell
            variant="soft"
            subtitle="รักษาความสัมพันธ์ที่ดีทั้งกับครอบครัวและผู้คนรอบตัว"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#18211d] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.22)]">
              <div className="pointer-events-none absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,14,0.5)_0%,rgba(8,12,16,0.66)_40%,rgba(9,14,18,0.84)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12)_0%,rgba(24,33,29,0)_30%)]" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-semibold tracking-[0.14em] text-white/75">FAMILY &amp; SOCIAL BALANCE</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-2xl font-extrabold leading-tight text-white/90">Stay close to the people who matter</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] text-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md">
                  🤝
                </div>
              </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#f8f0a1_0%,#eddc4c_52%,#d5c033_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.28),0_12px_24px_rgba(0,0,0,0.16)]">
                    {completedCount}
                </div>
                <div className="min-w-0 flex-1 pt-6">
                  <div className="mb-1 flex items-center justify-between text-xs text-white/75">
                    <span>Total progress</span>
                    <span className="font-semibold text-white">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/20">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white/90">
                    Completed {completedCount} / {totalCount} tasks
                  </p>
                </div>
              </div>
              </div>
            </section>

            <section className="space-y-3">
              {familySocialBalanceTasks.map((task) => {
                const path =
                  task.slug === "say-thanks-or-sorry"
                    ? "/goals/balance/family-social-balance/say-thanks-or-sorry"
                    : `/goals/balance/family-social-balance/${task.slug}`;

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">{task.subtitle}</p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                balanceLoading
                                  ? "bg-slate-100 text-slate-500"
                                  : task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {balanceLoading ? "กำลังโหลด" : task.completed ? "บันทึกแล้ว" : "รอบันทึก"}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.type === "counter"
                                  ? "bg-[#fff5ea] text-[#9a5b34]"
                                  : "bg-[#eef8fd] text-[#2e6a8b]"
                              }`}
                            >
                              {task.type === "counter" ? "Counter" : "Yes / No"}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "balance" && activity === "work-balance") {
    const completedCount = workBalanceTasks.filter((task) => task.completed).length;
    const totalCount = workBalanceTasks.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="สมดุลการทำงาน"
            showBack
            showBell
            variant="soft"
            subtitle="จัดจังหวะการทำงานให้พอดี ไม่หนักจนเกินไป"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#18211d] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.22)]">
              <div className="pointer-events-none absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,14,0.46)_0%,rgba(8,12,16,0.64)_40%,rgba(9,14,18,0.84)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12)_0%,rgba(24,33,29,0)_30%)]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-white/75">WORK BALANCE</p>
                    <p className="mt-2 text-2xl font-extrabold leading-tight text-white/90">Keep work steady, not overwhelming</p>
                  </div>
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] text-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md">
                    💼
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#f8f0a1_0%,#eddc4c_52%,#d5c033_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.28),0_12px_24px_rgba(0,0,0,0.16)]">
                    {completedCount}
                  </div>
                  <div className="min-w-0 flex-1 pt-6">
                    <div className="mb-1 flex items-center justify-between text-xs text-white/75">
                      <span>Total progress</span>
                      <span className="font-semibold text-white">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/20">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white/90">
                      Completed {completedCount} / {totalCount} tasks
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {workBalanceTasks.map((task) => (
                <Link key={task.slug} to={`/goals/balance/work-balance/${task.slug}`} className="block">
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">{task.subtitle}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              balanceLoading
                                ? "bg-slate-100 text-slate-500"
                                : task.completed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {balanceLoading ? "กำลังโหลด" : task.completed ? "บันทึกแล้ว" : "รอบันทึก"}
                          </span>
                          <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                            {task.type === "boolean" ? "Yes / No" : task.type}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "balance" && activity === "personal-life-balance") {
    const completedCount = personalLifeBalanceTasks.filter((task) => task.completed).length;
    const totalCount = personalLifeBalanceTasks.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="สมดุลระหว่างชีวิตส่วนตัว"
            showBack
            showBell
            variant="soft"
            subtitle="เว้นพื้นที่ให้ตัวเองด้วยกิจกรรมเล็ก ๆ ที่เติมพลัง"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#18211d] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.22)]">
              <div className="pointer-events-none absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,14,0.48)_0%,rgba(8,12,16,0.66)_40%,rgba(9,14,18,0.84)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1)_0%,rgba(24,33,29,0)_30%)]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-white/75">PERSONAL LIFE BALANCE</p>
                    <p className="mt-2 text-2xl font-extrabold leading-tight text-white/90">Make space for yourself</p>
                  </div>
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] text-2xl shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md">
                    🌿
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,#f8f0a1_0%,#eddc4c_52%,#d5c033_100%)] text-4xl font-extrabold text-slate-900 shadow-[inset_0_10px_22px_rgba(255,255,255,0.28),0_12px_24px_rgba(0,0,0,0.16)]">
                    {completedCount}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs text-white/75">
                      <span>Total progress</span>
                      <span className="font-semibold text-white">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/20">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium text-white/90">Completed {completedCount} / {totalCount} tasks</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {personalLifeBalanceTasks.map((task) => (
                <Link
                  key={task.slug}
                  to={`/goals/balance/personal-life-balance/${task.slug}`}
                  className="block"
                >
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">{task.subtitle}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              balanceLoading
                                ? "bg-slate-100 text-slate-500"
                                : task.completed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {balanceLoading ? "กำลังโหลด" : task.completed ? "บันทึกแล้ว" : "รอบันทึก"}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              task.type === "counter"
                                ? "bg-[#fff5ea] text-[#9a5b34]"
                                : "bg-[#eef8fd] text-[#2e6a8b]"
                            }`}
                          >
                            {task.type === "counter" ? "Counter" : "Yes / No"}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "balance") {
    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title="Life Balance"
            showBack
            showBell
            variant="soft"
            subtitle="Choose one area to log and track"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">LIFE BALANCE</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">
                Track balance across work, family/social, and personal life
              </h2>
              <p className="mt-1 text-sm text-slate-600">Your logs here are used to calculate this category score</p>
            </section>

            <section className="space-y-3">
              {BALANCE_TASKS.map((task) => (
                <Link key={task.slug} to={`/goals/balance/${task.slug}`} className="block">
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">Open and update subtasks in this area</p>
                      </div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

    if (category === "social") {
    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader title={getSocialTitle(activity)} showBack showBell variant="soft" subtitle="เลือกกิจกรรมด้านสังคมเพื่อบันทึกคะแนน" />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#9ad4be]/20 blur-3xl" />
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">SOCIAL WELLBEING</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">เสริมพลังความสัมพันธ์รอบตัว</h2>
              <p className="mt-1 text-sm text-slate-600">เลือกเมนูย่อยเพื่อบันทึกผลด้านความสัมพันธ์และการมีส่วนร่วมแบบ Yes / No</p>
            </section>

            <section className="space-y-3">
              {SOCIAL_TASKS.map((task) => (
                <Link key={task.slug} to={`/goals/social/${task.slug}`} className="block">
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">เลือกไปยังหน้าบันทึกกิจกรรมย่อยของหัวข้อนี้</p>
                      </div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "mental" && activity && MENTAL_UNDER_CONSTRUCTION_MAP[activity]) {
    const mentalConfig = MENTAL_UNDER_CONSTRUCTION_MAP[activity];

    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader
            title={mentalConfig.title}
            showBack
            showBell
            variant="soft"
            subtitle="กำลังพัฒนาหน้านี้ให้พร้อมใช้งานเต็มรูปแบบ"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">UNDER CONSTRUCTION</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                  {mentalConfig.emoji}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{mentalConfig.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{mentalConfig.subtitle}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_40px_rgba(31,47,61,0.1)] backdrop-blur">
              <h3 className="text-base font-semibold text-slate-900">สิ่งที่จะมีในหน้านี้</h3>
              <div className="mt-3 space-y-2">
                {mentalConfig.tips.map((tip) => (
                  <div key={tip} className="rounded-2xl border border-[#dcecf5] bg-[#f6fbff] px-3 py-2 text-sm text-slate-600">
                    {tip}
                  </div>
                ))}
              </div>
            </section>

            <Link
              to="/goals/mental"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-[#c8e2ef] bg-[#eef8fd] px-4 py-3 text-sm font-medium text-[#2e6a8b]"
            >
              กลับไปหน้าสุขภาวะทางใจ
            </Link>
          </main>
        </div>
      </MobileShell>
    );
  }

  if (category === "mental") {
    return (
      <MobileShell>
        <AppHeader title={getMentalTitle(activity)} showBack showBell />
        <main className="px-4 py-6 text-center text-slate-500">
          ยังไม่มีข้อมูลกิจกรรม
        </main>
      </MobileShell>
    );
  }
  return (
    <MobileShell>
      <AppHeader title="กิจกรรม" showBack showBell />
      <main className="px-4 py-6 text-center text-slate-500">
        ยังไม่มีข้อมูลกิจกรรม
      </main>
    </MobileShell>
  );
}
