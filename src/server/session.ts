import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

/** The signed-in user as far as the UI needs to know. Never includes the email address. */
export interface Viewer {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
}

export async function viewerFromHeaders(requestHeaders: Headers): Promise<Viewer | null> {
  const result = await auth.api.getSession({ headers: requestHeaders });
  if (!result) return null;
  const { user } = result;
  return { id: user.id, name: user.name, username: user.username, avatar: user.image ?? null };
}

/** Cached per request, so layouts, metadata and pages share one session lookup. */
export const getViewer = cache(async (): Promise<Viewer | null> => viewerFromHeaders(await headers()));

/** For pages that need an account. Sends visitors to /login and back again afterwards. */
export async function requireViewer(next: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  return viewer;
}
