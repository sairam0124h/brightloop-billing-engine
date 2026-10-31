import { describe, it, expect } from "vitest";
import { addInterval, periodEnd, dueDate } from "@/lib/billing-dates";

describe("billing-dates", () => {
  it("adds daily interval", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect(addInterval(d, "DAILY", 5).toISOString()).toBe("2024-01-06T00:00:00.000Z");
  });

  it("adds weekly interval", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect(addInterval(d, "WEEKLY", 1).toISOString()).toBe("2024-01-08T00:00:00.000Z");
  });

  it("adds monthly interval with month-end handling", () => {
    const d = new Date("2024-01-31T00:00:00Z");
    expect(addInterval(d, "MONTHLY", 1).toISOString()).toBe("2024-02-29T00:00:00.000Z");
  });

  it("adds yearly interval", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect(addInterval(d, "YEARLY", 1).toISOString()).toBe("2025-01-01T00:00:00.000Z");
  });

  it("periodEnd returns next interval", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect(periodEnd(d, "MONTHLY").toISOString()).toBe("2024-02-01T00:00:00.000Z");
  });

  it("dueDate from payment terms", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect(dueDate(d, 14).toISOString()).toBe("2024-01-15T00:00:00.000Z");
  });
});