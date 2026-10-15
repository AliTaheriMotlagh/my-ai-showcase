"use client";

import { useCallback, useRef } from "react";
import { toast } from "@/components/ui/toast";
import { clearFlag, setFlag, useFlag } from "@/lib/overrides";
import type { ActionResult } from "@/server/errors";

/**
 * A boolean that the server owns, flipped optimistically. A second tap while a request is in flight is ignored,
 * so rapid taps can't send contradictory requests.
 */
export function useServerToggle<T>({
  key,
  serverValue,
  run,
  select,
  needsAuthMessage,
}: {
  key: string;
  serverValue: boolean;
  run: () => Promise<ActionResult<T>>;
  select: (data: T) => boolean;
  needsAuthMessage: string;
}) {
  const value = useFlag(key, serverValue);
  const pending = useRef(false);

  const toggle = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    const next = !value;
    setFlag(key, serverValue, next);
    try {
      const result = await run();
      if (!result.ok) {
        clearFlag(key);
        toast(result.needsAuth ? needsAuthMessage : result.error);
        return;
      }
      setFlag(key, serverValue, select(result.data));
    } catch {
      clearFlag(key);
      toast("Couldn't save that. Check your connection and try again.");
    } finally {
      pending.current = false;
    }
  }, [key, serverValue, value, run, select, needsAuthMessage]);

  return { value, toggle };
}
