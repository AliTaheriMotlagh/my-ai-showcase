import type { Metadata } from "next";
import { MeView } from "@/components/profile/MeView";

export const metadata: Metadata = { title: "Your profile", robots: { index: false } };

export default function MePage() {
  return <MeView />;
}
