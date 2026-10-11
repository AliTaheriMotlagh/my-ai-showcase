"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function useInView<T extends Element>(threshold = 0.6, enabled = true) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= threshold), {
      threshold: [0, threshold, 1],
    });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, enabled]);
  return [ref, inView] as const;
}
