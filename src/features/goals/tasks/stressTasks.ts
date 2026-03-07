export interface StressTaskConfig {
  slug: string;
  label: string;
  completed?: boolean;
}

export const STRESS_TASKS: StressTaskConfig[] = [
  {
    slug: "meditation",
    label: "นั่งสมาธิ",
  },
  {
    slug: "do-favorite-activities",
    label: "ทำกิจกรรมต่าง ๆ ที่ชอบ",
    completed: true,
  },
  {
    slug: "avoid-smoking-alcohol",
    label: "งดสูบบุหรี่และดื่มแอลกอฮอล์",
    completed: true,
  },
  {
    slug: "deep-breathing",
    label: "ฝึกการหายใจเข้า-ออกลึก ๆ",
  },
  {
    slug: "get-sunlight",
    label: "ออกไปเจอแสงแดด",
    completed: true,
  },
  {
    slug: "warm-drinks",
    label: "ดื่มเครื่องดื่มอุ่น ๆ",
  },
];