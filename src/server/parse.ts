import "server-only";
import type { z } from "zod";
import { ServiceError } from "./errors";

/** Validates input and turns the first problem into a message that is safe to show. */
export function parseOrThrow<S extends z.ZodType>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) throw new ServiceError(result.error.issues[0]?.message ?? "Check the form and try again.");
  return result.data;
}
