import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";

export async function GET() {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");

    const now = new Date();

    const [
      activeSubscriptions,
      mrrResult,
      revenueCollected,
      overdueResult,
    ] = await Promise.all([
      prisma.subscription.count({ where: { status: "ACTIVE" } }),

      // MRR: sum of line totals for active monthly subs
      prisma.$queryRaw<[{ total: bigint | null }]>`
        SELECT COALESCE(SUM(sl."totalAmount"), 0) as total
        FROM "SubscriptionLine" sl
        JOIN "Subscription" s ON s.id = sl."subscriptionId"
        WHERE s.status = 'ACTIVE'
      `,

      // Total payments collected
      prisma.$queryRaw<[{ total: bigint | null }]>`
        SELECT COALESCE(SUM(amount), 0) as total FROM "Payment"
      `,

      // Overdue invoice total (CONFIRMED + past due)
      prisma.$queryRaw<[{ total: bigint | null; count: bigint }]>`
        SELECT COALESCE(SUM(total), 0) as total, COUNT(*)::bigint as count
        FROM "Invoice"
        WHERE status = 'CONFIRMED' AND "dueDate" < ${now}
      `,
    ]);

    return {
      activeSubscriptions,
      mrr: Number(mrrResult[0]?.total ?? 0),
      revenueCollected: Number(revenueCollected[0]?.total ?? 0),
      overdueAmount: Number(overdueResult[0]?.total ?? 0),
      overdueCount: Number(overdueResult[0]?.count ?? 0),
    };
  });
}

