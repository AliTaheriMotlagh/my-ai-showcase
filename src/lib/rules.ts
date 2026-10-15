// Validation rules shared by forms (client) and actions/auth hooks (server).
// Keep limits here so the UI and the server can never disagree.

export const LIMITS = {
  name: 60,
  username: { min: 3, max: 30 },
  headline: 120,
  bio: 500,
  location: 80,
  website: 2048,
  tools: { max: 12, item: 40 },
  postTitle: 120,
  caption: 2000,
  prompt: 4000,
  model: 80,
  tags: { max: 8, item: 30 },
  comment: 1000,
  linkTitle: 80,
  linkUrl: 2048,
  links: 25,
  textBody: 20000,
  codeSource: 20000,
  chatMessages: { max: 60, text: 4000 },
  chartRows: { max: 24, label: 40 },
  galleryImages: 10,
  reportDetails: 500,
} as const;

/** Usernames appear at /u/[username]; these would shadow real routes or impersonate the product. */
const RESERVED = new Set([
  "about", "admin", "api", "create", "explore", "flow", "go", "help", "latent", "login", "logout", "me",
  "notifications", "p", "robots", "root", "search", "settings", "signup", "sitemap", "support", "tags",
  "u", "www",
]);

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9_.]{1,28}[a-z0-9])$/;

/** Returns an error message, or null when the username is valid. Input is lowercased first. */
export function usernameError(input: string): string | null {
  const v = input.trim().toLowerCase();
  if (v.length < LIMITS.username.min || v.length > LIMITS.username.max) {
    return `Usernames are ${LIMITS.username.min}–${LIMITS.username.max} characters.`;
  }
  if (!USERNAME_RE.test(v)) return "Use letters, numbers, dots and underscores. Start and end with a letter or number.";
  if (/[._]{2}/.test(v)) return "Dots and underscores can't be next to each other.";
  if (RESERVED.has(v)) return "That username is reserved.";
  return null;
}

/**
 * Accepts "example.com", "www.example.com/path" or a full URL and returns a normalized
 * https URL. Only http(s) is allowed, so javascript: and data: links are rejected.
 */
export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
  if (url.href.length > LIMITS.linkUrl) return null;
  return url.href;
}

/** Hostname for display, e.g. "example.com". */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function normalizeTags(input: string[] | string): string[] {
  const parts = Array.isArray(input) ? input : input.split(/[,\s#]+/);
  const out = parts
    .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, LIMITS.tags.item))
    .filter(Boolean);
  return [...new Set(out)].slice(0, LIMITS.tags.max);
}

/** De-duplicates case-insensitively, keeping the first spelling the person typed. */
export function normalizeTools(input: string[] | string): string[] {
  const parts = Array.isArray(input) ? input : input.split(",");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of parts) {
    const tool = raw.trim().slice(0, LIMITS.tools.item);
    const key = tool.toLowerCase();
    if (!tool || seen.has(key)) continue;
    seen.add(key);
    out.push(tool);
  }
  return out.slice(0, LIMITS.tools.max);
}
