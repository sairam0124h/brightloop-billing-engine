import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { paginate } from "@/lib/pagination";
import type { InvoiceStatus } from "@prisma/client";

export async function GET(request: Request) {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const url = new URL(request.url);
    const { skip, take, page, pageSize } = paginate(
      Number(url.searchParams.get("page") || 1),
      Number(url.searchParams.get("pageSize") || 20),
    );
    const status = url.searchParams.get("status") as InvoiceStatus | null;

    const where = status ? { status } : {};

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          subscription: {
            include: {
              customer: { select: { id: true, email: true, name: true } },
            },
          },
          payments: true,
        },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, total, page, pageSize };
  });
}

