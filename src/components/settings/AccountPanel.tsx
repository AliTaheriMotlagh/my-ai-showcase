"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAccountAction } from "@/app/actions";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/primitives";

export function AccountPanel({ email }: { email: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  };

  const deleteAccount = () => {
    setError("");
    startTransition(async () => {
      const result = await deleteAccountAction(password);
      if (!result.ok) return setError(result.error);
      toast("Your account has been deleted");
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line p-4">
        <p className="text-sm text-muted">Email</p>
        <p className="font-medium">{email}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => void signOut()} className="rounded-xl bg-elevated px-4 py-2.5 text-sm font-semibold hover:bg-line">
          Log out
        </button>
      </div>

      <div className="rounded-2xl border border-like/40 p-4">
        <h2 className="font-semibold text-like">Delete account</h2>
        <p className="mt-1 text-sm text-muted">
          This removes your profile, posts, comments, links and uploaded files. It can&apos;t be undone.
        </p>
        {!confirming ? (
          <button type="button" onClick={() => setConfirming(true)} className="mt-4 rounded-xl border border-like/60 px-4 py-2 text-sm font-semibold text-like hover:bg-like/10">
            Delete my account
          </button>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              deleteAccount();
            }}
          >
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Enter your password to confirm</span>
              <input type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {error && (
              <p role="alert" className="text-sm text-like">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-like px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {pending && <Spinner className="size-3.5 border-white/40 border-t-white" />} Permanently delete
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:text-fg">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
