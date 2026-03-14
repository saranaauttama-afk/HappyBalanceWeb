export type PersonalLifeBalanceTaskType = "boolean" | "counter";

export interface PersonalLifeBalanceTaskConfig {
  slug: string;
  label: string;
  subtitle: string;
  type: PersonalLifeBalanceTaskType;
  helperText?: string;
  completed?: boolean;
}

export const PERSONAL_LIFE_BALANCE_TASKS: PersonalLifeBalanceTaskConfig[] = [
  {
    slug: "mute-phone-after-work",
    label: "ปิดเสียงเตือนโทรศัพท์หลังเลิกงาน",
    subtitle: "ให้เวลาส่วนตัวหลังเลิกงานแบบไม่ถูกรบกวน",
    helperText: "บันทึกจำนวนครั้งที่ตั้งใจปิดแจ้งเตือนเพื่อพักจริง ๆ",
    type: "counter",
  },
  {
    slug: "listen-favorite-music",
    label: "ฟังเพลงที่ชอบ",
    subtitle: "เติมบรรยากาศดี ๆ ให้ตัวเองในวันทั่วไป",
    type: "boolean",
    completed: true,
  },
  {
    slug: "watch-favorite-movie",
    label: "ดูหนังที่ตนเองชอบ",
    subtitle: "เว้นเวลาให้ตัวเองได้พักและดูสิ่งที่ชอบ",
    type: "boolean",
  },
  {
    slug: "warm-water-skin-care",
    label: "แช่น้ำอุ่นเพื่อดูแลผิว",
    subtitle: "ดูแลตัวเองด้วยกิจกรรมผ่อนคลายเล็ก ๆ",
    helperText: "อุณหภูมิประมาณ 27-37 องศาเซลเซียส ระยะเวลาไม่เกิน 15 นาที",
    type: "counter",
    completed: true,
  },
  {
    slug: "read-interesting-book",
    label: "อ่านหนังสือที่สนใจ",
    subtitle: "กลับมาอยู่กับสิ่งที่อยากเรียนรู้หรือติดตาม",
    type: "boolean",
  },
  {
    slug: "read-novel",
    label: "อ่านนิยาย",
    subtitle: "ปล่อยใจไปกับเรื่องราวที่ช่วยให้ผ่อนคลาย",
    type: "boolean",
  },
  {
    slug: "cook-or-bake",
    label: "ทำอาหาร/ ทำขนม",
    subtitle: "ใช้เวลาอยู่กับครัวและความสุขเล็ก ๆ ของตัวเอง",
    type: "boolean",
  },
  {
    slug: "clean-the-house",
    label: "ทำความสะอาดบ้าน",
    subtitle: "จัดพื้นที่รอบตัวให้โล่งและสบายขึ้น",
    type: "boolean",
  },
  {
    slug: "sit-and-relax",
    label: "นั่งผ่อนคลาย",
    subtitle: "พักนิ่ง ๆ ให้ร่างกายและใจได้ช้าลงบ้าง",
    type: "boolean",
  },
  {
    slug: "reduce-phone-usage",
    label: "ลดการใช้โทรศัพท์",
    subtitle: "เว้นระยะจากหน้าจอเพื่อกลับมาอยู่กับตัวเองมากขึ้น",
    type: "boolean",
  },
  {
    slug: "develop-own-skill",
    label: "เพิ่มทักษะให้ตนเอง",
    subtitle: "ขยับตัวเองไปข้างหน้าทีละนิดในแบบที่อยากเป็น",
    type: "boolean",
  },
];
