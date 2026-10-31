import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { createVariantSchema } from "@/lib/schemas/product";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = await request.json();
    const data = createVariantSchema.parse(body);

    const variant = await prisma.productVariant.create({
      data: { productId: id, ...data },
    });
    return variant;
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    await requireRole("ADMIN");
    const url = new URL(request.url);
    const variantId = url.searchParams.get("variantId");
    if (!variantId) throw new Error("variantId is required");

    await prisma.productVariant.delete({ where: { id: variantId } });
    return { deleted: true };
  });
}

