import Link from "next/link";
import { Artwork } from "@/components/art/Artwork";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <div className="relative size-40 overflow-hidden rounded-3xl">
        <Artwork visual={{ seed: 404, style: "planet", palette: ["#0b0221", "#3a0ca3", "#7209b7", "#f72585", "#4cc9f0"] }} />
      </div>
      <h1 className="mt-8 font-display text-5xl">Lost in latent space</h1>
      <p className="mt-3 text-muted">This page doesn&apos;t exist, or it was never generated. Let&apos;s get you back to something beautiful.</p>
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
