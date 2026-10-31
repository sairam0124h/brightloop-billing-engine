import { describe, it, expect } from "vitest";
import { getUnitPrice } from "../src/lib/pricing";

describe("Pricing logic", () => {
  it("calculates unit price without variant", () => {
    const product = { salesPrice: 50000 };
    expect(getUnitPrice(product)).toBe(50000);
    expect(getUnitPrice(product, null)).toBe(50000);
  });

  it("calculates unit price with variant extra price", () => {
    const product = { salesPrice: 50000 };
    const variant = { extraPrice: 56000 };
    expect(getUnitPrice(product, variant)).toBe(106000);
  });
});

