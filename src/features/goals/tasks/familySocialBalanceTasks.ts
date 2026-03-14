export type FamilySocialBalanceTaskType = "boolean" | "counter";

export interface FamilySocialBalanceTaskConfig {
  slug: string;
  label: string;
  subtitle: string;
  type: FamilySocialBalanceTaskType;
  helperText?: string;
}

export const FAMILY_SOCIAL_BALANCE_TASKS: FamilySocialBalanceTaskConfig[] = [
  {
    slug: "make-time-for-family-social",
    label: "มีเวลาสำหรับกิจกรรมของคนในครอบครัวและสังคม",
    subtitle: "จัดเวลาให้ความสัมพันธ์สำคัญได้เติบโตอย่างสม่ำเสมอ",
    type: "boolean",
  },
  {
    slug: "open-mind-and-listen",
    label: "เปิดใจให้กว้างรับฟังสิ่งที่อีกฝ่ายพูด",
    subtitle: "ฟังกันด้วยความตั้งใจโดยไม่รีบตัดสิน",
    type: "boolean",
  },
  {
    slug: "say-thanks-or-sorry",
    label: "พูดขอบคุณ หรือขอโทษผู้อื่น",
    subtitle: "เก็บจำนวนครั้งของคำพูดดี ๆ ที่ช่วยดูแลความสัมพันธ์ในแต่ละวัน",
    helperText: "บันทึกได้ทั้งคำว่าขอบคุณและขอโทษ อย่างน้อย 1 ครั้งจะได้ 1 คะแนน",
    type: "counter",
  },
  {
    slug: "speak-clearly-and-gently",
    label: "พูดให้ชัดเจน และพูดอย่างอ่อนโยน",
    subtitle: "สื่อสารให้ตรงใจโดยยังคงความนุ่มนวล",
    type: "boolean",
  },
  {
    slug: "encourage-others",
    label: "พูดให้กำลังใจผู้อื่น",
    subtitle: "เติมแรงใจเล็ก ๆ ให้คนรอบตัวในจังหวะที่เหมาะสม",
    type: "boolean",
  },
  {
    slug: "create-joy-with-laughter",
    label: "สร้างความรู้สึกดี ๆ ด้วยเสียงหัวเราะ",
    subtitle: "ชวนบรรยากาศรอบตัวให้ผ่อนคลายและอบอุ่นขึ้น",
    type: "boolean",
  },
];
