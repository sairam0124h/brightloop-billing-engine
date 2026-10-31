import { describe, it, expect } from "vitest";
import { add, multiply, percentage, formatINR, fromMajor, toMajor } from "@/lib/money";

describe("money", () => {
  it("adds minor units", () => {
    expect(add(100, 200)).toBe(300);
  });

  it("multiplies by quantity", () => {
    expect(multiply(100, 3)).toBe(300);
  });

  it("percentage with half-even rounding", () => {
    expect(percentage(100, 10)).toBe(10);
    expect(percentage(100, 5)).toBe(5);
    expect(percentage(101, 50)).toBe(50);
    expect(percentage(100, 33.33)).toBe(33);
  });

  it("formats INR", () => {
    expect(formatINR(10000)).toContain("₹");
    expect(formatINR(10000)).toContain("100.00");
  });

  it("converts major to minor units", () => {
    expect(fromMajor(1)).toBe(100);
    expect(fromMajor(1.5)).toBe(150);
  });

  it("converts minor units to major", () => {
    expect(toMajor(100)).toBe(1);
    expect(toMajor(150)).toBe(1.5);
  });
});