export interface StressTaskConfig {
  slug: string;
  label: string;
  subtitle: string;
  type: "boolean" | "counter";
  helperText?: string;
}

export const STRESS_TASKS: StressTaskConfig[] = [
  {
    slug: "meditation",
    label: "นั่งสมาธิ",
    subtitle: "หยุดพักใจสั้น ๆ เพื่อให้ความคิดและร่างกายค่อย ๆ ผ่อนลง",
    type: "boolean",
  },
  {
    slug: "do-favorite-activities",
    label: "ทำกิจกรรมต่าง ๆ ที่ชอบ",
    subtitle: "ให้เวลากับกิจกรรมที่ช่วยเติมพลังและคลายความตึงเครียด",
    type: "boolean",
  },
  {
    slug: "avoid-smoking-alcohol",
    label: "งดสูบบุหรี่และดื่มแอลกอฮอล์",
    subtitle: "ลดสิ่งกระตุ้นที่ยิ่งทำให้ร่างกายและอารมณ์อ่อนล้า",
    type: "boolean",
  },
  {
    slug: "deep-breathing",
    label: "ฝึกการหายใจเข้า-ออกลึก ๆ",
    subtitle: "ใช้ลมหายใจช่วยตั้งหลักเมื่อรู้สึกกดดันหรือใจเต้นเร็ว",
    type: "boolean",
  },
  {
    slug: "get-sunlight",
    label: "ออกไปเจอแสงแดด",
    subtitle: "บันทึกจำนวนครั้งที่ได้ออกไปรับแสงธรรมชาติในแต่ละวัน",
    type: "counter",
    helperText: "อย่างน้อย 1 ครั้งในวันนั้น จะได้ 1 คะแนน",
  },
  {
    slug: "warm-drinks",
    label: "ดื่มเครื่องดื่มอุ่น ๆ",
    subtitle: "ใช้จังหวะเล็ก ๆ ระหว่างวันช่วยให้ร่างกายรู้สึกผ่อนคลายขึ้น",
    type: "boolean",
  },
];
