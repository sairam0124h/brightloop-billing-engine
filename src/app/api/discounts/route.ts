import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { paginate } from "@/lib/pagination";
import { z } from "zod";

const createDiscountSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50).optional(),
  type: z.enum(["PERCENTAGE", "AMOUNT"]),
  value: z.number().int().min(1),
  appliesTo: z.string().default("ALL"),
});

export async function GET(request: Request) {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const url = new URL(request.url);
    const { skip, take, page, pageSize } = paginate(
      Number(url.searchParams.get("page") || 1),
      Number(url.searchParams.get("pageSize") || 20),
    );

    const [discounts, total] = await Promise.all([
      prisma.discount.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.discount.count(),
    ]);

    return { discounts, total, page, pageSize };
  });
}

export async function POST(request: Request) {
  return withApi(async () => {
    await requireRole("ADMIN");
    const body = await request.json();
    const data = createDiscountSchema.parse(body);

    const discount = await prisma.discount.create({
      data: {
        name: data.name,
        code: data.code || data.name.toUpperCase().replace(/\s+/g, "_"),
        type: data.type,
        value: data.value,
        appliesTo: data.appliesTo,
      },
    });

    return discount;
  });
}

