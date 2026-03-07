import { Link, useParams } from "react-router-dom";
import AppHeader from "../../../components/layout/AppHeader";
import MobileShell from "../../../components/layout/MobileShell";
import InfoCard from "../../../components/ui/InfoCard";

type CategoryConfig = {
  title: string;
  statusTitle: string;
  description: string;
  activities: Array<{
    label: string;
    subtitle: string;
    slug: string;
  }>;
};

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  physical: {
    title: "สุขภาวะทางกาย",
    statusTitle: "สถานะสุขภาวะทางกาย",
    description: "กิจกรรมที่เกี่ยวข้องกับการดูแลร่างกายและสุขภาพในชีวิตประจำวัน",
    activities: [
      {
        label: "การรับประทานอาหาร",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านการรับประทานอาหาร",
        slug: "food-intake",
      },
      {
        label: "การพักผ่อน",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านการพักผ่อน",
        slug: "rest",
      },
      {
        label: "การออกกำลังกาย",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านการออกกำลังกาย",
        slug: "exercise",
      },
      {
        label: "การดูแลรักษาความสะอาดของร่างกาย",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านการดูแลร่างกาย",
        slug: "body-hygiene",
      },
    ],
  },
  mental: {
    title: "สุขภาวะทางใจ",
    statusTitle: "สถานะสุขภาวะทางใจ",
    description: "กิจกรรมที่เกี่ยวข้องกับอารมณ์ ความคิด และการดูแลใจของตนเอง",
    activities: [
      {
        label: "การรับรู้อารมณ์",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านการรับรู้อารมณ์",
        slug: "emotional-awareness",
      },
      {
        label: "การจัดการความเครียด",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านการจัดการความเครียด",
        slug: "stress-management",
      },
      {
        label: "การดูแลใจตนเอง",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านการดูแลใจตนเอง",
        slug: "self-care",
      },
    ],
  },
  social: {
    title: "สุขภาวะทางสังคม",
    statusTitle: "สถานะสุขภาวะทางสังคม",
    description: "กิจกรรมที่เกี่ยวข้องกับความสัมพันธ์ การสื่อสาร และการได้รับแรงสนับสนุน",
    activities: [
      {
        label: "ความสัมพันธ์ในครอบครัว",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านครอบครัว",
        slug: "family-relationship",
      },
      {
        label: "มิตรภาพและเพื่อน",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านความสัมพันธ์กับเพื่อน",
        slug: "friendship",
      },
      {
        label: "แรงสนับสนุนทางสังคม",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านแรงสนับสนุนทางสังคม",
        slug: "social-support",
      },
    ],
  },
  balance: {
    title: "ความพอใจในสุขสมดุลระหว่างการทำงาน ครอบครัว สังคม และชีวิตส่วนตัว",
    statusTitle: "สถานะความพอใจในสุขสมดุล",
    description: "กิจกรรมที่เกี่ยวข้องกับความสมดุลของบทบาทต่าง ๆ ในชีวิต",
    activities: [
      {
        label: "การจัดสมดุลชีวิต",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านสมดุลชีวิต",
        slug: "life-balance",
      },
      {
        label: "เวลาส่วนตัว",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านเวลาส่วนตัว",
        slug: "personal-time",
      },
      {
        label: "สมดุลบทบาทชีวิต",
        subtitle: "ดูรายละเอียดและติดตามเป้าหมายด้านบทบาทชีวิต",
        slug: "role-balance",
      },
    ],
  },
};

export default function GoalCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const config = CATEGORY_MAP[category ?? "physical"] ?? CATEGORY_MAP.physical;

  return (
    <MobileShell>
      <AppHeader title={config.title} showBack showBell />

      <main className="space-y-4 px-4 py-4">
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

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[58%] rounded-full bg-slate-900" />
              </div>
              <p className="mt-2 text-sm text-slate-500">
                แสดงภาพรวมความก้าวหน้าของกิจกรรมในหมวดนี้
              </p>
            </div>
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