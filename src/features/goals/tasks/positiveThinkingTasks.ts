export interface PositiveThinkingTaskConfig {
  slug: string;
  label: string;
  subtitle: string;
  type: "boolean" | "counter";
  helperText?: string;
  completed?: boolean;
}

export const POSITIVE_THINKING_TASKS: PositiveThinkingTaskConfig[] = [
  {
    slug: "accept-differences",
    label: "ยอมรับความแตกต่างของผู้อื่น",
    subtitle: "เปิดใจรับมุมมองและความต่างของผู้อื่นอย่างอ่อนโยน",
    type: "boolean",
    completed: true,
  },
  {
    slug: "smile-when-disappointed",
    label: "ยิ้มเสมอเมื่อเจอเรื่องน่าผิดหวัง",
    subtitle: "บันทึกจำนวนครั้งที่ยังเลือกยิ้มและตั้งหลักเมื่อเจอเรื่องไม่เป็นใจ",
    type: "counter",
    helperText: "อย่างน้อย 1 ครั้งในวันนั้น จะได้ 1 คะแนน",
  },
  {
    slug: "forgive-self-and-others",
    label: "ให้อภัยตนเองและผู้อื่น",
    subtitle: "วางความค้างคาเพื่อให้ใจเบาและเดินต่อได้",
    type: "boolean",
    completed: true,
  },
  {
    slug: "choose-constructive-news",
    label: "เลือกรับข้อมูลข่าวสารที่ดีและสร้างสรรค์",
    subtitle: "เลือกรับข้อมูลที่ช่วยเติมพลังและพามุมมองไปในทางสร้างสรรค์",
    type: "boolean",
  },
  {
    slug: "thank-for-happiness",
    label: "ขอบคุณเรื่องดีเล็ก ๆ ที่ทำให้เรามีความสุข",
    subtitle: "มองเห็นเรื่องดีเล็ก ๆ แล้วขอบคุณสิ่งที่ทำให้ใจมีความสุข",
    type: "boolean",
    completed: true,
  },
  {
    slug: "leave-toxic-environment",
    label: "ออกจากสภาพแวดล้อมที่ไม่เป็นใจ",
    subtitle: "ค่อย ๆ ถอยออกจากบรรยากาศที่บั่นทอนใจเมื่อทำได้",
    type: "boolean",
  },
];
