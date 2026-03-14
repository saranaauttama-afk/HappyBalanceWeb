export type TaskType = "number" | "boolean" | "water";

export interface TaskConfig {
  slug: string;
  label: string;
  type: TaskType;
  subtitle: string;
  helperText?: string;
  target?: number;
}

export const REST_TASKS: TaskConfig[] = [
  {
    slug: "sleep",
    label: "การนอนหลับ",
    type: "number",
    subtitle: "บันทึกชั่วโมงนอนจริงของแต่ละวันเพื่อนำมาเทียบกับเป้าหมาย",
    helperText: "ถ้านอนได้ถึงเป้าหมายของวันนั้น จะได้ 1 คะแนน",
    target: 8,
  },
  {
    slug: "drink-water",
    label: "การดื่มน้ำ",
    type: "water",
    subtitle: "ติดตามจำนวนแก้วน้ำที่ดื่มในแต่ละวันเทียบกับเป้าหมาย",
    helperText: "ใช้เป้าหมายเดียวกับหน้าตั้งค่าเพื่อให้คะแนนสอดคล้องกัน",
    target: 8,
  },
  {
    slug: "limit-screen-time",
    label: "จำกัดเวลาการใช้หน้าจอก่อนนอน",
    type: "boolean",
    subtitle: "เช็กว่าคืนนี้ลดเวลาหน้าจอก่อนนอนได้ตามที่ตั้งใจหรือไม่",
    target: 60,
  },
  {
    slug: "sleep-on-time",
    label: "เข้านอนและตื่นนอนตรงเวลา",
    type: "boolean",
    subtitle: "เช็กความสม่ำเสมอของเวลาเข้านอนและตื่นนอนในแต่ละวัน",
  },
  {
    slug: "avoid-water-before-bed",
    label: "ไม่ดื่มน้ำปริมาณมากก่อนนอน",
    type: "boolean",
    subtitle: "เลี่ยงการดื่มน้ำมากเกินไปใกล้เวลานอนเพื่อให้นอนต่อเนื่องขึ้น",
  },
  {
    slug: "no-long-late-nap",
    label: "ไม่งีบหลับหลังบ่าย 3 โมงเกิน 1 ชม.",
    type: "boolean",
    subtitle: "ช่วยให้ร่างกายยังง่วงพอดีเมื่อถึงเวลานอนตอนกลางคืน",
  },
  {
    slug: "no-food-4-hours-before-bed",
    label: "งดอาหารอย่างน้อย 4 ชม. ก่อนนอน",
    type: "boolean",
    subtitle: "ให้ระบบย่อยได้พักก่อนนอนเพื่อช่วยให้ร่างกายผ่อนลงได้ง่ายขึ้น",
  },
];
