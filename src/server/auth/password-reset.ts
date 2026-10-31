import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "crypto";

const TOKEN_EXPIRY_MS = 30 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return token;
}

export async function validatePasswordResetToken(token: string): Promise<{ userId: string } | null> {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findFirst({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;

  return { userId: record.userId };
}

export async function consumePasswordResetToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await prisma.passwordResetToken.updateMany({
    where: { tokenHash },
    data: { usedAt: new Date() },
  });
}
