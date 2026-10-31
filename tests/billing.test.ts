import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import { runBilling } from "../src/server/services/billing";

describe("Billing engine service", () => {
  let customerId: string;
  let planId: string;
  let productId: string;

  beforeAll(async () => {
    // Ensure admin / customer / plan / product exists
    const customer = await prisma.user.upsert({
      where: { email: "billing_test_cust@brightloop.test" },
      update: {},
      create: {
        email: "billing_test_cust@brightloop.test",
        passwordHash: "hash123",
        role: "CUSTOMER",
      },
    });
    customerId = customer.id;

    const plan = await prisma.plan.create({
      data: {
        name: "Test Billing Plan " + Date.now(),
        price: 100000,
        billingInterval: "MONTHLY",
      },
    });
    planId = plan.id;

    const product = await prisma.product.create({
      data: {
        name: "Test Billing Product " + Date.now(),
        salesPrice: 100000,
        costPrice: 50000,
        type: "SERVICE",
      },
    });
    productId = product.id;
  }, 20000);

  it("creates invoice on runBilling and skips duplicates without error", async () => {
    const today = new Date();
    const subNumber = 888000 + Math.floor(Math.random() * 10000);

    const sub = await prisma.subscription.create({
      data: {
        number: subNumber,
        customerId,
        planId,
        startDate: today,
        status: "ACTIVE",
        paymentTerms: 15,
        nextBillingDate: today,
        lines: {
          create: [
            {
              productId,
              quantity: 1,
              unitPrice: 100000,
              totalAmount: 100000,
              taxAmount: 18000,
            },
          ],
        },
      },
    });

    // 1st run: should generate invoice
    const result1 = await runBilling(new Date(today.getTime() + 1000), customerId);
    expect(result1.failed).toBe(0);
    expect(result1.created).toBeGreaterThanOrEqual(1);

    // Verify invoice created
    const invoice = await prisma.invoice.findFirst({
      where: { subscriptionId: sub.id },
      include: { lines: true },
    });
    expect(invoice).not.toBeNull();
    expect(invoice?.total).toBe(118000);
    expect(invoice?.lines).toHaveLength(1);

    // If sub's nextBillingDate is artificially reset back to same periodStart to simulate duplicate run
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { nextBillingDate: today },
    });

    // 2nd run for same period: unique(subscriptionId, periodStart) catches duplicate and counts as skipped
    const result2 = await runBilling(new Date(today.getTime() + 1000), customerId);
    expect(result2.failed).toBe(0);
    expect(result2.skipped).toBeGreaterThanOrEqual(1);
  }, 30000);
});

