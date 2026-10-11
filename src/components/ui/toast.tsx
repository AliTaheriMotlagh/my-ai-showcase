"use client";

import { useSyncExternalStore } from "react";

type Toast = { id: number; text: string };

let toasts: Toast[] = [];
const EMPTY: Toast[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(text: string) {
  const id = Date.now() + Math.random();
  toasts = [...toasts, { id, text }];
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 2600);
}

export function Toaster() {
  const list = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => toasts,
    () => EMPTY,
  );
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 md:bottom-8"
    >
      {list.map((t) => (
        <div key={t.id} className="animate-toast rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg shadow-xl">
          {t.text}
        </div>
      ))}
    </div>
  );
}
