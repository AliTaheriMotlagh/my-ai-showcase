"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Search-as-you-type: updates the URL (debounced) so results are server-rendered and shareable. */
export function SearchInput({ initial }: { initial: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  useEffect(() => {
    if (q === initial) return;
    const t = window.setTimeout(() => {
      router.replace(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search", { scroll: false });
    }, 300);
    return () => window.clearTimeout(t);
  }, [q, initial, router]);

  return (
    <form
      role="search"
      action="/search"
      onSubmit={(e) => {
        e.preventDefault();
        router.replace(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
      }}
      className="relative"
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
      <label htmlFor="q" className="sr-only">
        Search
      </label>
      <input
        id="q"
        name="q"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search creators, prompts, models, #tags…"
        autoComplete="off"
        enterKeyHint="search"
        className="input !rounded-2xl !py-3 !pl-11 !pr-10"
      />
      {q && (
        <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-fg">
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}
