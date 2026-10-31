import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/server/auth/password";
import { resetPasswordSchema } from "@/lib/schemas/auth";
import { withApi, UnauthorizedError } from "@/lib/errors";
import { validatePasswordResetToken, consumePasswordResetToken } from "@/server/auth/password-reset";

export async function POST(request: NextRequest) {
  return withApi(async () => {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const validation = await validatePasswordResetToken(token);
    if (!validation) {
      throw new UnauthorizedError("Invalid or expired reset token");
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: validation.userId },
      data: { passwordHash, mustResetPassword: false },
    });

    await consumePasswordResetToken(token);

    return { success: true };
  });
}