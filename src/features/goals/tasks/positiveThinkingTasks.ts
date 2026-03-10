export interface PositiveThinkingTaskConfig {
  slug: string;
  label: string;
  completed?: boolean;
}

export const POSITIVE_THINKING_TASKS: PositiveThinkingTaskConfig[] = [
  {
    slug: "accept-differences",
    label: "ยอมรับความแตกต่างของผู้อื่น",
    completed: true,
  },
  {
    slug: "smile-when-disappointed",
    label: "ยิ้มเสมอเมื่อเจอเรื่องน่าผิดหวัง",
  },
  {
    slug: "forgive-self-and-others",
    label: "ให้อภัยตนเองและผู้อื่น",
    completed: true,
  },
  {
    slug: "choose-constructive-news",
    label: "เลือกรับข้อมูลข่าวสารที่ดีและสร้างสรรค์",
  },
  {
    slug: "thank-for-happiness",
    label: "ขอบคุณเรื่องดีเล็ก ๆ ที่ทำให้เรามีความสุข",
    completed: true,
  },
  {
    slug: "leave-toxic-environment",
    label: "ออกจากสภาพแวดล้อมที่ไม่เป็นใจ",
  },
];
