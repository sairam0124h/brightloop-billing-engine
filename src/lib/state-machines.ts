import { ConflictError } from "./errors";

export type SubscriptionStatus = "DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED";
export type InvoiceStatus = "DRAFT" | "CONFIRMED" | "PAID" | "CANCELLED";

export const SUBSCRIPTION_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  DRAFT: ["QUOTATION"],
  QUOTATION: ["CONFIRMED", "CLOSED"],
  CONFIRMED: ["ACTIVE", "CLOSED"],
  ACTIVE: ["PAUSED", "CLOSED"],
  PAUSED: ["ACTIVE", "CLOSED"],
  CLOSED: [],
};

export const INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PAID", "CANCELLED"],
  PAID: [],
  CANCELLED: [],
};

export type Kind = "subscription" | "invoice";

function table(kind: Kind): Record<string, string[]> {
  return kind === "subscription" ? SUBSCRIPTION_TRANSITIONS : INVOICE_TRANSITIONS;
}

export function canTransition(kind: Kind, from: string, to: string): boolean {
  return (table(kind)[from] ?? []).includes(to);
}

export function assertTransition(kind: Kind, from: string, to: string): void {
  if (!canTransition(kind, from, to)) {
    throw new ConflictError(`Cannot move ${kind} from ${from} to ${to}`);
  }
}
