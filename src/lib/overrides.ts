"use client";

import { useSyncExternalStore } from "react";

/**
 * Optimistic state for server-owned flags (liked, saved, following).
 *
 * An override is only honoured while the server value it was made against is unchanged. So after a
 * fresh load brings back the real state, a stale override stops applying by itself, with no cleanup pass.
 */
interface Entry {
  base: boolean;
  value: boolean;
}

const entries = new Map<string, Entry>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

export function useFlag(key: string, serverValue: boolean): boolean {
  const entry = useSyncExternalStore(
    subscribe,
    () => entries.get(key),
    () => undefined,
  );
  return entry && entry.base === serverValue ? entry.value : serverValue;
}

export function setFlag(key: string, base: boolean, value: boolean) {
  entries.set(key, { base, value });
  emit();
}

export function clearFlag(key: string) {
  if (entries.delete(key)) emit();
}
