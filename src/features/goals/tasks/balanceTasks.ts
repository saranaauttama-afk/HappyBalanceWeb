export interface BalanceTaskConfig {
  slug: string;
  label: string;
}

export const BALANCE_TASKS: BalanceTaskConfig[] = [
  {
    slug: "work-balance",
    label: "สมดุลระหว่างการทำงาน",
  },
  {
    slug: "family-social-balance",
    label: "สมดุลระหว่างครอบครัวและสังคม",
  },
  {
    slug: "personal-life-balance",
    label: "สมดุลระหว่างชีวิตส่วนตัว",
  },
];
