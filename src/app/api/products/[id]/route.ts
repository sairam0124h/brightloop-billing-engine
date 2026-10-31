import { prisma } from "@/lib/prisma";
import { withApi, NotFoundError } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { updateProductSchema } from "@/lib/schemas/product";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!product) throw new NotFoundError("Product not found");
    return product;
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = await request.json();
    const data = updateProductSchema.parse(body);

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        unitPrice: data.salesPrice,
      },
      include: { variants: true },
    });
    return product;
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    await requireRole("ADMIN");
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return { deleted: true };
  });
}

