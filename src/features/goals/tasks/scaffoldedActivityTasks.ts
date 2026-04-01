export type ScaffoldedTaskConfig = {
  slug: string;
  label: string;
  subtitle: string;
  type?: "boolean";
  helperText?: string;
};

export type ScaffoldedActivityConfig = {
  category: "physical" | "mental";
  activity: string;
  title: string;
  subtitle: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroImage: string;
  heroBadge: string;
  taskTypeLabel: string;
  tasks: ScaffoldedTaskConfig[];
};

export const SCAFFOLDED_ACTIVITY_CONFIGS: ScaffoldedActivityConfig[] = [
  {
    category: "physical",
    activity: "food-intake",
    title: "การรับประทานอาหาร",
    subtitle: "ติดตามพฤติกรรมการกินพื้นฐานที่ช่วยดูแลร่างกายในแต่ละวัน",
    heroEyebrow: "FOOD INTAKE",
    heroHeadline: "กินดีขึ้นทีละมื้อ",
    heroImage:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
    heroBadge: "🥗",
    taskTypeLabel: "Yes / No",
    tasks: [
      {
        slug: "eat-breakfast",
        label: "รับประทานอาหารเช้า",
        subtitle: "เริ่มวันด้วยมื้อเช้าเพื่อให้ร่างกายมีพลังงานตั้งต้น",
      },
      {
        slug: "eat-vegetables",
        label: "รับประทานผักหรือผลไม้",
        subtitle: "เติมใยอาหารและสารอาหารที่ช่วยให้ร่างกายสมดุลขึ้น",
      },
      {
        slug: "avoid-sugary-drinks",
        label: "หลีกเลี่ยงเครื่องดื่มหวานจัด",
        subtitle: "ลดน้ำตาลส่วนเกินที่ทำให้ร่างกายล้าและหิวง่ายขึ้น",
      },
      {
        slug: "eat-on-time",
        label: "รับประทานอาหารตรงเวลา",
        subtitle: "ช่วยให้ร่างกายคุ้นกับจังหวะการกินที่สม่ำเสมอมากขึ้น",
      },
    ],
  },
  {
    category: "physical",
    activity: "exercise",
    title: "การออกกำลังกาย",
    subtitle: "ติดตามการขยับร่างกายในแบบที่ทำได้จริงระหว่างวัน",
    heroEyebrow: "EXERCISE",
    heroHeadline: "ขยับร่างกายให้สดขึ้น",
    heroImage:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    heroBadge: "🏃",
    taskTypeLabel: "Yes / No",
    tasks: [
      {
        slug: "walk-30-minutes",
        label: "เดินต่อเนื่องอย่างน้อย 30 นาที",
        subtitle: "เพิ่มการเคลื่อนไหวให้หัวใจและร่างกายได้ทำงานมากขึ้น",
      },
      {
        slug: "stretch-body",
        label: "ยืดเหยียดร่างกาย",
        subtitle: "คลายความตึงตัวจากการนั่งหรืออยู่ท่าเดิมนานเกินไป",
      },
      {
        slug: "use-stairs",
        label: "เลือกใช้บันไดแทนลิฟต์",
        subtitle: "เติมการเคลื่อนไหวเล็ก ๆ ระหว่างวันให้เกิดขึ้นจริง",
      },
      {
        slug: "active-break",
        label: "ลุกขยับระหว่างวัน",
        subtitle: "หยุดพักสั้น ๆ เพื่อขยับตัวและรีเซ็ตร่างกายเป็นระยะ",
      },
    ],
  },
  {
    category: "physical",
    activity: "body-hygiene",
    title: "การดูแลรักษาความสะอาดของร่างกาย",
    subtitle: "เช็กกิจวัตรพื้นฐานที่ช่วยดูแลความสะอาดและความสบายตัว",
    heroEyebrow: "BODY HYGIENE",
    heroHeadline: "ดูแลตัวเองให้สบายตัว",
    heroImage:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
    heroBadge: "🧼",
    taskTypeLabel: "Yes / No",
    tasks: [
      {
        slug: "brush-teeth",
        label: "แปรงฟันอย่างน้อย 2 ครั้ง",
        subtitle: "ดูแลความสะอาดช่องปากให้สดชื่นและลดการสะสมของคราบ",
      },
      {
        slug: "take-shower",
        label: "อาบน้ำและดูแลร่างกาย",
        subtitle: "ช่วยให้ร่างกายรู้สึกสะอาด ผ่อนคลาย และพร้อมสำหรับวันถัดไป",
      },
      {
        slug: "wash-hands",
        label: "ล้างมือสม่ำเสมอ",
        subtitle: "ลดการสะสมของเชื้อโรคจากกิจกรรมที่ต้องสัมผัสสิ่งของร่วมกัน",
      },
      {
        slug: "change-clean-clothes",
        label: "เปลี่ยนเสื้อผ้าสะอาด",
        subtitle: "ช่วยให้ร่างกายสบายตัวและลดความอับชื้นระหว่างวัน",
      },
    ],
  },
  {
    category: "mental",
    activity: "life-satisfaction",
    title: "ระดับความพึงพอใจในชีวิต",
    subtitle: "ติดตามมุมเล็ก ๆ ที่ช่วยให้รู้สึกว่าชีวิตไปในทางที่ดีขึ้น",
    heroEyebrow: "LIFE SATISFACTION",
    heroHeadline: "เช็กความพอใจในชีวิตทีละนิด",
    heroImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    heroBadge: "🌷",
    taskTypeLabel: "Yes / No",
    tasks: [
      {
        slug: "feel-good-about-today",
        label: "รู้สึกดีกับวันนี้ของตัวเอง",
        subtitle: "สำรวจว่าตลอดวันมีสิ่งที่ทำให้คุณรู้สึกพอใจกับชีวิตบ้างหรือไม่",
      },
      {
        slug: "life-has-direction",
        label: "รู้สึกว่าชีวิตมีทิศทาง",
        subtitle: "มองเห็นเป้าหมายหรือเหตุผลบางอย่างที่ทำให้ยังอยากเดินต่อ",
      },
      {
        slug: "meaningful-time",
        label: "ใช้เวลากับสิ่งที่มีความหมาย",
        subtitle: "ได้ทำสิ่งที่สำคัญหรือมีความหมายกับตัวเองในวันนี้บ้างหรือไม่",
      },
      {
        slug: "satisfied-with-routine",
        label: "พอใจกับจังหวะชีวิตประจำวัน",
        subtitle: "จังหวะการใช้ชีวิตวันนี้รู้สึกพอดีและไม่หนักเกินไปหรือไม่",
      },
    ],
  },
  {
    category: "mental",
    activity: "self-worth",
    title: "การรู้สึกมีคุณค่าในตนเอง",
    subtitle: "ติดตามการมองเห็นคุณค่าและการปฏิบัติต่อตัวเองอย่างอ่อนโยน",
    heroEyebrow: "SELF WORTH",
    heroHeadline: "เห็นคุณค่าของตัวเองให้ชัดขึ้น",
    heroImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
    heroBadge: "💗",
    taskTypeLabel: "Yes / No",
    tasks: [
      {
        slug: "notice-own-strength",
        label: "มองเห็นจุดแข็งของตัวเอง",
        subtitle: "ได้ยอมรับหรือเห็นข้อดีบางอย่างของตัวเองในวันนี้หรือไม่",
      },
      {
        slug: "speak-kindly-to-self",
        label: "พูดกับตัวเองอย่างอ่อนโยน",
        subtitle: "ลดการตำหนิตัวเองเกินจำเป็นและเลือกใช้ถ้อยคำที่ใจรับไหว",
      },
      {
        slug: "accept-imperfection",
        label: "ยอมรับความไม่สมบูรณ์แบบของตัวเอง",
        subtitle: "ยอมให้ตัวเองผิดพลาดได้โดยไม่ลดคุณค่าของตัวเองลง",
      },
      {
        slug: "believe-can-handle-problems",
        label: "เชื่อว่าตัวเองรับมือปัญหาได้",
        subtitle: "ยังรู้สึกว่าตัวเองมีพลังพอจะค่อย ๆ จัดการสิ่งที่เจออยู่",
      },
    ],
  },
];

export function getScaffoldedActivityConfig(category?: string, activity?: string) {
  return SCAFFOLDED_ACTIVITY_CONFIGS.find(
    (item) => item.category === category && item.activity === activity
  );
}
