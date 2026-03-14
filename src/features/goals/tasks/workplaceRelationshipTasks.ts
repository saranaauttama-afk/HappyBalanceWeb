export type WorkplaceRelationshipTaskType = "boolean" | "counter";

export interface WorkplaceRelationshipTaskConfig {
  slug: string;
  label: string;
  subtitle: string;
  type: WorkplaceRelationshipTaskType;
  helperText?: string;
  completed?: boolean;
}

export const WORKPLACE_RELATIONSHIP_TASKS: WorkplaceRelationshipTaskConfig[] = [
  {
    slug: "compliment-colleagues",
    label: "ชื่นชมเพื่อนร่วมงาน",
    subtitle: "ส่งต่อคำพูดดี ๆ เพื่อให้บรรยากาศการทำงานอบอุ่นขึ้น",
    type: "boolean",
  },
  {
    slug: "greet-others-first",
    label: "ยิ้มทักทายผู้อื่นก่อน",
    subtitle: "เริ่มต้นบทสนทนาด้วยท่าทีที่เป็นมิตรและเปิดใจ",
    type: "boolean",
  },
  {
    slug: "listen-to-opinions",
    label: "รับฟังความคิดเห็น",
    subtitle: "ฟังมุมมองของเพื่อนร่วมงานอย่างตั้งใจเพื่อทำงานร่วมกันได้ดีขึ้น",
    type: "boolean",
    completed: true,
  },
  {
    slug: "share-items-with-colleagues",
    label: "แบ่งปันสิ่งของให้เพื่อนร่วมงาน",
    subtitle: "เก็บจำนวนครั้งของการแบ่งปันเล็ก ๆ ที่ช่วยสร้างความสัมพันธ์ที่ดีในที่ทำงาน",
    helperText: "บันทึกจำนวนครั้งที่แบ่งปันสิ่งของ อย่างน้อย 1 ครั้งจะได้ 1 คะแนน",
    type: "counter",
  },
  {
    slug: "start-conversation",
    label: "ชวนเพื่อนร่วมงานพูดคุยก่อน",
    subtitle: "สร้างพื้นที่สบาย ๆ สำหรับการสื่อสารและความคุ้นเคยระหว่างกัน",
    type: "boolean",
  },
  {
    slug: "share-information",
    label: "แบ่งปันข้อมูลกับเพื่อนร่วมงาน",
    subtitle: "ส่งต่อข้อมูลที่จำเป็นเพื่อให้การทำงานร่วมกันลื่นไหลขึ้น",
    type: "boolean",
  },
];
