/** An error whose message is safe to show to the user. Anything else is logged and replaced with a generic message. */
export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string; needsAuth?: boolean };
