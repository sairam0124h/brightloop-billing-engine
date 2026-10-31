export type BillingInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function addInterval(date: Date, interval: BillingInterval, count = 1): Date {
  const d = new Date(date);
  if (interval === "DAILY") {
    d.setDate(d.getDate() + count);
    return d;
  }
  if (interval === "WEEKLY") {
    d.setDate(d.getDate() + count * 7);
    return d;
  }
  if (interval === "YEARLY") {
    d.setFullYear(d.getFullYear() + count);
    return d;
  }
  // MONTHLY
  const originalDay = d.getDate();
  const targetMonth = d.getMonth() + count;
  const targetYear = d.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const maxDay = lastDayOfMonth(targetYear, normalizedMonth);
  d.setFullYear(targetYear, normalizedMonth, Math.min(originalDay, maxDay));
  return d;
}

export function periodEnd(startDate: Date, interval: BillingInterval): Date {
  return addInterval(startDate, interval, 1);
}

export function dueDate(startDate: Date, paymentTerms: number): Date {
  const d = new Date(startDate);
  d.setDate(d.getDate() + paymentTerms);
  return d;
}