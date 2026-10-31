import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/server/auth/password";
import { signupSchema } from "@/lib/schemas/auth";
import { withApi, ForbiddenError } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";

export async function POST(request: NextRequest) {
  return withApi(async () => {
    await requireRole("ADMIN");

    const body = await request.json();
    const { email, password, name } = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error("An account with this email already exists");
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, name, role: "STAFF", mustResetPassword: true },
      select: { id: true, email: true, role: true, mustResetPassword: true },
    });

    return { user, temporaryPassword: password };
  });
}

export async function GET() {
  return withApi(async () => {
    await requireRole("ADMIN");

    const staff = await prisma.user.findMany({
      where: { role: "STAFF" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return { staff };
  });
}