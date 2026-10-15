"use client";

import { useEffect } from "react";
import { recordViewAction } from "@/app/actions";

/** Counts one view per visit. Runs after mount, so it never delays the page. */
export function ViewCounter({ postId }: { postId: string }) {
  useEffect(() => {
    void recordViewAction(postId);
  }, [postId]);
  return null;
}
