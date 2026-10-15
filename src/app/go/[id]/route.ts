import { NextResponse } from "next/server";
import { recordLinkClick } from "@/server/services/profile";

/** Profile links point here so each click is counted before the visitor is sent on. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = await recordLinkClick(id);
  if (!url) return new NextResponse("This link is no longer available.", { status: 404 });
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "no-store" } });
}
