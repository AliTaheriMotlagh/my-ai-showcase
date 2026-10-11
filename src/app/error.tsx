"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <h1 className="font-display text-4xl">Something glitched</h1>
      <p className="mt-3 text-muted">An unexpected error happened while loading this page.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-bg">
        Try again
      </button>
    </div>
  );
}
