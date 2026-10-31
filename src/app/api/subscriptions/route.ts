import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { paginate } from "@/lib/pagination";
import { createSubscriptionSchema } from "@/lib/schemas/subscription";
import { multiply, add } from "@/lib/money";
import type { SubscriptionStatus } from "@prisma/client";

export async function GET(request: Request) {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const url = new URL(request.url);
    const { skip, take, page, pageSize } = paginate(
      Number(url.searchParams.get("page") || 1),
      Number(url.searchParams.get("pageSize") || 20),
    );
    const status = url.searchParams.get("status") as SubscriptionStatus | null;

    const where = status ? { status } : {};

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          customer: { select: { id: true, email: true, name: true } },
          plan: { select: { id: true, name: true, billingInterval: true } },
          lines: true,
        },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.subscription.count({ where }),
    ]);

    return { subscriptions, total, page, pageSize };
  });
}

export async function POST(request: Request) {
  return withApi(async () => {
    const user = await requireRole("ADMIN", "STAFF");
    const body = await request.json();
    const data = createSubscriptionSchema.parse(body);

    const subscription = await prisma.$transaction(async (tx) => {
      const seq = await tx.sequence.upsert({
        where: { id: "default" },
        create: { id: "default", nextSubscriptionNumber: 1001, nextInvoiceNumber: 1 },
        update: { nextSubscriptionNumber: { increment: 1 } },
      });

      const lines = data.lines.map((line) => ({
        productId: line.productId,
        productVariantId: line.productVariantId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        totalAmount: multiply(line.unitPrice, line.quantity),
      }));

      const sub = await tx.subscription.create({
        data: {
          number: seq.nextSubscriptionNumber - 1,
          customerId: data.customerId,
          planId: data.planId,
          startDate: new Date(data.startDate),
          paymentTerms: data.paymentTerms ?? 15,
          status: "DRAFT",
          lines: { create: lines },
        },
        include: { lines: true, customer: { select: { email: true, name: true } } },
      });

      await tx.auditLog.create({
        data: {
          entity: "Subscription",
          entityId: sub.id,
          action: "CREATED",
          details: { number: sub.number },
          performedBy: user.id,
        },
      });

      return sub;
    });

    return subscription;
  });
}

