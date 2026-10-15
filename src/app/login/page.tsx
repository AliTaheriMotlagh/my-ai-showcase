import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { safeNext } from "@/lib/safe-next";
import { getViewer } from "@/server/session";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const destination = safeNext(next);
  if (await getViewer()) redirect(destination);
  return <AuthForm mode="login" next={destination} />;
}
