export const MINOR_UNITS_PER_MAJOR = 100;

export function add(...amounts: number[]): number {
  return amounts.reduce((sum, a) => sum + a, 0);
}

export function multiply(amount: number, quantity: number): number {
  return Math.round(amount * quantity);
}

export function percentage(amount: number, pct: number): number {
  const raw = amount * (pct / 100);
  const floor = Math.floor(raw);
  const frac = raw - floor;
  if (frac === 0.5) return floor % 2 === 0 ? floor : floor + 1;
  return Math.round(raw);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount / MINOR_UNITS_PER_MAJOR);
}

export function fromMajor(minor: number): number {
  return Math.round(minor * MINOR_UNITS_PER_MAJOR);
}

export function toMajor(minor: number): number {
  return minor / MINOR_UNITS_PER_MAJOR;
}