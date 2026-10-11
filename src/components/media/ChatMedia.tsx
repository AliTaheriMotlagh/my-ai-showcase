import { Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/lib/types";
import type { MediaProps } from "./shared";

function Bubble({ m, small }: { m: ChatMessage; small?: boolean }) {
  if (m.role === "user") {
    return (
      <div
        className={cn(
          "max-w-[85%] self-end whitespace-pre-line rounded-2xl rounded-br-md bg-brand text-white",
          small ? "line-clamp-3 px-2 py-1 text-[9px] sm:text-[10px]" : "px-3.5 py-2 text-sm",
        )}
      >
        {m.text}
      </div>
    );
  }
  return (
    <div className={cn("flex max-w-[92%] gap-2 self-start", small && "gap-1")}>
      {!small && (
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-elevated text-accent" aria-hidden>
          <Sparkles className="size-3.5" />
        </span>
      )}
      <div
        className={cn(
          "whitespace-pre-line rounded-2xl rounded-tl-md bg-elevated",
          small ? "line-clamp-4 px-2 py-1 text-[9px] sm:text-[10px]" : "px-3.5 py-2 text-sm leading-relaxed",
        )}
      >
        {m.text}
      </div>
    </div>
  );
}

export function ChatMedia({ post, variant }: MediaProps) {
  const msgs = post.chat ?? [];

  if (variant === "tile") {
    return (
      <div className="absolute inset-0 flex flex-col gap-1.5 overflow-hidden bg-card p-2.5">
        {msgs.slice(0, 4).map((m, i) => (
          <Bubble key={i} m={m} small />
        ))}
      </div>
    );
  }

  const full = variant === "full";
  const limit = full ? msgs.length : 4;
  return (
    <div className={cn("flex flex-col bg-card", full && "h-full w-full overflow-y-auto")}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-xs text-muted">
        <Sparkles className="size-3.5 text-accent" aria-hidden />
        Conversation with <span className="font-medium text-fg">{post.model}</span>
      </div>
      <div className="flex flex-col gap-3 p-4">
        {msgs.slice(0, limit).map((m, i) => (
          <Bubble key={i} m={m} />
        ))}
      </div>
      {msgs.length > limit && (
        <Link href={`/p/${post.id}`} className="px-4 pb-4 text-sm font-medium text-accent hover:underline">
          +{msgs.length - limit} more {msgs.length - limit === 1 ? "message" : "messages"}
        </Link>
      )}
    </div>
  );
}
