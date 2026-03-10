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
    return (
      <MobileShell>
        <AppHeader title="การมองโลกในแง่บวก" showBack showBell />
        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌤️</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-300 text-4xl font-bold text-slate-900">
                6
              </div>
              <span className="text-4xl">🌤️</span>
            </div>
          </div>

          <div className="space-y-3">
            {POSITIVE_THINKING_TASKS.map((task) => {
              const path =
                task.slug === "smile-when-disappointed"
                  ? "/goals/mental/positive-thinking/smile-when-disappointed"
                  : `/goals/mental/positive-thinking/${task.slug}`;

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

  if (category === "mental" && activity === "stress-level") {
    return (
      <MobileShell>
        <AppHeader title="ระดับความเครียด" showBack showBell />
        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">😮‍💨</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-300 text-4xl font-bold text-slate-900">
                3
              </div>
              <span className="text-4xl">😮‍💨</span>
            </div>
          </div>

          <div className="space-y-3">
            {STRESS_TASKS.map((task) => {
              const path =
                task.slug === "get-sunlight"
                  ? "/goals/mental/stress-level/get-sunlight"
                  : `/goals/mental/stress-level/${task.slug}`;

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

  if (category === "social" && activity === "family-relationship") {
    return (
      <MobileShell>
        <AppHeader title="ความสัมพันธ์ระหว่างสมาชิกในครอบครัว" showBack showBell />
        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">👨‍👩‍👧</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-300 text-4xl font-bold text-slate-900">
                9
              </div>
              <span className="text-4xl">🏡</span>
            </div>
          </div>

          <div className="space-y-3">
            {FAMILY_RELATIONSHIP_TASKS.map((task) => {
              const path =
                task.slug === "listen-and-accept"
                  ? "/goals/social/family-relationship/listen-and-accept"
                  : `/goals/social/family-relationship/${task.slug}`;

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

  if (category === "social" && activity === "workplace-relationship") {
    return (
      <MobileShell>
        <AppHeader title="ความสัมพันธ์ในที่ทำงาน" showBack showBell />
        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">💼</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-300 text-4xl font-bold text-slate-900">
                6
              </div>
              <span className="text-4xl">🧑‍💻</span>
            </div>
          </div>

          <div className="space-y-3">
            {WORKPLACE_RELATIONSHIP_TASKS.map((task) => {
              const path =
                task.slug === "share-items-with-colleagues"
                  ? "/goals/social/workplace-relationship/share-items-with-colleagues"
                  : `/goals/social/workplace-relationship/${task.slug}`;

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
        <AppHeader title={getSocialTitle(activity)} showBack showBell />
        <main className="space-y-4 px-4 py-4">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🤝</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-4xl font-bold text-slate-900">
                5
              </div>
              <span className="text-4xl">🤝</span>
            </div>
          </div>

          <div className="space-y-3">
            {SOCIAL_TASKS.map((task) => (
              <Link
                key={task.slug}
                to={`/goals/social/${task.slug}/task`}
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
