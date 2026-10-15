import Link from "next/link";
import { Avatar } from "@/components/art/Avatar";
import { site } from "@/lib/site";
import type { Viewer } from "@/server/session";

/** Your account in the right rail. Signed-out visitors get a log-in prompt instead. */
export function MeMini({ viewer }: { viewer: Viewer | null }) {
  if (!viewer) {
    return (
      <div className="rounded-2xl border border-line p-4">
        <p className="font-semibold">New to {site.name}?</p>
        <p className="mt-1 text-sm text-muted">Create a profile to share your work and build a link page.</p>
        <div className="mt-3 flex gap-2">
          <Link href="/signup" className="rounded-full bg-fg px-4 py-2 text-sm font-semibold text-bg">
            Sign up
          </Link>
          <Link href="/login" className="rounded-full bg-elevated px-4 py-2 text-sm font-semibold hover:bg-line">
            Log in
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Link href={`/u/${viewer.username}`} className="shrink-0">
        <Avatar user={{ name: viewer.name, username: viewer.username, avatar: viewer.avatar }} size={44} />
      </Link>
      <div className="min-w-0 flex-1 leading-tight">
        <Link href={`/u/${viewer.username}`} className="block truncate text-sm font-semibold hover:underline">
          {viewer.username}
        </Link>
        <p className="truncate text-sm text-muted">{viewer.name}</p>
      </div>
      <Link href="/create" className="text-xs font-semibold text-accent hover:text-fg">
        Create
      </Link>
    </div>
  );
}
