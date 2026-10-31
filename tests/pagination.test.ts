import { describe, it, expect } from "vitest";
import { clampPage, clampPageSize, MAX_PAGE_SIZE } from "@/lib/pagination";

describe("pagination", () => {
  it("clamps page", () => {
    expect(clampPage(0)).toBe(1);
    expect(clampPage(3)).toBe(3);
  });

  it("clamps page size to max", () => {
    expect(clampPageSize(1000)).toBe(MAX_PAGE_SIZE);
    expect(clampPageSize(50)).toBe(50);
    expect(clampPageSize(0)).toBe(20);
  });
});