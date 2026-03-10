export interface WorkplaceRelationshipTaskConfig {
  slug: string;
  label: string;
  completed?: boolean;
}

export const WORKPLACE_RELATIONSHIP_TASKS: WorkplaceRelationshipTaskConfig[] = [
  {
    slug: "compliment-colleagues",
    label: "ชื่นชมเพื่อนร่วมงาน",
  },
  {
    slug: "greet-others-first",
    label: "ยิ้มทักทายผู้อื่นก่อน",
  },
  {
    slug: "listen-to-opinions",
    label: "รับฟังความคิดเห็น",
    completed: true,
  },
  {
    slug: "share-items-with-colleagues",
    label: "แบ่งปันสิ่งของให้เพื่อนร่วมงาน",
  },
  {
    slug: "start-conversation",
    label: "ชวนเพื่อนร่วมงานพูดคุยก่อน",
  },
  {
    slug: "share-information",
    label: "แบ่งปันข้อมูลกับเพื่อนร่วมงาน",
  },
];
