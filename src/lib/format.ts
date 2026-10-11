const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** 1234 -> "1.2K". Locale-independent so server and client output match. */
export function compact(n: number): string {
  if (n < 1000) return String(n);
  const [v, suffix] = n < 1_000_000 ? [n / 1000, "K"] : [n / 1_000_000, "M"];
  return `${v < 10 ? v.toFixed(1).replace(/\.0$/, "") : Math.round(v)}${suffix}`;
}

export function shortDate(iso: string, now = Date.now()): string {
  const d = new Date(iso);
  const sameYear = d.getUTCFullYear() === new Date(now).getUTCFullYear();
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}${sameYear ? "" : `, ${d.getUTCFullYear()}`}`;
}

export function fullDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function monthYear(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.floor((now - Date.parse(iso)) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  if (d < 35) return `${Math.floor(d / 7)}w`;
  return shortDate(iso, now);
}

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}
