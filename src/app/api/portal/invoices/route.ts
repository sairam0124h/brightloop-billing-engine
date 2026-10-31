import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/errors";
import { requireUser } from "@/server/auth/session";

export async function GET() {
  return withApi(async () => {
    const user = await requireUser();

    const invs = await prisma.invoice.findMany({
      where: {
        subscription: {
          customerId: user.id,
        },
      },
      include: {
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const invoices = invs.map((i) => {
      const lastPayment = i.payments[0];
      return {
        id: i.id,
        subscriptionId: i.subscriptionId,
        periodStart: i.periodStart.toISOString(),
        periodEnd: i.periodEnd.toISOString(),
        amount: i.total,
        status: i.status,
        dueDate: i.dueDate.toISOString(),
        paidAt: lastPayment ? lastPayment.paidAt.toISOString() : undefined,
      };
    });

    return { invoices };
  });
}

