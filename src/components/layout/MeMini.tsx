"use client";

import Link from "next/link";
import { Avatar } from "@/components/art/Avatar";
import { useAppStore } from "@/lib/store";

export function MeMini() {
  const me = useAppStore((s) => s.me);
  return (
    <div className="flex items-center gap-3">
      <Link href="/me" className="shrink-0">
        <Avatar user={me} size={44} />
      </Link>
      <div className="min-w-0 flex-1 leading-tight">
        <Link href="/me" className="block truncate text-sm font-semibold hover:underline">
          {me.username}
        </Link>
        <p className="truncate text-sm text-muted">{me.name}</p>
      </div>
      <Link href="/create" className="text-xs font-semibold text-accent hover:text-fg">
        Create
      </Link>
    </div>
  );
}
