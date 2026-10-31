import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";

export async function GET() {
  return withApi(async () => {
    await requireRole("ADMIN", "STAFF");
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: { id: true, email: true, name: true },
      orderBy: { email: "asc" },
      take: 100,
    });
    return { customers };
  });
}

