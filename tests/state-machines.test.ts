import { describe, it, expect } from "vitest";
import {
  canTransition,
  assertTransition,
  SUBSCRIPTION_TRANSITIONS,
  INVOICE_TRANSITIONS,
} from "@/lib/state-machines";

describe("subscription transitions", () => {
  const all = Object.keys(SUBSCRIPTION_TRANSITIONS);
  for (const from of all) {
    for (const to of all) {
      const legal = SUBSCRIPTION_TRANSITIONS[from as keyof typeof SUBSCRIPTION_TRANSITIONS].includes(to as never);
      it(`${from} -> ${to} is ${legal ? "allowed" : "rejected"}`, () => {
        expect(canTransition("subscription", from, to)).toBe(legal);
      });
    }
  }
  it("follows the spec flow", () => {
    expect(canTransition("subscription", "DRAFT", "QUOTATION")).toBe(true);
    expect(canTransition("subscription", "QUOTATION", "CONFIRMED")).toBe(true);
    expect(canTransition("subscription", "CONFIRMED", "ACTIVE")).toBe(true);
    expect(canTransition("subscription", "ACTIVE", "CLOSED")).toBe(true);
    expect(canTransition("subscription", "DRAFT", "ACTIVE")).toBe(false);
  });
  it("assertTransition throws on illegal moves", () => {
    expect(() => assertTransition("subscription", "CLOSED", "ACTIVE")).toThrow();
  });
});

describe("invoice transitions", () => {
  const all = Object.keys(INVOICE_TRANSITIONS);
  for (const from of all) {
    for (const to of all) {
      const legal = INVOICE_TRANSITIONS[from as keyof typeof INVOICE_TRANSITIONS].includes(to as never);
      it(`${from} -> ${to} is ${legal ? "allowed" : "rejected"}`, () => {
        expect(canTransition("invoice", from, to)).toBe(legal);
      });
    }
  }
  it("paid and cancelled are final", () => {
    expect(canTransition("invoice", "PAID", "CANCELLED")).toBe(false);
    expect(() => assertTransition("invoice", "CANCELLED", "CONFIRMED")).toThrow();
  });
});
