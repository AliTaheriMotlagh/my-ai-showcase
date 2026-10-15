/** Only same-site relative paths may be used as a post-login destination. Blocks open redirects. */
export function safeNext(value: string | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
