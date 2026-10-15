import { Plus } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/art/Avatar";
import type { UserSummary } from "@/lib/types";

/** Instagram-style "stories" row. Each creator opens in Flow. Shown only when there are creators to show. */
export function StoriesRow({ users, signedIn }: { users: UserSummary[]; signedIn: boolean }) {
  if (!users.length && !signedIn) return null;
  return (
    <nav aria-label="Top creators" className="no-scrollbar flex gap-3 overflow-x-auto px-3 py-4 sm:px-1">
      {signedIn && (
        <Link href="/create" className="flex w-[72px] shrink-0 flex-col items-center gap-1.5">
          <span className="grid size-[66px] place-items-center rounded-full border-2 border-dashed border-line text-muted transition hover:border-accent hover:text-accent">
            <Plus className="size-6" aria-hidden />
          </span>
          <span className="text-xs text-muted">Your story</span>
        </Link>
      )}
      {users.map((u) => (
        <Link key={u.id} href={`/flow?user=${u.username}`} title={`Watch @${u.username} in Flow`} className="group flex w-[72px] shrink-0 flex-col items-center gap-1.5">
          <Avatar user={u} size={60} ring className="transition-transform group-hover:scale-105" />
          <span className="w-full truncate text-center text-xs">{u.username}</span>
        </Link>
      ))}
    </nav>
  );
}
