import { useId } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="0.6" stopColor="#db2777" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id}g)`} />
      <path d="M32 12c2 11 9 18 20 20-11 2-18 9-20 20-2-11-9-18-20-20 11-2 18-9 20-20z" fill="#fff" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark className="size-7 shrink-0" />
      <span className="font-display text-[28px] leading-none tracking-tight">{site.name}</span>
    </span>
  );
}
