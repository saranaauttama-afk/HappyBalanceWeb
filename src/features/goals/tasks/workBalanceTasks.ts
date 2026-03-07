export interface WorkBalanceTaskConfig {
  slug: string;
  label: string;
  completed?: boolean;
}

export const WORK_BALANCE_TASKS: WorkBalanceTaskConfig[] = [
  {
    slug: "schedule-daily-routine",
    label: "จัดตารางวันและเวลาประจำวัน",
  },
  {
    slug: "do-disliked-task-10-minutes",
    label: "ทำในสิ่งที่ไม่ชอบในเวลา 10 นาที",
  },
  {
    slug: "avoid-multitasking",
    label: "หลีกเลี่ยงการทำหลายอย่างพร้อมกัน",
    completed: true,
  },
  {
    slug: "take-short-breaks",
    label: "พักเบรกสั้น ๆ ระหว่างการทำงาน",
    completed: true,
  },
  {
    slug: "reduce-social-media",
    label: "ลดการใช้ Social Media",
  },
  {
    slug: "prioritize-tasks",
    label: "ลำดับความสำคัญก่อนหลัง",
  },
];