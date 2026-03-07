export interface FamilyRelationshipTaskConfig {
  slug: string;
  label: string;
  completed?: boolean;
}

export const FAMILY_RELATIONSHIP_TASKS: FamilyRelationshipTaskConfig[] = [
  {
    slug: "smile-with-family",
    label: "ยิ้มแย้มแจ่มใสกับทุกคนในบ้าน",
    completed: true,
  },
  {
    slug: "take-responsibility",
    label: "รับผิดชอบต่อหน้าที่ที่ได้รับมอบหมาย",
  },
  {
    slug: "help-housework",
    label: "ช่วยงานบ้านทุกอย่างด้วยความเต็มใจ",
  },
  {
    slug: "care-for-family",
    label: "เอาใจใส่ในความเป็นอยู่ของคนในครอบครัว",
  },
  {
    slug: "listen-and-accept",
    label: "ฟังผู้อื่นพูดและยอมรับในความคิดเห็นของผู้อื่น",
    completed: true,
  },
  {
    slug: "no-aggressive-behavior",
    label: "ไม่แสดงกิริยาก้าวร้าวกับทุกคน",
  },
];