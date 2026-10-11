import { CopyButton } from "@/components/ui/client-bits";
import { cn } from "@/lib/cn";
import { highlight } from "@/lib/highlight";
import type { MediaProps } from "./shared";

function Dots({ small }: { small?: boolean }) {
  const s = small ? "size-1.5" : "size-2.5";
  return (
    <span className="flex gap-1.5" aria-hidden>
      <span className={cn(s, "rounded-full bg-[#ff5f57]")} />
      <span className={cn(s, "rounded-full bg-[#febc2e]")} />
      <span className={cn(s, "rounded-full bg-[#28c840]")} />
    </span>
  );
}

export function CodeMedia({ post, variant }: MediaProps) {
  const c = post.code ?? { language: "text", filename: "snippet.txt", source: "" };

  if (variant === "tile") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#0d1117] p-3 font-mono text-[8.5px] leading-[1.5] text-[#c9d1d9] sm:text-[10.5px]">
        <div className="mb-2 flex items-center gap-2">
          <Dots small />
          <span className="truncate text-[#8b949e]">{c.filename}</span>
        </div>
        <pre className="whitespace-pre">
          <code>{highlight(c.source.split("\n").slice(0, 24).join("\n"), c.language)}</code>
        </pre>
      </div>
    );
  }

  const full = variant === "full";
  return (
    <div className={cn("flex flex-col overflow-hidden bg-[#0d1117] text-[#c9d1d9]", full ? "h-full w-full" : "relative")}>
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2">
        <Dots />
        <span className="truncate font-mono text-xs text-[#8b949e]">{c.filename}</span>
        <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">{c.language}</span>
        <CopyButton text={c.source} dark />
      </div>
      <pre className={cn("overflow-auto p-4 font-mono text-[12.5px] leading-6", full ? "min-h-0 flex-1" : "max-h-[26rem]")}>
        <code>{highlight(c.source, c.language)}</code>
      </pre>
    </div>
  );
}
