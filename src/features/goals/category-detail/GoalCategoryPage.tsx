import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";
import CategoryRadarChart from "../../../components/charts/CategoryRadarChart";
import { goalsService } from "../../../services/goals.service";
import type { Goal } from "../../../types/models";

type ActivityItem = {
  label: string;
  subtitle: string;
  slug: string;
};

type CategoryConfig = {
  title: string;
  statusTitle: string;
  description: string;
  activities: ActivityItem[];
};

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  physical: {
    title: "สุขภาวะทางกาย",
    statusTitle: "สถานะสุขภาวะทางกาย",
    description:
      "ผู้ใช้งานสามารถเลือกกิจกรรมเพื่อพัฒนาสุขภาวะทางกายของตนเองได้จากรายการด้านล่าง",
    activities: [
      {
        label: "การพักผ่อน",
        subtitle: "ดูรายละเอียดกิจกรรมด้านการพักผ่อน",
        slug: "rest",
      },
      {
        label: "การรับประทานอาหาร",
        subtitle: "ดูรายละเอียดกิจกรรมด้านการรับประทานอาหาร",
        slug: "food-intake",
      },
      {
        label: "การออกกำลังกาย",
        subtitle: "ดูรายละเอียดกิจกรรมด้านการออกกำลังกาย",
        slug: "exercise",
      },
      {
        label: "การดูแลรักษาความสะอาดของร่างกาย",
        subtitle: "ดูรายละเอียดกิจกรรมด้านการดูแลสุขอนามัย",
        slug: "body-hygiene",
      },
    ],
  },

  mental: {
    title: "สุขภาวะทางใจ",
    statusTitle: "สถานะสุขภาวะทางใจ",
    description:
      "ผู้ใช้งานสามารถเลือกกิจกรรมเพื่อพัฒนาสุขภาวะทางใจของตนเองได้จากรายการด้านล่าง",
    activities: [
      {
        label: "การมองโลกในแง่บวก",
        subtitle: "ดูรายละเอียดกิจกรรมด้านการมองโลกในแง่บวก",
        slug: "positive-thinking",
      },
      {
        label: "ระดับความเครียด",
        subtitle: "ดูรายละเอียดกิจกรรมด้านความเครียด",
        slug: "stress-level",
      },
      {
        label: "ระดับความพึงพอใจในชีวิต",
        subtitle: "ดูรายละเอียดกิจกรรมด้านความพึงพอใจในชีวิต",
        slug: "life-satisfaction",
      },
      {
        label: "การรู้สึกมีคุณค่าในตนเอง",
        subtitle: "ดูรายละเอียดกิจกรรมด้านคุณค่าในตนเอง",
        slug: "self-worth",
      },
    ],
  },

  social: {
    title: "สุขภาวะทางสังคม",
    statusTitle: "สถานะสุขภาวะทางสังคม",
    description:
      "ผู้ใช้งานสามารถเลือกกิจกรรมเพื่อพัฒนาความสัมพันธ์และแรงสนับสนุนทางสังคมได้จากรายการด้านล่าง",
    activities: [
      {
        label: "ความสัมพันธ์ในครอบครัว",
        subtitle: "ดูรายละเอียดและตั้งเป้าหมายด้านครอบครัว",
        slug: "family-relationship",
      },
      {
        label: "มิตรภาพและเพื่อน",
        subtitle: "ดูรายละเอียดและตั้งเป้าหมายด้านมิตรภาพ",
        slug: "friendship",
      },
      {
        label: "แรงสนับสนุนทางสังคม",
        subtitle: "ดูรายละเอียดและตั้งเป้าหมายด้านแรงสนับสนุนทางสังคม",
        slug: "social-support",
      },
    ],
  },

  balance: {
    title: "ความพอใจในสุขสมดุลระหว่างการทำงาน ครอบครัว สังคม และชีวิตส่วนตัว",
    statusTitle: "สถานะความพอใจในสุขสมดุล",
    description:
      "ผู้ใช้งานสามารถเลือกกิจกรรมเพื่อพัฒนาความสมดุลของบทบาทต่าง ๆ ในชีวิตได้จากรายการด้านล่าง",
    activities: [
      {
        label: "การจัดสมดุลชีวิต",
        subtitle: "ดูรายละเอียดและตั้งเป้าหมายด้านสมดุลชีวิต",
        slug: "life-balance",
      },
      {
        label: "เวลาส่วนตัว",
        subtitle: "ดูรายละเอียดและตั้งเป้าหมายด้านเวลาส่วนตัว",
        slug: "personal-time",
      },
      {
        label: "สมดุลบทบาทชีวิต",
        subtitle: "ดูรายละเอียดและตั้งเป้าหมายด้านบทบาทชีวิต",
        slug: "role-balance",
      },
    ],
  },
};

function getActivityScore(goal: Goal) {
  const current = Number(goal.current_value) || 0;
  const target = Number(goal.target_value) || 0;
  if (target <= 0) return 0;
  return Math.round(Math.min(current / target, 1) * 100);
}

export default function GoalCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const config = CATEGORY_MAP[category ?? "physical"] ?? CATEGORY_MAP.physical;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGoals() {
      try {
        setLoading(true);
        setError(null);

        const response = await goalsService.listGoals();

        if (!response.success) {
          throw new Error(response.error || "ไม่สามารถโหลดข้อมูลเป้าหมายได้");
        }

        setGoals(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      } finally {
        setLoading(false);
      }
    }

    void loadGoals();
  }, []);

  const chartItems = useMemo(() => {
    if (category === "physical") {
      return config.activities.map((activity) => {
        const matched = goals.find(
          (goal) => goal.category === category && goal.activity === activity.slug
        );

        return {
          label: activity.label,
          score: matched ? getActivityScore(matched) : 0,
        };
      });
    }

    if (category === "mental") {
      return config.activities.map((activity) => {
        const matched = goals.find(
          (goal) => goal.category === category && goal.activity === activity.slug
        );

        return {
          label: activity.label,
          score: matched ? getActivityScore(matched) : 0,
        };
      });
    }

    return config.activities.map((activity) => ({
      label: activity.label,
      score: 0,
    }));
  }, [config.activities, goals, category]);

  return (
    <MobileShell>
      <AppHeader title={config.title} showBack showBell />

      <main className="space-y-4 px-4 py-4">
        {error ? (
          <InfoCard>
            <p className="text-sm text-rose-600">{error}</p>
          </InfoCard>
        ) : null}

        <InfoCard>
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {config.statusTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {config.description}
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                กำลังโหลดข้อมูลสุขภาวะ...
              </div>
            ) : (
              <CategoryRadarChart title={config.statusTitle} items={chartItems} />
            )}
          </div>
        </InfoCard>

        {config.activities.map((activity) => (
          <Link
            key={activity.slug}
            to={`/goals/${category}/${activity.slug}`}
            className="block"
          >
            <InfoCard>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-6 text-slate-900">
                    {activity.label}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {activity.subtitle}
                  </p>
                </div>

                <span className="text-sm text-slate-400">›</span>
              </div>
            </InfoCard>
          </Link>
        ))}
      </main>
    </MobileShell>
  );
}