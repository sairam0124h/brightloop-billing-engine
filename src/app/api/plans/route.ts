import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { paginate } from "@/lib/pagination";
import { createPlanSchema } from "@/lib/schemas/plan";

export async function GET(request: Request) {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const url = new URL(request.url);
    const { skip, take, page, pageSize } = paginate(
      Number(url.searchParams.get("page") || 1),
      Number(url.searchParams.get("pageSize") || 20),
    );

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
      prisma.plan.count(),
    ]);

    return { plans, total, page, pageSize };
  });
}

export async function POST(request: Request) {
  return withApi(async () => {
    await requireRole("ADMIN");
    const body = await request.json();
    const data = createPlanSchema.parse(body);
    const plan = await prisma.plan.create({ data });
    return plan;
  });
}

