import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/server/auth/password";
import { loginSchema } from "@/lib/schemas/auth";
import { withApi, UnauthorizedError } from "@/lib/errors";
import { setAuthCookie } from "@/server/auth/jwt";
import { createToken } from "@/server/auth/jwt";
import { checkRateLimit, clearRateLimit } from "@/server/auth/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return Response.json(
      { error: { code: "RATE_LIMITED", message: "Too many login attempts. Try again later." } },
      { status: 429 },
    );
  }

  return withApi(async () => {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, role: true },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedError("Invalid email or password");
    }

    clearRateLimit(ip);

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return { user: { id: user.id, email: user.email, role: user.role } };
  });
}