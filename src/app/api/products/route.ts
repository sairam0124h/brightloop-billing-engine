import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { paginate } from "@/lib/pagination";
import { createProductSchema } from "@/lib/schemas/product";

export async function GET(request: Request) {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const url = new URL(request.url);
    const { skip, take, page, pageSize } = paginate(
      Number(url.searchParams.get("page") || 1),
      Number(url.searchParams.get("pageSize") || 20),
    );
    const search = url.searchParams.get("search") || "";

    const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variants: true },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, pageSize };
  });
}

export async function POST(request: Request) {
  return withApi(async () => {
    await requireRole("ADMIN");
    const body = await request.json();
    const data = createProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        type: data.type ?? "SERVICE",
        salesPrice: data.salesPrice ?? 0,
        costPrice: data.costPrice ?? 0,
        unitPrice: data.salesPrice ?? 0,
        notes: data.notes,
        description: data.description,
      },
      include: { variants: true },
    });

    return product;
  });
}

