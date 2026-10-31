import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  withApi,
} from "@/lib/errors";

describe("errors", () => {
  it("creates ValidationError", () => {
    const err = new ValidationError("bad", { email: "required" });
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.status).toBe(422);
    expect(err.fields).toEqual({ email: "required" });
  });

  it("creates UnauthorizedError", () => {
    expect(new UnauthorizedError().status).toBe(401);
  });

  it("creates ForbiddenError", () => {
    expect(new ForbiddenError().status).toBe(403);
  });

  it("creates NotFoundError", () => {
    expect(new NotFoundError().status).toBe(404);
  });

  it("creates ConflictError", () => {
    expect(new ConflictError().status).toBe(409);
  });

  it("withApi returns success envelope", async () => {
    const res = withApi(() => ({ hello: "world" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual({ hello: "world" });
  });

  it("withApi handles Zod validation errors", async () => {
    const schema = z.object({ email: z.string().email() });
    const res = withApi(() => schema.parse({ email: "bad" }));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("withApi handles AppError", async () => {
    const res = withApi(() => {
      throw new NotFoundError("missing");
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });
});