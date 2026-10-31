import { describe, it, expect, beforeEach } from "vitest";
import { passwordSchema, emailSchema, signupSchema } from "@/lib/schemas/auth";
import {
  createPasswordResetToken,
  validatePasswordResetToken,
  consumePasswordResetToken,
} from "@/server/auth/password-reset";
import { prisma } from "@/lib/prisma";

describe("Password Complexity Schema", () => {
  it("8-char password fails", () => {
    // 8 characters with upper, lower, special
    const result = passwordSchema.safeParse("Abcd123!");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 9 characters");
    }
  });

  it("9 chars without special fails", () => {
    // 9 characters, has upper and lower, but no special
    const result = passwordSchema.safeParse("Abcdef123");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("special character"))).toBe(true);
    }
  });

  it("missing uppercase fails", () => {
    // 9 chars, lowercase, numbers, special, but no uppercase
    const result = passwordSchema.safeParse("abcdef123!");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("uppercase"))).toBe(true);
    }
  });

  it("missing lowercase fails", () => {
    // 9 chars, uppercase, numbers, special, but no lowercase
    const result = passwordSchema.safeParse("ABCDEF123!");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("lowercase"))).toBe(true);
    }
  });

  it("valid passes", () => {
    // 9+ chars, uppercase, lowercase, special, number
    const result = passwordSchema.safeParse("ValidPass123!");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("ValidPass123!");
    }
  });
});

describe("Email Normalization & Duplicate Prevention", () => {
  it("normalizes and trims email", () => {
    const parsed = emailSchema.parse("  Test.User+Sub@BrightLoop.TEST  ");
    expect(parsed).toBe("test.user+sub@brightloop.test");
  });

  it(
    "duplicate email in different casing rejected",
    async () => {
    const rawEmail = `test.case.${Date.now()}@brightloop.test`;
    const lowerEmail = rawEmail.toLowerCase();
    const upperEmail = rawEmail.toUpperCase();

    // Clean up if existing
    await prisma.user.deleteMany({
      where: { email: { equals: lowerEmail, mode: "insensitive" } },
    });

    // Create user with lower-case email
    const firstSignup = signupSchema.parse({
      email: lowerEmail,
      password: "Password123!",
    });

    const user = await prisma.user.create({
      data: {
        email: firstSignup.email,
        passwordHash: "dummyhash",
        role: "CUSTOMER",
      },
    });

    expect(user.email).toBe(lowerEmail);

    // Second signup with uppercase casing
    const secondSignup = signupSchema.parse({
      email: upperEmail,
      password: "Password123!",
    });

    // Check query using insensitive mode and schema lowercase
    const existing = await prisma.user.findFirst({
      where: { email: { equals: secondSignup.email, mode: "insensitive" } },
    });

    expect(existing).not.toBeNull();
    expect(existing?.id).toBe(user.id);

    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
  }, 20000);
});

describe("Password Reset Token Lifecycle", () => {
  it(
    "expired and reused reset tokens rejected",
    async () => {
    // Create temporary test user
    const testEmail = `token.test.${Date.now()}@brightloop.test`;
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: "hash123",
        role: "CUSTOMER",
      },
    });

    try {
      // 1. Valid token creation and validation
      const validToken = await createPasswordResetToken(user.id);
      const validation1 = await validatePasswordResetToken(validToken);
      expect(validation1).not.toBeNull();
      expect(validation1?.userId).toBe(user.id);

      // 2. Consume token (single use)
      await consumePasswordResetToken(validToken);

      // Reused token must be rejected
      const validation2 = await validatePasswordResetToken(validToken);
      expect(validation2).toBeNull();

      // 3. Expired token rejection
      const expiredToken = await createPasswordResetToken(user.id);
      // Manually set expiration to past
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { expiresAt: new Date(Date.now() - 1000 * 60) }, // 1 minute in the past
      });

      const validationExpired = await validatePasswordResetToken(expiredToken);
      expect(validationExpired).toBeNull();
    } finally {
      await prisma.user.delete({ where: { id: user.id } });
    }
  }, 20000);
});
