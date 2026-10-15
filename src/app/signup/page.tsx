import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { safeNext } from "@/lib/safe-next";
import { getViewer } from "@/server/session";

export const metadata: Metadata = {
  title: "Create your profile",
  description: "Sign up to share your AI work, build a portfolio and link page, and follow creators.",
  alternates: { canonical: "/signup" },
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const destination = safeNext(next, "/settings");
  if (await getViewer()) redirect(destination);
  return <AuthForm mode="signup" next={destination} />;
}
