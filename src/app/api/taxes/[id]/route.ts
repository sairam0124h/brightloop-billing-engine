import { prisma } from "@/lib/prisma";
import { withApi, NotFoundError } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { updateTaxSchema } from "@/lib/schemas/tax";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = await request.json();
    const data = updateTaxSchema.parse(body);
    const existing = await prisma.tax.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Tax not found");
    const tax = await prisma.tax.update({ where: { id }, data });
    return tax;
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    await requireRole("ADMIN");
    const { id } = await params;
    await prisma.tax.delete({ where: { id } });
    return { deleted: true };
  });
}

