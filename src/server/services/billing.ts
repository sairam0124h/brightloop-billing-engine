import { prisma } from "@/lib/prisma";
import { addInterval, periodEnd, dueDate } from "@/lib/billing-dates";
import { add, multiply } from "@/lib/money";
import type { BillingInterval } from "@/lib/billing-dates";

interface BillingResult {
  created: number;
  skipped: number;
  failed: number;
  errors: Array<{ subscriptionId: string; message: string }>;
}

export async function runBilling(
  asOfDate: Date,
  actorId: string,
): Promise<BillingResult> {
  const result: BillingResult = { created: 0, skipped: 0, failed: 0, errors: [] };

  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      nextBillingDate: { lte: asOfDate },
    },
    include: {
      lines: true,
      plan: true,
    },
    take: 500,
  });

  for (const sub of subscriptions) {
    try {
      const billingDate = sub.nextBillingDate!;
      const interval = sub.plan.billingInterval as BillingInterval;
      const pEnd = periodEnd(billingDate, interval);
      const due = dueDate(billingDate, sub.paymentTerms);

      const subtotal = sub.lines.reduce(
        (sum, line) => add(sum, multiply(line.unitPrice, line.quantity)),
        0,
      );
      const taxTotal = sub.lines.reduce((sum, line) => add(sum, line.taxAmount), 0);
      const total = add(subtotal, taxTotal);

      try {
        await prisma.$transaction(async (tx) => {
          const seq = await tx.sequence.upsert({
            where: { id: "default" },
            create: { id: "default", nextInvoiceNumber: 2, nextSubscriptionNumber: 1000 },
            update: { nextInvoiceNumber: { increment: 1 } },
          });

          await tx.invoice.create({
            data: {
              number: seq.nextInvoiceNumber - 1,
              subscriptionId: sub.id,
              periodStart: billingDate,
              periodEnd: pEnd,
              dueDate: due,
              subtotal,
              taxTotal,
              discountTotal: 0,
              total,
              lines: {
                create: sub.lines.map((line) => ({
                  productId: line.productId,
                  quantity: line.quantity,
                  unitPrice: line.unitPrice,
                  tax: line.taxAmount,
                  discount: line.discountAmount,
                  total: add(multiply(line.unitPrice, line.quantity), line.taxAmount),
                })),
              },
            },
          });

          const nextBilling = addInterval(billingDate, interval);
          const shouldClose =
            sub.plan.autoClose && sub.expiryDate && nextBilling > sub.expiryDate;

          await tx.subscription.update({
            where: { id: sub.id },
            data: {
              nextBillingDate: shouldClose ? null : nextBilling,
              status: shouldClose ? "CLOSED" : undefined,
            },
          });

          await tx.auditLog.create({
            data: {
              entity: "Invoice",
              entityId: sub.id,
              action: "BILLING_RUN",
              details: {
                periodStart: billingDate.toISOString(),
                periodEnd: pEnd.toISOString(),
                total,
              },
              performedBy: actorId,
            },
          });
        });

        result.created++;
      } catch (err: unknown) {
        // Unique constraint violation = already billed this period
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          (err as { code: string }).code === "P2002"
        ) {
          result.skipped++;
        } else {
          throw err;
        }
      }
    } catch (err) {
      result.failed++;
      result.errors.push({
        subscriptionId: sub.id,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  await prisma.billingRun.create({
    data: {
      startDate: asOfDate,
      endDate: new Date(),
      stats: { created: result.created, skipped: result.skipped, failed: result.failed },
      errors: result.errors,
    },
  });

  return result;
}

