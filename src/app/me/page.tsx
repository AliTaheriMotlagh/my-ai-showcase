import { redirect } from "next/navigation";
import { getViewer } from "@/server/session";

/** /me is an alias for your own profile, which holds your posts, saved and liked items. */
export default async function MePage() {
  const viewer = await getViewer();
  redirect(viewer ? `/u/${viewer.username}` : "/login?next=/me");
}
