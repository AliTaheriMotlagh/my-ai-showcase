import type { Metadata } from "next";
import { Composer } from "@/components/create/Composer";
import { getPost } from "@/lib/data";

export const metadata: Metadata = {
  title: "Create a showcase",
  description: "Share anything you made with AI — images, video, music, writing, code, charts or 3D.",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ remix?: string }> };

export default async function CreatePage({ searchParams }: Props) {
  const { remix } = await searchParams;
  const source = remix ? getPost(remix) ?? null : null;
  return <Composer remix={source} />;
}
