import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { addInterval, periodEnd, dueDate } from "../src/lib/billing-dates";
import { add, multiply } from "../src/lib/money";

async function main() {
  console.log("Seeding database...");

  // 1. Sequence table
  await prisma.sequence.upsert({
    where: { id: "default" },
    create: { id: "default", nextInvoiceNumber: 1, nextSubscriptionNumber: 1000 },
    update: {},
  });

  // 2. Users: 1 Admin, 2 Staff, 15 Customers
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 10);
  const staffPasswordHash = await bcrypt.hash("Staff@12345", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@brightloop.test" },
    update: {},
    create: {
      email: "admin@brightloop.test",
      name: "Admin User",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
      mustResetPassword: false,
    },
  });

  const staff1 = await prisma.user.upsert({
    where: { email: "staff1@brightloop.test" },
    update: {},
    create: {
      email: "staff1@brightloop.test",
      name: "Sarah Staff",
      role: "STAFF",
      passwordHash: staffPasswordHash,
      mustResetPassword: false,
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: "staff2@brightloop.test" },
    update: {},
    create: {
      email: "staff2@brightloop.test",
      name: "Steve Staff",
      role: "STAFF",
      passwordHash: staffPasswordHash,
      mustResetPassword: false,
    },
  });

  const customers = [];
  for (let i = 1; i <= 15; i++) {
    const cust = await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        email: `customer${i}@example.com`,
        name: `Customer ${i}`,
        role: "CUSTOMER",
        passwordHash: customerPasswordHash,
        mustResetPassword: false,
      },
    });
    customers.push(cust);
  }

  // 3. Products with Brand variants (Odoo +560 INR = +56000 minor units)
  const productDefs = [
    { name: "Cloud Hosting Pro", salesPrice: 200000, costPrice: 100000, sku: "PROD-CLOUD" },
    { name: "Billing Engine Core", salesPrice: 500000, costPrice: 250000, sku: "PROD-BILLING" },
    { name: "Analytics Suite", salesPrice: 150000, costPrice: 50000, sku: "PROD-ANALYTICS" },
    { name: "Priority Support", salesPrice: 80000, costPrice: 30000, sku: "PROD-SUPPORT" },
    { name: "Custom Domain & SSL", salesPrice: 50000, costPrice: 15000, sku: "PROD-DOMAIN" },
  ];

  const products = [];
  for (const def of productDefs) {
    let p = await prisma.product.findUnique({ where: { sku: def.sku } });
    if (!p) {
      p = await prisma.product.create({
        data: {
          name: def.name,
          sku: def.sku,
          salesPrice: def.salesPrice,
          costPrice: def.costPrice,
          unitPrice: def.salesPrice,
          type: "SERVICE",
          variants: {
            create: [
              { attribute: "Brand", value: "Standard", extraPrice: 0 },
              { attribute: "Brand", value: "Odoo", extraPrice: 56000 },
            ],
          },
        },
      });
    }
    products.push(p);
  }

  // 4. Plans (6 plans)
  const planDefs = [
    { name: "Starter Daily", price: 10000, billingInterval: "DAILY" },
    { name: "Starter Monthly", price: 99900, billingInterval: "MONTHLY" },
    { name: "Growth Monthly", price: 299900, billingInterval: "MONTHLY" },
    { name: "Enterprise Monthly", price: 999900, billingInterval: "MONTHLY" },
    { name: "Growth Yearly", price: 2999900, billingInterval: "YEARLY" },
    { name: "Enterprise Yearly", price: 9999900, billingInterval: "YEARLY" },
  ];

  const plans = [];
  for (const def of planDefs) {
    let pl = await prisma.plan.findFirst({ where: { name: def.name } });
    if (!pl) {
      pl = await prisma.plan.create({
        data: {
          name: def.name,
          price: def.price,
          billingInterval: def.billingInterval,
          pausable: true,
          closable: true,
          renewable: true,
        },
      });
    }
    plans.push(pl);
  }

  // 5. Taxes (3 taxes)
  const taxDefs = [
    { code: "GST_0", name: "Exempt GST", rate: 0 },
    { code: "GST_18", name: "GST 18%", rate: 18 },
    { code: "GST_28", name: "GST 28%", rate: 28 },
  ];

  for (const t of taxDefs) {
    await prisma.tax.upsert({
      where: { code: t.code },
      update: {},
      create: {
        code: t.code,
        name: t.name,
        rate: t.rate,
        isActive: true,
      },
    });
  }

  // 6. Discounts (3 discounts)
  const discountDefs = [
    { name: "EARLYBIRD10", code: "EARLYBIRD10", type: "PERCENTAGE", value: 10, appliesTo: "ALL" },
    { name: "FLAT500", code: "FLAT500", type: "AMOUNT", value: 50000, appliesTo: "ALL" },
    { name: "SUMMER20", code: "SUMMER20", type: "PERCENTAGE", value: 20, appliesTo: "ALL" },
  ];

  for (const d of discountDefs) {
    await prisma.discount.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
  }

  // 7. Subscriptions (30 total across varied statuses)
  const statuses: Array<"DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED"> = [
    "DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED",
  ];

  const existingSubCount = await prisma.subscription.count();
  const subsNeeded = Math.max(0, 30 - existingSubCount);

  let subSeq = 1000 + existingSubCount;
  const createdSubs = [];

  for (let i = 0; i < subsNeeded; i++) {
    const cust = customers[i % customers.length];
    const plan = plans[i % plans.length];
    const prod = products[i % products.length];
    const status = statuses[i % statuses.length];

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (i * 3));

    const nextBillingDate = status === "ACTIVE"
      ? (i % 2 === 0 ? new Date(today.getTime() - 86400000) : new Date(today.getTime() + 86400000 * 15))
      : null;

    subSeq++;
    const sub = await prisma.subscription.create({
      data: {
        number: subSeq,
        customerId: cust.id,
        planId: plan.id,
        startDate,
        status,
        paymentTerms: 15,
        nextBillingDate,
        lines: {
          create: [
            {
              productId: prod.id,
              quantity: 1,
              unitPrice: prod.salesPrice,
              totalAmount: prod.salesPrice,
              taxAmount: Math.round(prod.salesPrice * 0.18),
            },
          ],
        },
      },
      include: { lines: true },
    });
    createdSubs.push(sub);
  }

  // 8. Invoices & Payments for some subscriptions
  let invSeq = (await prisma.invoice.count()) + 1;
  const activeSubs = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { lines: true },
    take: 10,
  });

  for (const [idx, sub] of activeSubs.entries()) {
    const existingInv = await prisma.invoice.findFirst({
      where: { subscriptionId: sub.id },
    });
    if (existingInv) continue;

    const line = sub.lines[0];
    const subtotal = line ? line.totalAmount : 200000;
    const taxTotal = line ? line.taxAmount : 36000;
    const total = add(subtotal, taxTotal);

    const invStatus: "CONFIRMED" | "PAID" = idx % 2 === 0 ? "CONFIRMED" : "PAID";
    const dueDateVal = new Date();
    dueDateVal.setDate(dueDateVal.getDate() + (idx % 3 === 0 ? -5 : 10)); // Some overdue!

    const inv = await prisma.invoice.create({
      data: {
        number: invSeq++,
        subscriptionId: sub.id,
        status: invStatus,
        periodStart: sub.startDate,
        periodEnd: addInterval(sub.startDate, "MONTHLY", 1),
        dueDate: dueDateVal,
        subtotal,
        taxTotal,
        total,
        lines: {
          create: [
            {
              productId: line?.productId,
              quantity: 1,
              unitPrice: subtotal,
              tax: taxTotal,
              total,
            },
          ],
        },
      },
    });

    if (invStatus === "PAID") {
      await prisma.payment.create({
        data: {
          invoiceId: inv.id,
          method: "UPI",
          amount: total,
          paidAt: new Date(),
          note: "Full settlement via UPI",
          recordedById: admin.id,
          idempotencyKey: `seed_pay_${inv.id}_full`,
        },
      });
    } else if (idx % 2 === 0 && total > 50000) {
      // Partial payment
      const partialAmount = Math.round(total / 2);
      await prisma.payment.create({
        data: {
          invoiceId: inv.id,
          method: "BANK_TRANSFER",
          amount: partialAmount,
          paidAt: new Date(),
          note: "Partial advance payment",
          recordedById: staff1.id,
          idempotencyKey: `seed_pay_${inv.id}_part`,
        },
      });
    }
  }

  // Update sequence tracker
  await prisma.sequence.update({
    where: { id: "default" },
    data: {
      nextInvoiceNumber: invSeq + 1,
      nextSubscriptionNumber: subSeq + 1,
    },
  });

  console.log("\n==========================================");
  console.log("Database seeded successfully!");
  console.log("Demo Credentials:");
  console.log("------------------------------------------");
  console.log("Admin:    admin@brightloop.test    / Admin@12345");
  console.log("Staff:    staff1@brightloop.test   / Staff@12345");
  console.log("Staff:    staff2@brightloop.test   / Staff@12345");
  console.log("Customer: customer1@example.com    / Customer@12345");
  console.log("          ... up to customer15@example.com");
  console.log("==========================================\n");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

