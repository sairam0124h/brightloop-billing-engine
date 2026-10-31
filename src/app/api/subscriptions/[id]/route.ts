import { prisma } from "@/lib/prisma";
import { withApi, NotFoundError } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const { id } = await params;
    const sub = await prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, email: true, name: true } },
        plan: true,
        lines: true,
        invoices: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!sub) throw new NotFoundError("Subscription not found");
    return sub;
  });
}

