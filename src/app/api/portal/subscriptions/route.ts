import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/errors";
import { requireUser } from "@/server/auth/session";

export async function GET() {
  return withApi(async () => {
    const user = await requireUser();

    const subs = await prisma.subscription.findMany({
      where: { customerId: user.id },
      include: {
        plan: true,
        lines: { include: { subscription: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const subscriptions = subs.map((s) => {
      const lineTotal = s.lines.reduce((acc, l) => acc + l.totalAmount, 0);
      return {
        id: s.id,
        productName: s.lines.length > 0 ? "Subscription Items" : s.plan.name,
        planName: s.plan.name,
        interval: s.plan.billingInterval,
        status: s.status,
        periodStart: s.startDate.toISOString(),
        periodEnd: (s.expiryDate || s.startDate).toISOString(),
        dueDate: s.nextBillingDate?.toISOString(),
        amount: lineTotal,
      };
    });

    return { subscriptions };
  });
}

