import "server-only";

// No look-alike characters (0/o, 1/l/i), so ids are easy to read aloud and type.
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

/** Short random id. 32 symbols, so byte % 32 has no modulo bias. */
export function newId(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}
