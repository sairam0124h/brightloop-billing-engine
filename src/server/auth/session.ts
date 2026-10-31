import { prisma } from "@/lib/prisma";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { verifyToken, JWTPayload } from "./jwt";

export async function getSession(): Promise<{ user: { id: string; email: string; role: string } } | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true },
  });

  return user ? { user: { id: user.id, email: user.email, role: user.role } } : null;
}

async function getAuthToken(): Promise<string | undefined> {
  const cookies = await import("next/headers");
  const cookieStore = await cookies.cookies();
  return cookieStore.get("auth-token")?.value;
}

export async function requireUser(): Promise<{ id: string; email: string; role: string }> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session.user;
}

export async function requireRole(...roles: string[]): Promise<void> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError("Insufficient permissions");
  }
}