import { Link, useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import { REST_TASKS } from "../tasks/restTasks";
import { MENTAL_TASKS } from "../tasks/mentalTasks";
import { POSITIVE_THINKING_TASKS } from "../tasks/positiveThinkingTasks";
import { STRESS_TASKS } from "../tasks/stressTasks";
import { SOCIAL_TASKS } from "../tasks/socialTasks";
import { FAMILY_RELATIONSHIP_TASKS } from "../tasks/familyRelationshipTasks";
import { WORKPLACE_RELATIONSHIP_TASKS } from "../tasks/workplaceRelationshipTasks";
import { BALANCE_TASKS } from "../tasks/balanceTasks";
import { FAMILY_SOCIAL_BALANCE_TASKS } from "../tasks/familySocialBalanceTasks";
import { WORK_BALANCE_TASKS } from "../tasks/workBalanceTasks";
import { ChevronRight, Smile, Sparkles, Sun } from "lucide-react";

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
    subtitle: "เมนูนี้กำลังเตรียมระบบบันทึกโภชนาการรายวัน",
    emoji: "🥗",
    tips: [
      "กำลังเพิ่มฟอร์มบันทึกมื้ออาหารและคุณภาพอาหาร",
      "กำลังเชื่อมคะแนนเข้ากับกราฟสุขภาวะทางกาย",
    ],
  },
  exercise: {
    title: "การออกกำลังกาย",
    subtitle: "เมนูนี้กำลังเตรียมระบบติดตามกิจกรรมการออกกำลังกาย",
    emoji: "🏃",
    tips: [
      "กำลังเพิ่มรูปแบบกิจกรรมและระยะเวลาในการออกกำลังกาย",
      "กำลังพัฒนาการคำนวณคะแนนรายวันแบบอัตโนมัติ",
    ],
  },
  "body-hygiene": {
    title: "การดูแลรักษาความสะอาดของร่างกาย",
    subtitle: "เมนูนี้กำลังเตรียมระบบบันทึกพฤติกรรมสุขอนามัย",
    emoji: "🧼",
    tips: [
      "กำลังเพิ่มรายการพฤติกรรมดูแลสุขอนามัยที่จำเป็น",
      "กำลังเชื่อมข้อมูลเพื่อสรุปผลเป็นคะแนนรายสัปดาห์",
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

  if (category === "physical" && activity === "rest") {
    return (
      <MobileShell>
        <AppHeader title="การพักผ่อน" showBack showBell />
        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🛏️</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-300 text-4xl font-bold text-slate-900">
                7
              </div>
              <span className="text-4xl">🛏️</span>
            </div>
          </div>

          <div className="space-y-3">
            {REST_TASKS.map((task) => (
              <Link
                key={task.slug}
                to={`/goals/physical/rest/${task.slug}`}
                className={`block rounded-2xl border px-4 py-4 text-center text-base font-medium ${
                  task.completed
                    ? "border-green-400 bg-green-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {task.label}
              </Link>
            ))}
          </div>
        </main>
      </MobileShell>
    );
  }

  if (category === "physical" && activity) {
    const physicalConfig = PHYSICAL_UNDER_CONSTRUCTION_MAP[activity];

    if (physicalConfig) {
      return (
        <MobileShell>
          <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
            <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

            <AppHeader title={physicalConfig.title} showBack showBell variant="soft" subtitle="กำลังพัฒนาเมนูนี้" />

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
                <h3 className="text-base font-semibold text-slate-900">สิ่งที่กำลังเตรียมในหน้านี้</h3>
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
    const completedCount = POSITIVE_THINKING_TASKS.filter((task) => task.completed).length;
    const totalCount = POSITIVE_THINKING_TASKS.length;
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
            subtitle="บันทึกพฤติกรรมเชิงบวกอย่างต่อเนื่อง"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">POSITIVE THINKING</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight text-slate-900">ภาพรวมการฝึกมองโลกในแง่บวก</h2>
                  <p className="mt-1 text-sm text-slate-600">หัวข้อทั่วไปใช้การตอบ Yes/No และมี 1 หัวข้อที่บันทึกรายวัน</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2e6a8b] shadow-sm">
                  <Sparkles size={22} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#eddc4c] text-4xl font-extrabold text-slate-900 shadow-inner">
                  {completedCount}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>ความคืบหน้าหัวข้อทั้งหมด</span>
                    <span className="font-semibold text-slate-900">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    ทำได้แล้ว {completedCount} / {totalCount} หัวข้อ
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {POSITIVE_THINKING_TASKS.map((task) => {
                const path =
                  task.slug === "smile-when-disappointed"
                    ? "/goals/mental/positive-thinking/smile-when-disappointed"
                    : `/goals/mental/positive-thinking/${task.slug}`;
                const isDaily = task.slug === "smile-when-disappointed";

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {isDaily ? "บันทึกจำนวนยิ้มแบบรายวัน" : "บันทึกผลแบบ Yes/No (ไม่รายวัน)"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {task.completed ? "ทำแล้ว" : "รอบันทึก"}
                            </span>
                            {isDaily ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4ec] px-2.5 py-1 text-xs font-medium text-[#a95f3a]">
                                <Smile size={12} />
                                Daily
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                                Yes / No
                              </span>
                            )}
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
    const completedCount = STRESS_TASKS.filter((task) => task.completed).length;
    const totalCount = STRESS_TASKS.length;
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
            subtitle="ดูแลความเครียดแบบต่อเนื่องในแต่ละวัน"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">STRESS LEVEL</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight text-slate-900">ภาพรวมการดูแลความเครียด</h2>
                  <p className="mt-1 text-sm text-slate-600">หัวข้อทั่วไปใช้การตอบ Yes/No และมี 1 หัวข้อที่บันทึกรายวัน</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2e6a8b] shadow-sm">
                  <Sparkles size={22} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#eddc4c] text-4xl font-extrabold text-slate-900 shadow-inner">
                  {completedCount}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>ความคืบหน้าหัวข้อทั้งหมด</span>
                    <span className="font-semibold text-slate-900">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    ทำได้แล้ว {completedCount} / {totalCount} หัวข้อ
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {STRESS_TASKS.map((task) => {
                const path =
                  task.slug === "get-sunlight"
                    ? "/goals/mental/stress-level/get-sunlight"
                    : `/goals/mental/stress-level/${task.slug}`;
                const isDaily = task.slug === "get-sunlight";

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {isDaily ? "บันทึกจำนวนครั้งแบบรายวัน" : "บันทึกผลแบบ Yes/No (ไม่รายวัน)"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {task.completed ? "ทำแล้ว" : "รอบันทึก"}
                            </span>
                            {isDaily ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff8dd] px-2.5 py-1 text-xs font-medium text-[#966300]">
                                <Sun size={12} />
                                Daily
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                                Yes / No
                              </span>
                            )}
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
    const completedCount = FAMILY_RELATIONSHIP_TASKS.filter((task) => task.completed).length;
    const totalCount = FAMILY_RELATIONSHIP_TASKS.length;
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
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">FAMILY RELATIONSHIP</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight text-slate-900">ภาพรวมความสัมพันธ์ในครอบครัว</h2>
                  <p className="mt-1 text-sm text-slate-600">มีทั้งหัวข้อ Yes/No และ 1 หัวข้อที่บันทึกแบบรายวัน</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  👨‍👩‍👧
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#eddc4c] text-4xl font-extrabold text-slate-900 shadow-inner">
                  {completedCount}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>ความคืบหน้าหัวข้อทั้งหมด</span>
                    <span className="font-semibold text-slate-900">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    ทำได้แล้ว {completedCount} / {totalCount} หัวข้อ
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {FAMILY_RELATIONSHIP_TASKS.map((task) => {
                const path =
                  task.slug === "listen-and-accept"
                    ? "/goals/social/family-relationship/listen-and-accept"
                    : `/goals/social/family-relationship/${task.slug}`;
                const isDaily = task.slug === "listen-and-accept";

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {isDaily ? "บันทึกจำนวนครั้งแบบรายวัน" : "บันทึกผลแบบ Yes/No (ไม่รายวัน)"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {task.completed ? "ทำแล้ว" : "รอบันทึก"}
                            </span>
                            {isDaily ? (
                              <span className="rounded-full bg-[#fff8dd] px-2.5 py-1 text-xs font-medium text-[#966300]">
                                Daily
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                                Yes / No
                              </span>
                            )}
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
            subtitle="ประเมินภาพรวมด้วยคำตอบ Yes/No"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">COMMUNITY PARTICIPATION</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight text-slate-900">
                    การมีส่วนร่วมในชุมชนและสังคม
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">ตอบว่าในช่วงนี้คุณทำได้หรือไม่ เพื่ออัปเดตคะแนนภาพรวม</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  🤝
                </div>
              </div>
            </section>

            <Link
              to="/goals/social/community-participation/task"
              className="block rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold leading-7 text-slate-900">บันทึกผลกิจกรรมนี้</h3>
                  <p className="mt-1 text-sm text-slate-500">ตอบแบบ Yes / No และบันทึกลงระบบได้ทันที</p>
                  <span className="mt-3 inline-flex rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                    Yes / No
                  </span>
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
    const completedCount = WORKPLACE_RELATIONSHIP_TASKS.filter((task) => task.completed).length;
    const totalCount = WORKPLACE_RELATIONSHIP_TASKS.length;
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
            subtitle="บันทึกพฤติกรรมเชิงบวกกับเพื่อนร่วมงาน"
          />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">WORKPLACE RELATIONSHIP</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight text-slate-900">ภาพรวมความสัมพันธ์ในที่ทำงาน</h2>
                  <p className="mt-1 text-sm text-slate-600">มีทั้งหัวข้อ Yes/No และ 1 หัวข้อที่บันทึกแบบรายวัน</p>
                </div>
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  💼
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#eddc4c] text-4xl font-extrabold text-slate-900 shadow-inner">
                  {completedCount}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>ความคืบหน้าหัวข้อทั้งหมด</span>
                    <span className="font-semibold text-slate-900">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#7fc3a0] via-[#8cc2db] to-[#d88d80]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    ทำได้แล้ว {completedCount} / {totalCount} หัวข้อ
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {WORKPLACE_RELATIONSHIP_TASKS.map((task) => {
                const path =
                  task.slug === "share-items-with-colleagues"
                    ? "/goals/social/workplace-relationship/share-items-with-colleagues"
                    : `/goals/social/workplace-relationship/${task.slug}`;
                const isDaily = task.slug === "share-items-with-colleagues";

                return (
                  <Link key={task.slug} to={path} className="block">
                    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {isDaily ? "บันทึกจำนวนครั้งแบบรายวัน" : "บันทึกผลแบบ Yes/No (ไม่รายวัน)"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                task.completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {task.completed ? "ทำแล้ว" : "รอบันทึก"}
                            </span>
                            {isDaily ? (
                              <span className="rounded-full bg-[#fff8dd] px-2.5 py-1 text-xs font-medium text-[#966300]">
                                Daily
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#eef8fd] px-2.5 py-1 text-xs font-medium text-[#2e6a8b]">
                                Yes / No
                              </span>
                            )}
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
    return (
      <MobileShell>
        <AppHeader title="สมดุลระหว่างครอบครัวและสังคม" showBack showBell />
        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">👨‍👩‍👧</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-300 text-4xl font-bold text-slate-900">
                9
              </div>
              <span className="text-4xl">🌍</span>
            </div>
          </div>

          <div className="space-y-3">
            {FAMILY_SOCIAL_BALANCE_TASKS.map((task) => {
              const path =
                task.slug === "say-thanks-or-sorry"
                  ? "/goals/balance/family-social-balance/say-thanks-or-sorry"
                  : `/goals/balance/family-social-balance/${task.slug}`;

              return (
                <Link
                  key={task.slug}
                  to={path}
                  className={`block rounded-2xl border px-4 py-4 text-center text-base font-medium ${
                    task.completed
                      ? "border-green-400 bg-green-50 text-slate-900"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {task.label}
                </Link>
              );
            })}
          </div>
        </main>
      </MobileShell>
    );
  }

  if (category === "balance" && activity === "work-balance") {
    return (
      <MobileShell>
        <AppHeader title="สมดุลระหว่างการทำงาน" showBack showBell />
        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">📝</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-300 text-4xl font-bold text-slate-900">
                5
              </div>
              <span className="text-4xl">💻</span>
            </div>
          </div>

          <div className="space-y-3">
            {WORK_BALANCE_TASKS.map((task) => (
              <Link
                key={task.slug}
                to={`/goals/balance/work-balance/${task.slug}`}
                className={`block rounded-2xl border px-4 py-4 text-center text-base font-medium ${
                  task.completed
                    ? "border-green-400 bg-green-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {task.label}
              </Link>
            ))}
          </div>
        </main>
      </MobileShell>
    );
  }

  if (category === "balance") {
    return (
      <MobileShell>
        <AppHeader
          title="ความพอใจในสุขสมดุลระหว่างการทำงาน ครอบครัว สังคม และชีวิตส่วนตัว"
          showBack
          showBell
        />
        <main className="space-y-4 px-4 py-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-center text-lg font-semibold leading-7 text-slate-900">
              ความพอใจในสุขสมดุลระหว่างการทำงาน ครอบครัว สังคม และชีวิตส่วนตัว
            </h2>

            <div className="mt-4 flex justify-center">
              <div className="w-full max-w-xs rounded-2xl bg-green-50 p-4 text-center text-sm text-slate-500">
                พื้นที่แสดงกราฟสมดุลของผู้ใช้งาน
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {BALANCE_TASKS.map((task) => (
              <Link
                key={task.slug}
                to={`/goals/balance/${task.slug}/task`}
                className={`block rounded-2xl border px-4 py-4 text-center text-base font-medium ${
                  task.completed
                    ? "border-green-400 bg-green-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {task.label}
              </Link>
            ))}
          </div>
        </main>
      </MobileShell>
    );
  }

  if (category === "social") {
    return (
      <MobileShell>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff6db_0%,#f7fdff_42%,#e8f7ef_100%)]">
          <div className="pointer-events-none absolute -left-20 top-14 h-56 w-56 rounded-full bg-[#ffc9a3]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-28 h-56 w-56 rounded-full bg-[#7dcdb8]/20 blur-3xl" />

          <AppHeader title={getSocialTitle(activity)} showBack showBell variant="soft" subtitle="เลือกกิจกรรมด้านสังคม" />

          <main className="relative z-10 space-y-4 px-4 py-4">
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,253,255,0.88)_48%,rgba(237,251,243,0.9)_100%)] p-5 shadow-[0_22px_48px_rgba(31,47,61,0.14)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#255f54]">SOCIAL WELLBEING</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">เสริมพลังความสัมพันธ์รอบตัว</h2>
              <p className="mt-1 text-sm text-slate-600">เลือกเมนูย่อยเพื่อบันทึกพฤติกรรมรายวันหรือตอบแบบ Yes/No</p>
            </section>

            <section className="space-y-3">
              {SOCIAL_TASKS.map((task) => (
                <Link key={task.slug} to={`/goals/social/${task.slug}`} className="block">
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_14px_32px_rgba(31,47,61,0.1)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,47,61,0.14)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d8e8f6] via-[#ebf4fd] to-[#f8fcff]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-7 text-slate-900">{task.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">เปิดดูและบันทึกกิจกรรมย่อยในหัวข้อนี้</p>
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

  if (category === "mental") {
    const currentTask = MENTAL_TASKS.find((task) => task.slug === activity);

    return (
      <MobileShell>
        <AppHeader title={getMentalTitle(activity)} showBack showBell />
        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🧠</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pink-200 text-4xl font-bold text-slate-900">
                6
              </div>
              <span className="text-4xl">🧠</span>
            </div>
          </div>

          {currentTask ? (
            <Link
              to={`/goals/mental/${currentTask.slug}/task`}
              className={`block rounded-2xl border px-4 py-4 text-center text-base font-medium ${
                currentTask.completed
                  ? "border-pink-300 bg-pink-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {currentTask.label}
            </Link>
          ) : (
            <div className="rounded-2xl bg-white px-4 py-6 text-center text-slate-500 shadow-sm">
              ยังไม่มีข้อมูลกิจกรรม
            </div>
          )}
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
