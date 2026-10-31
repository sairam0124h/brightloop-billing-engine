import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string>) {
    super(message, "VALIDATION_ERROR", 422, fields);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Not found") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, "CONFLICT", 409);
  }
}

function handleApiError(err: unknown): Response {
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".");
      fields[path] = issue.message;
    }
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: "Validation failed", fields } },
      { status: 422 },
    );
  }
  if (err instanceof AppError) {
    return Response.json(
      { error: { code: err.code, message: err.message, fields: err.fields } },
      { status: err.status },
    );
  }
  console.error(err);
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
    { status: 500 },
  );
}

export function withApi(fn: () => never): Response;
export function withApi<T extends Promise<unknown>>(fn: () => T): Promise<Response>;
export function withApi<T>(fn: () => T): Response;
export function withApi<T>(fn: () => T | Promise<T>): Response | Promise<Response> {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then((data) => Response.json({ data }))
        .catch((err) => handleApiError(err));
    }
    return Response.json({ data: result });
  } catch (err) {
    return handleApiError(err);
  }
}
