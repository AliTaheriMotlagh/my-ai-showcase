"use client";

import { ChevronDown, Repeat2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CopyButton } from "@/components/ui/client-bits";
import { cn } from "@/lib/cn";
import type { FeedPost } from "@/lib/types";

/** Collapsible prompt preview for feed cards. */
export function PromptPeek({ prompt }: { prompt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-elevated px-3 py-2 text-sm">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-2 text-left text-muted">
        <Wand2 className="size-4 shrink-0 text-accent" aria-hidden />
        <span className={cn("flex-1", !open && "truncate")}>{open ? "Prompt" : prompt}</span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="mt-2 flex flex-col items-start gap-2">
          <p className="font-mono text-[13px] leading-relaxed text-fg/90">{prompt}</p>
          <CopyButton text={prompt} label="Copy prompt" />
        </div>
      )}
    </div>
  );
}

/** Full prompt panel for the post page. */
export function PromptBox({ post }: { post: FeedPost }) {
  return (
    <section aria-labelledby="prompt-heading" className="rounded-2xl border border-line bg-elevated/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Wand2 className="size-4 text-accent" aria-hidden />
        <h2 id="prompt-heading" className="text-sm font-semibold">
          Prompt
        </h2>
        <span className="ml-auto text-xs text-muted">{post.model}</span>
      </div>
      <p className="font-mono text-[13px] leading-relaxed">{post.prompt}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyButton text={post.prompt} label="Copy prompt" />
        <Link
          href={`/create?remix=${post.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-2.5 py-1.5 text-xs font-semibold text-white"
        >
          <Repeat2 className="size-3.5" aria-hidden /> Remix this
        </Link>
      </div>
    </section>
  );
}
