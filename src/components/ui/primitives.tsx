import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { KIND_MAP } from "@/lib/kinds";
import type { PostKind } from "@/lib/types";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <BadgeCheck
      aria-label="Verified creator"
      role="img"
      className={cn("size-4 shrink-0 fill-sky-500 text-bg", className)}
    />
  );
}

export function KindBadge({ kind, className }: { kind: PostKind; className?: string }) {
  const meta = KIND_MAP[kind];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-0.5 text-xs font-medium", className)}>
      <Icon className="size-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-block size-6 animate-spin rounded-full border-2 border-line border-t-accent", className)}
    />
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so user content can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}
