import { prisma } from "@/lib/prisma";
import { withApi, NotFoundError } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { assertTransition } from "@/lib/state-machines";
import type { InvoiceStatus } from "@prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        lines: true,
        payments: true,
        subscription: {
          include: {
            customer: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });
    if (!invoice) throw new NotFoundError("Invoice not found");
    return invoice;
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    const user = await requireRole("ADMIN", "STAFF");
    const { id } = await params;
    const body = await request.json();
    const { to } = body as { to: string };

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundError("Invoice not found");

    assertTransition("invoice", invoice.status, to);

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.invoice.update({
        where: { id },
        data: { status: to as InvoiceStatus },
      });

      await tx.auditLog.create({
        data: {
          entity: "Invoice",
          entityId: id,
          action: "STATUS_CHANGE",
          details: { from: invoice.status, to },
          performedBy: user.id,
        },
      });

      return result;
    });

    return updated;
  });
}

