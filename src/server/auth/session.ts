import { prisma } from "@/lib/prisma";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { verifyToken, getAuthToken } from "./jwt";

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
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

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session.user;
}

export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError("Insufficient permissions");
  }
  return user;
}
