export type MentalTaskType = "scale" | "boolean" | "text";

export interface MentalTaskConfig {
  slug: string;
  label: string;
  type: MentalTaskType;
  completed?: boolean;
}

export const MENTAL_TASKS: MentalTaskConfig[] = [
  {
    slug: "positive-thinking",
    label: "การมองโลกในแง่บวก",
    type: "scale",
    completed: true,
  },
  {
    slug: "stress-level",
    label: "ระดับความเครียด",
    type: "scale",
  },
  {
    slug: "life-satisfaction",
    label: "ระดับความพึงพอใจในชีวิต",
    type: "scale",
    completed: true,
  },
  {
    slug: "self-worth",
    label: "การรู้สึกมีคุณค่าในตนเอง",
    type: "scale",
  },
];
