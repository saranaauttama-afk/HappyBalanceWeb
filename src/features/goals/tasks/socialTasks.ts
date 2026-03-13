export interface SocialTaskConfig {
  slug: string;
  label: string;
  completed?: boolean;
}

export const SOCIAL_TASKS: SocialTaskConfig[] = [
  {
    slug: "family-relationship",
    label: "ความสัมพันธ์ระหว่างสมาชิกในครอบครัว",
    completed: true,
  },
  {
    slug: "community-participation",
    label: "การมีส่วนร่วมในชุมชนและสังคมรอบข้าง",
  },
  {
    slug: "workplace-relationship",
    label: "ความสัมพันธ์ในที่ทำงาน",
    completed: true,
  },
];
