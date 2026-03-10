export interface FamilySocialBalanceTaskConfig {
  slug: string;
  label: string;
  completed?: boolean;
}

export const FAMILY_SOCIAL_BALANCE_TASKS: FamilySocialBalanceTaskConfig[] = [
  {
    slug: "make-time-for-family-social",
    label: "มีเวลาสำหรับกิจกรรมของคนในครอบครัวและสังคม",
  },
  {
    slug: "open-mind-and-listen",
    label: "เปิดใจให้กว้างรับฟังสิ่งที่อีกฝ่ายพูด",
    completed: true,
  },
  {
    slug: "say-thanks-or-sorry",
    label: "พูดขอบคุณ หรือขอโทษผู้อื่น",
  },
  {
    slug: "speak-clearly-and-gently",
    label: "พูดให้ชัดเจน และพูดอย่างอ่อนโยน",
  },
  {
    slug: "encourage-others",
    label: "พูดให้กำลังใจผู้อื่น",
    completed: true,
  },
  {
    slug: "create-joy-with-laughter",
    label: "สร้างความรู้สึกดี ๆ ด้วยเสียงหัวเราะ",
    completed: true,
  },
];
