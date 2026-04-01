export interface SocialTaskConfig {
  slug: string;
  label: string;
  subtitle: string;
  type: "boolean";
}

export const SOCIAL_TASKS: SocialTaskConfig[] = [
  {
    slug: "family-relationship",
    label: "ความสัมพันธ์ระหว่างสมาชิกในครอบครัว",
    subtitle: "ดูแลบรรยากาศในบ้านด้วยความเข้าใจและการสื่อสารที่อ่อนโยน",
    type: "boolean",
  },
  {
    slug: "community-participation",
    label: "การมีส่วนร่วมในชุมชนและสังคมรอบข้าง",
    subtitle: "เปิดใจมีส่วนร่วมกับผู้คนและกิจกรรมรอบตัวอย่างเหมาะสม",
    type: "boolean",
  },
  {
    slug: "workplace-relationship",
    label: "ความสัมพันธ์ในที่ทำงาน",
    subtitle: "สร้างบรรยากาศการทำงานที่ร่วมมือกันได้ดีและสบายใจขึ้น",
    type: "boolean",
  },
];
