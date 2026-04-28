function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return new Date(next.getFullYear(), next.getMonth(), next.getDate());
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  return next;
}

export function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getCurrentMonthRange() {
  const today = new Date();
  const start = getStartOfMonth(today);
  const end = getEndOfMonth(today);

  return {
    from: toDateKey(start),
    to: toDateKey(end),
    monthKey: toMonthKey(today),
    monthStartDate: start,
    monthEndDate: end,
  };
}

export function isCurrentMonth(monthKey: string) {
  return monthKey === toMonthKey(new Date());
}

// Legacy week helpers kept for any remaining references
export function getStartOfWeek(date: Date) {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = normalized.getDay();
  return addDays(normalized, -weekday);
}

export function getCurrentWeekRange() {
  const { from, to } = getCurrentMonthRange();
  return { from, to };
}

export function isCurrentWeek(weekStartDate: string) {
  return isCurrentMonth(weekStartDate.slice(0, 7));
}
