import { prisma } from "@/lib/prisma";
import { withApi, NotFoundError } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { updatePlanSchema } from "@/lib/schemas/plan";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const { id } = await params;
    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundError("Plan not found");
    return plan;
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
    const data = updatePlanSchema.parse(body);
    const plan = await prisma.plan.update({ where: { id }, data });
    return plan;
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApi(async () => {
    await requireRole("ADMIN");
    const { id } = await params;
    await prisma.plan.delete({ where: { id } });
    return { deleted: true };
  });
}

