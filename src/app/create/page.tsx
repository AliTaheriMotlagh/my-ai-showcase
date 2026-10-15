import type { Metadata } from "next";
import { Composer } from "@/components/create/Composer";
import { getPost } from "@/server/queries/posts";
import { requireViewer } from "@/server/session";

export const metadata: Metadata = {
  title: "Create a showcase",
  description: "Share anything you made with AI — images, video, music, writing, code, charts or 3D.",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ remix?: string }> };

export default async function CreatePage({ searchParams }: Props) {
  const viewer = await requireViewer("/create");
  const { remix } = await searchParams;
  const source = remix && /^[a-z0-9]{10}$/.test(remix) ? await getPost(remix, viewer.id) : null;
  return <Composer remix={source} viewer={viewer} />;
}
