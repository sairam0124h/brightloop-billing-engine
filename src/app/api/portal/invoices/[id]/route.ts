import { prisma } from "@/lib/prisma";
import { withApi, NotFoundError } from "@/lib/errors";
import { requireUser } from "@/server/auth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    const user = await requireUser();
    const { id } = await params;

    const i = await prisma.invoice.findFirst({
      where: {
        id,
        subscription: { customerId: user.id },
      },
      include: {
        lines: true,
        payments: true,
      },
    });

    if (!i) throw new NotFoundError("Invoice not found");

    const lastPayment = i.payments[0];
    const invoice = {
      id: i.id,
      subscriptionId: i.subscriptionId,
      periodStart: i.periodStart.toISOString(),
      periodEnd: i.periodEnd.toISOString(),
      amount: i.total,
      status: i.status,
      dueDate: i.dueDate.toISOString(),
      paidAt: lastPayment ? lastPayment.paidAt.toISOString() : undefined,
      lines: i.lines,
    };

    return { invoice };
  });
}

