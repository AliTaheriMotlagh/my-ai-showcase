import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { KINDS } from "@/lib/kinds";
import type { PostKind } from "@/lib/types";

/** Format filter chips — real links so every filtered view is crawlable. */
export function KindChips({
  basePath,
  active,
  counts,
  className,
}: {
  basePath: string;
  active: PostKind | null;
  counts?: Partial<Record<PostKind, number>>;
  className?: string;
}) {
  const kinds = counts ? KINDS.filter((k) => counts[k.id]) : KINDS;
  const chip = (on: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
      on ? "border-fg bg-fg text-bg" : "border-line hover:bg-elevated",
    );
  return (
    <nav aria-label="Filter by format" className={cn("no-scrollbar flex gap-2 overflow-x-auto", className)}>
      <Link href={basePath} scroll={false} className={chip(!active)} aria-current={!active ? "page" : undefined}>
        <LayoutGrid className="size-4" aria-hidden /> All
      </Link>
      {kinds.map(({ id, plural, icon: Icon }) => (
        <Link
          key={id}
          href={`${basePath}?kind=${id}`}
          scroll={false}
          className={chip(active === id)}
          aria-current={active === id ? "page" : undefined}
        >
          <Icon className="size-4" aria-hidden /> {plural}
          {counts?.[id] ? <span className="opacity-60">{counts[id]}</span> : null}
        </Link>
      ))}
    </nav>
  );
}
