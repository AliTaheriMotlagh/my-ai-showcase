"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const listeners = new Set<() => void>();

function useIsDark() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => document.documentElement.classList.contains("dark"),
    () => true,
  );
}

export function ThemeToggle({ withLabel, className }: { withLabel?: boolean; className?: string }) {
  const dark = useIsDark();
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    listeners.forEach((l) => l());
  };
  const Icon = dark ? Sun : Moon;
  const label = dark ? "Light mode" : "Dark mode";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        withLabel
          ? "flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-elevated"
          : "grid size-10 place-items-center rounded-full hover:bg-elevated",
        className,
      )}
    >
      <Icon className={withLabel ? "size-6 shrink-0" : "size-[22px]"} strokeWidth={1.9} />
      {withLabel && <span className="hidden xl:inline">{label}</span>}
    </button>
  );
}
