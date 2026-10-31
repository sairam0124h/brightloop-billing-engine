import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { paginate } from "@/lib/pagination";
import { createTaxSchema } from "@/lib/schemas/tax";

export async function GET(request: Request) {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const url = new URL(request.url);
    const { skip, take, page, pageSize } = paginate(
      Number(url.searchParams.get("page") || 1),
      Number(url.searchParams.get("pageSize") || 20),
    );

    const [taxes, total] = await Promise.all([
      prisma.tax.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
      prisma.tax.count(),
    ]);

    return { taxes, total, page, pageSize };
  });
}

export async function POST(request: Request) {
  return withApi(async () => {
    await requireRole("ADMIN");
    const body = await request.json();
    const data = createTaxSchema.parse(body);
    const tax = await prisma.tax.create({
      data: {
        code: data.code,
        name: data.name,
        rate: data.rate,
        isActive: data.isActive ?? true,
      },
    });
    return tax;
  });
}

