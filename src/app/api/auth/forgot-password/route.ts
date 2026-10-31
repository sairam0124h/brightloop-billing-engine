import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/schemas/auth";
import { withApi } from "@/lib/errors";
import { createPasswordResetToken } from "@/server/auth/password-reset";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  return withApi(async () => {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: true };
    }

    const token = await createPasswordResetToken(user.id);
    const resetLink = `${APP_URL}/reset-password?token=${token}`;

    if (resend) {
      await resend.emails.send({
        from: "noreply@brightloop.test",
        to: user.email,
        subject: "Reset your password",
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 30 minutes.</p>`,
      });
    } else {
      console.log(`[DEV] Password reset link for ${user.email}: ${resetLink}`);
    }

    return { success: true };
  });
}