export type FamilyRelationshipTaskType = "boolean" | "counter";

export interface FamilyRelationshipTaskConfig {
  slug: string;
  label: string;
  subtitle: string;
  type: FamilyRelationshipTaskType;
  helperText?: string;
}

export const FAMILY_RELATIONSHIP_TASKS: FamilyRelationshipTaskConfig[] = [
  {
    slug: "smile-with-family",
    label: "ยิ้มแย้มแจ่มใสกับทุกคนในบ้าน",
    subtitle: "เริ่มต้นบรรยากาศดี ๆ ในบ้านจากสีหน้าและท่าทีที่อ่อนโยน",
    type: "boolean",
  },
  {
    slug: "take-responsibility",
    label: "รับผิดชอบต่อหน้าที่ที่ได้รับมอบหมาย",
    subtitle: "ดูแลบทบาทของตัวเองให้คนในบ้านรู้สึกไว้ใจและพึ่งพาได้",
    type: "boolean",
  },
  {
    slug: "help-housework",
    label: "ช่วยงานบ้านทุกอย่างด้วยความเต็มใจ",
    subtitle: "แบ่งเบาภาระเล็ก ๆ ในบ้านเพื่อให้ทุกคนสบายใจขึ้น",
    type: "boolean",
  },
  {
    slug: "care-for-family",
    label: "เอาใจใส่ในความเป็นอยู่ของคนในครอบครัว",
    subtitle: "ใส่ใจความรู้สึกและความเป็นอยู่ของคนใกล้ตัวอย่างสม่ำเสมอ",
    type: "boolean",
  },
  {
    slug: "listen-and-accept",
    label: "ฟังผู้อื่นพูดและยอมรับในความคิดเห็นของผู้อื่น",
    subtitle: "เก็บจำนวนครั้งที่ตั้งใจฟังและเปิดใจรับความคิดเห็นในแต่ละวัน",
    helperText: "บันทึกจำนวนครั้งที่รับฟังและยอมรับความคิดเห็น อย่างน้อย 1 ครั้งจะได้ 1 คะแนน",
    type: "counter",
  },
  {
    slug: "no-aggressive-behavior",
    label: "ไม่แสดงกิริยาก้าวร้าวกับทุกคน",
    subtitle: "ควบคุมอารมณ์และสื่อสารอย่างนุ่มนวลเมื่ออยู่ร่วมกับคนในบ้าน",
    type: "boolean",
  },
];
