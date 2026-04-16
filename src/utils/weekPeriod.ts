function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return new Date(next.getFullYear(), next.getMonth(), next.getDate());
}

export function getStartOfWeek(date: Date) {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = normalized.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return addDays(normalized, -weekday); // rewind to Sunday
}

export function getCurrentWeekRange() {
  const today = new Date();
  const start = getStartOfWeek(today);
  const end = addDays(start, 6);

  return {
    from: toDateKey(start),
    to: toDateKey(end),
    weekStartDate: start,
    weekEndDate: end,
    weekStartKey: toDateKey(start),
  };
}

export function isCurrentWeek(weekStartDate: string) {
  return weekStartDate === getCurrentWeekRange().weekStartKey;
}
