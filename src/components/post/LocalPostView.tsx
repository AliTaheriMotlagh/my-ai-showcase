"use client";

import { HardDrive, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { actions, useAppStore, useHydrated } from "@/lib/store";
import { Comments } from "./Comments";
import { PostCard } from "./PostCard";

/** Posts you create live in this browser until a backend is connected. */
export function LocalPostView({ id }: { id: string }) {
  const hydrated = useHydrated();
  const post = useAppStore((s) => s.posts.find((p) => p.id === id));
  const router = useRouter();

  if (!hydrated) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  if (!post) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-xl font-semibold">This post isn&apos;t on this device</h1>
        <p className="mt-2 text-muted">Posts you create are saved in your browser, so they only appear where you made them.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-bg">
          Back to feed
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-[600px] space-y-4 pb-12 sm:px-4 md:py-6">
      <h1 className="sr-only">{post.title}</h1>
      <div className="mx-3 flex items-center gap-3 rounded-2xl border border-line bg-elevated/60 p-3 text-sm sm:mx-0">
        <HardDrive className="size-4 shrink-0 text-accent" aria-hidden />
        <p className="flex-1 text-muted">Saved on this device. Connect a backend to publish it for everyone.</p>
        <button
          type="button"
          onClick={() => {
            actions.deletePost(post.id);
            toast("Post deleted");
            router.push("/me");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-like hover:bg-line"
        >
          <Trash2 className="size-4" aria-hidden /> Delete
        </button>
      </div>
      <PostCard post={post} />
      <div className="px-3 sm:px-0">
        <Comments postId={post.id} initial={[]} total={0} />
      </div>
    </div>
  );
}
