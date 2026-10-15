"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { LIMITS, usernameError } from "@/lib/rules";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const signup = mode === "signup";

  const submit = async (form: FormData) => {
    setError("");
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (signup) {
      const username = String(form.get("username") ?? "").trim().toLowerCase();
      const name = String(form.get("name") ?? "").trim();
      const problem = usernameError(username) ?? (name ? null : "Enter your name.");
      if (problem) return setError(problem);
    }

    setPending(true);
    try {
      const result = signup
        ? await authClient.signUp.email({
            email,
            password,
            name: String(form.get("name") ?? "").trim(),
            username: String(form.get("username") ?? "").trim().toLowerCase(),
          })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(friendly(result.error.message, signup));
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm px-5 py-14">
      <h1 className="font-display text-4xl">{signup ? "Create your profile" : "Welcome back"}</h1>
      <p className="mt-2 text-sm text-muted">
        {signup ? "Share your AI work, build a link page and get discovered." : "Log in to post, follow creators and see your notifications."}
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(new FormData(e.currentTarget));
        }}
      >
        {signup && (
          <>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Display name</span>
              <input name="name" autoComplete="name" required maxLength={LIMITS.name} className="input" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Username</span>
              <span className="flex items-center rounded-xl border border-line bg-bg focus-within:border-accent">
                <span className="pl-3.5 text-muted">@</span>
                <input
                  name="username"
                  autoComplete="username"
                  required
                  minLength={LIMITS.username.min}
                  maxLength={LIMITS.username.max}
                  pattern="[A-Za-z0-9][A-Za-z0-9_.]*[A-Za-z0-9]"
                  className="w-full bg-transparent px-2 py-2.5 outline-none"
                />
              </span>
              <span className="block text-xs text-muted">Your profile lives at /u/username. Letters, numbers, dots and underscores.</span>
            </label>
          </>
        )}
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" autoComplete="email" required className="input" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            autoComplete={signup ? "new-password" : "current-password"}
            required
            minLength={8}
            maxLength={128}
            className="input"
          />
          {signup && <span className="block text-xs text-muted">At least 8 characters.</span>}
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-like/10 px-3.5 py-2.5 text-sm text-like">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-60">
          {pending ? "Please wait…" : signup ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {signup ? "Already have an account? " : "New here? "}
        <Link href={`${signup ? "/login" : "/signup"}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-accent hover:underline">
          {signup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

/** Turns auth-library messages into something a person can act on. */
function friendly(message: string | undefined, signup: boolean) {
  const m = (message ?? "").toLowerCase();
  if (m.includes("already") || m.includes("exists")) return "An account with this email already exists. Try logging in.";
  if (m.includes("invalid email or password") || m.includes("invalid password") || m.includes("invalid credentials")) return "That email and password don't match.";
  if (m.includes("username")) return message ?? "That username can't be used.";
  if (m.includes("password") && m.includes("short")) return "Passwords need at least 8 characters.";
  if (m.includes("rate") || m.includes("too many")) return "Too many attempts. Wait a minute and try again.";
  return message || (signup ? "We couldn't create your account." : "We couldn't log you in.");
}
