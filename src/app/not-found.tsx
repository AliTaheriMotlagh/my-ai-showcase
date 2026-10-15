import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <p className="font-display text-7xl text-brand">404</p>
      <h1 className="mt-6 font-display text-4xl">Nothing here</h1>
      <p className="mt-3 text-muted">This page doesn&apos;t exist, or it has been removed.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-bg">
          Home feed
        </Link>
        <Link href="/explore" className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-elevated">
          Explore
        </Link>
      </div>
    </div>
  );
}
