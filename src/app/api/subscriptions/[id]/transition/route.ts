import { prisma } from "@/lib/prisma";
import { withApi, NotFoundError } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { assertTransition } from "@/lib/state-machines";
import { transitionSchema } from "@/lib/schemas/subscription";
import type { SubscriptionStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    const user = await requireRole("ADMIN", "STAFF");
    const { id } = await params;
    const body = await request.json();
    const { to } = transitionSchema.parse(body);

    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundError("Subscription not found");

    assertTransition("subscription", sub.status, to);

    const updateData: Record<string, unknown> = { status: to as SubscriptionStatus };

    // When transitioning to ACTIVE, set nextBillingDate
    if (to === "ACTIVE" && !sub.nextBillingDate) {
      updateData.nextBillingDate = sub.startDate;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.subscription.update({
        where: { id },
        data: updateData,
      });

      await tx.auditLog.create({
        data: {
          entity: "Subscription",
          entityId: id,
          action: "STATUS_CHANGE",
          details: { from: sub.status, to },
          performedBy: user.id,
        },
      });

      return result;
    });

    return updated;
  });
}

