"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedPage, FeedPost } from "@/lib/types";

interface Options {
  /** Changing the key resets the list (e.g. switching tabs or filters). */
  key: string;
  fetchPage: (cursor: number) => Promise<FeedPage>;
  initial?: FeedPage;
  /** Scroll container for the sentinel; defaults to the viewport. */
  root?: Element | null;
}

export interface InfiniteFeed {
  items: FeedPost[];
  loading: boolean;
  error: boolean;
  done: boolean;
  loadMore: () => void;
  retry: () => void;
  attachSentinel: (el: Element | null) => void;
}

export function useInfiniteFeed({ key, fetchPage, initial, root = null }: Options): InfiniteFeed {
  const [items, setItems] = useState<FeedPost[]>(initial?.items ?? []);
  const [cursor, setCursor] = useState<number | null>(initial ? initial.nextCursor : 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [prevKey, setPrevKey] = useState(key);
  const [sentinel, setSentinel] = useState<Element | null>(null);

  // Reset synchronously during render when the key changes.
  if (prevKey !== key) {
    setPrevKey(key);
    setItems([]);
    setCursor(0);
    setError(false);
    setLoading(false);
  }

  const busy = useRef(false);
  const keyRef = useRef(key);
  const fetchRef = useRef(fetchPage);
  useEffect(() => {
    fetchRef.current = fetchPage;
  }, [fetchPage]);
  useEffect(() => {
    keyRef.current = key;
    busy.current = false;
  }, [key]);

  const loadMore = useCallback(async () => {
    if (busy.current || cursor === null || error) return;
    busy.current = true;
    setLoading(true);
    const requestKey = key;
    try {
      const page = await fetchRef.current(cursor);
      if (keyRef.current !== requestKey) return;
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    } catch {
      if (keyRef.current === requestKey) setError(true);
    } finally {
      if (keyRef.current === requestKey) {
        busy.current = false;
        setLoading(false);
      }
    }
  }, [cursor, error, key]);

  // Re-created whenever loadMore changes, so a sentinel that is still visible
  // after a page loads triggers the next one.
  useEffect(() => {
    if (!sentinel) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore(), {
      root,
      rootMargin: "1200px 0px",
    });
    io.observe(sentinel);
    return () => io.disconnect();
  }, [sentinel, loadMore, root]);

  return {
    items,
    loading,
    error,
    done: cursor === null,
    loadMore,
    retry: () => setError(false),
    attachSentinel: setSentinel,
  };
}
