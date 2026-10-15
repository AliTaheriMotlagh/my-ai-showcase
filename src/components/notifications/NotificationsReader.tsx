"use client";

import { useEffect } from "react";
import { markNotificationsReadAction } from "@/app/actions";

/** Marks everything read once the page has been shown. The unread dot in the nav clears on the next navigation. */
export function NotificationsReader({ unread }: { unread: boolean }) {
  useEffect(() => {
    if (unread) void markNotificationsReadAction();
  }, [unread]);
  return null;
}
