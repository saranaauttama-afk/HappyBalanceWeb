import type { Goal } from "../types/models";

export function calculateWellbeingScores(goals: Goal[]) {
  const categories = ["physical", "mental", "social", "balance"];

  const scores: Record<string, number> = {
    physical: 0,
    mental: 0,
    social: 0,
    balance: 0,
  };

  categories.forEach((category) => {
    const items = goals.filter((g) => g.category === category);

    if (items.length === 0) {
      scores[category] = 0;
      return;
    }

    const total =
      items.reduce((sum, item) => {
        const current = Number(item.current_value) || 0;
        const target = Number(item.target_value) || 0;

        if (target <= 0) return sum;

        return sum + Math.min(current / target, 1);
      }, 0) / items.length;

    scores[category] = Math.round(total * 100);
  });

  return scores;
}