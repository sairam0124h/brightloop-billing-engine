import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/server/auth/password";
import { signupSchema } from "@/lib/schemas/auth";
import { withApi, ConflictError } from "@/lib/errors";
import { setAuthCookie, createToken } from "@/server/auth/jwt";

export async function POST(request: NextRequest) {
  return withApi(async () => {
    const body = await request.json();
    const { email, password, name } = signupSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, name, role: "CUSTOMER" },
      select: { id: true, email: true, role: true },
    });

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return { user };
  });
}
