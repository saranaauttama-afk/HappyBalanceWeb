export type TaskType = "number" | "boolean" | "water";

export interface TaskConfig {
  slug: string;
  label: string;
  type: TaskType;
  target?: number;
  completed?: boolean;
}

export const REST_TASKS: TaskConfig[] = [
  {
    slug: "sleep",
    label: "การนอนหลับ",
    type: "number",
    target: 8,
    completed: true,
  },
  {
    slug: "drink-water",
    label: "การดื่มน้ำ",
    type: "water",
    target: 8,
  },
  {
    slug: "limit-screen-time",
    label: "จำกัดเวลาการใช้หน้าจอก่อนนอน",
    type: "boolean",
    target: 60,
  },
  {
    slug: "sleep-on-time",
    label: "เข้านอนและตื่นนอนตรงเวลา",
    type: "boolean",
    completed: true,
  },
  {
    slug: "avoid-water-before-bed",
    label: "ไม่ดื่มน้ำปริมาณมากก่อนนอน",
    type: "boolean",
  },
  {
    slug: "no-long-late-nap",
    label: "ไม่งีบหลับหลังบ่าย 3 โมงเกิน 1 ชม.",
    type: "boolean",
    completed: true,
  },
  {
    slug: "no-food-4-hours-before-bed",
    label: "งดอาหารอย่างน้อย 4 ชม. ก่อนนอน",
    type: "boolean",
    completed: true,
  },
];
