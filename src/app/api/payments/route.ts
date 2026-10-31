import { prisma } from "@/lib/prisma";
import { withApi, NotFoundError, ValidationError } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { paginate } from "@/lib/pagination";
import { recordPaymentSchema } from "@/lib/schemas/subscription";
import { add } from "@/lib/money";

export async function GET(request: Request) {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const url = new URL(request.url);
    const { skip, take, page, pageSize } = paginate(
      Number(url.searchParams.get("page") || 1),
      Number(url.searchParams.get("pageSize") || 20),
    );

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        include: {
          invoice: {
            include: {
              subscription: {
                include: {
                  customer: { select: { id: true, email: true, name: true } },
                },
              },
            },
          },
          recordedBy: { select: { id: true, email: true, name: true } },
        },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count(),
    ]);

    return { payments, total, page, pageSize };
  });
}

export async function POST(request: Request) {
  return withApi(async () => {
    const user = await requireRole("ADMIN", "STAFF");
    const body = await request.json();
    const data = recordPaymentSchema.parse(body);

    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { payments: true },
    });
    if (!invoice) throw new NotFoundError("Invoice not found");
    if (invoice.status === "CANCELLED") {
      throw new ValidationError("Cannot pay a cancelled invoice");
    }
    if (invoice.status === "PAID") {
      throw new ValidationError("Invoice is already paid");
    }

    const paidSoFar = invoice.payments.reduce((sum, p) => add(sum, p.amount), 0);
    if (add(paidSoFar, data.amount) > invoice.total) {
      throw new ValidationError("Payment would exceed invoice total");
    }

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          method: data.method,
          amount: data.amount,
          paidAt: new Date(data.paidAt),
          note: data.note,
          recordedById: user.id,
          idempotencyKey: data.idempotencyKey,
        },
      });

      const newTotal = add(paidSoFar, data.amount);
      if (newTotal >= invoice.total) {
        await tx.invoice.update({
          where: { id: data.invoiceId },
          data: { status: "PAID" },
        });

        await tx.auditLog.create({
          data: {
            entity: "Invoice",
            entityId: data.invoiceId,
            action: "STATUS_CHANGE",
            details: { from: invoice.status, to: "PAID", paymentId: p.id },
            performedBy: user.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          entity: "Payment",
          entityId: p.id,
          action: "RECORDED",
          details: { amount: data.amount, method: data.method },
          performedBy: user.id,
        },
      });

      return p;
    });

    return payment;
  });
}

