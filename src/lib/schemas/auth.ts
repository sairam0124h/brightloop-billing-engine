import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(9, "Password must be at least 9 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const emailSchema = z.string().trim().toLowerCase().pipe(z.string().email("Invalid email address"));

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordSchema,
});
