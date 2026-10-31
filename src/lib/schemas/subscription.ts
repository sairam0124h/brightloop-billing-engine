import { z } from "zod";

const subscriptionLineSchema = z.object({
  productId: z.string().uuid().optional(),
  productVariantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().int().min(0),
});

export const createSubscriptionSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  startDate: z.string().datetime({ offset: true }).or(z.string().date()),
  paymentTerms: z.number().int().min(0).default(15),
  lines: z.array(subscriptionLineSchema).min(1, "At least one line is required"),
});

export const transitionSchema = z.object({
  to: z.enum(["DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED"]),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  method: z.string().min(1).max(50),
  amount: z.number().int().min(1, "Amount must be positive"),
  paidAt: z.string().datetime({ offset: true }).or(z.string().date()),
  note: z.string().max(500).optional(),
  idempotencyKey: z.string().min(1).max(100),
});

