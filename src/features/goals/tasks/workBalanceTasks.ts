export interface WorkBalanceTaskConfig {
  slug: string;
  label: string;
  subtitle: string;
  type: "boolean";
  helperText?: string;
}

export const WORK_BALANCE_TASKS: WorkBalanceTaskConfig[] = [
  {
    slug: "schedule-daily-routine",
    label: "จัดตารางวันและเวลาประจำวัน",
    subtitle: "วางจังหวะงานให้ชัดเพื่อไม่ให้วันทั้งวันไหลไปแบบไร้ทิศทาง",
    type: "boolean",
  },
  {
    slug: "do-disliked-task-10-minutes",
    label: "ทำในสิ่งที่ไม่ชอบในเวลา 10 นาที",
    subtitle: "เริ่มจากช่วงเวลาสั้น ๆ เพื่อเคลียร์งานที่ค้างใจให้ง่ายขึ้น",
    type: "boolean",
  },
  {
    slug: "avoid-multitasking",
    label: "หลีกเลี่ยงการทำหลายอย่างพร้อมกัน",
    subtitle: "โฟกัสทีละอย่างเพื่อลดความล้าและความผิดพลาดระหว่างทำงาน",
    type: "boolean",
  },
  {
    slug: "take-short-breaks",
    label: "พักเบรกสั้น ๆ ระหว่างการทำงาน",
    subtitle: "เว้นช่วงเล็กน้อยให้สมองและร่างกายได้รีเซ็ตระหว่างวัน",
    type: "boolean",
  },
  {
    slug: "reduce-social-media",
    label: "ลดการใช้ Social Media",
    subtitle: "กันเวลาจากหน้าจอที่ไม่จำเป็นเพื่อคืนสมาธิให้กับงานหลัก",
    type: "boolean",
  },
  {
    slug: "prioritize-tasks",
    label: "ลำดับความสำคัญก่อนหลัง",
    subtitle: "เลือกทำสิ่งที่สำคัญก่อน เพื่อให้พลังงานถูกใช้กับงานที่คุ้มที่สุด",
    type: "boolean",
  },
];
