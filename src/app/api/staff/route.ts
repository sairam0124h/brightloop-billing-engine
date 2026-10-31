import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/server/auth/password";
import { emailSchema, passwordSchema } from "@/lib/schemas/auth";
import { withApi, ConflictError } from "@/lib/errors";
import { requireRole } from "@/server/auth/session";
import { z } from "zod";
import crypto from "crypto";

const createStaffSchema = z.object({
  email: emailSchema,
  name: z.string().trim().optional(),
  password: passwordSchema.optional(),
});

function generateTemporaryPassword(): string {
  // Generate random strong password meeting all 4 rules (>8 chars, uppercase, lowercase, special)
  const rand = crypto.randomBytes(4).toString("hex");
  return `Temp#${rand.toUpperCase()}a1!`;
}

export async function POST(request: NextRequest) {
  return withApi(async () => {
    // Admin only - non-admin gets 403
    await requireRole("ADMIN");

    const body = await request.json();
    const { email, name, password } = createStaffSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const tempPassword = password || generateTemporaryPassword();
    // Validate temporary password meets schema
    passwordSchema.parse(tempPassword);

    const passwordHash = await hashPassword(tempPassword);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || undefined,
        passwordHash,
        role: "STAFF",
        mustResetPassword: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mustResetPassword: true,
        createdAt: true,
      },
    });

    return { user, temporaryPassword: tempPassword };
  });
}

export async function GET() {
  return withApi(async () => {
    await requireRole("ADMIN");

    const staff = await prisma.user.findMany({
      where: { role: "STAFF" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mustResetPassword: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { staff };
  });
}
