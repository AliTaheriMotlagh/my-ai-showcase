import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { UPLOAD_RULES, type UploadPurpose } from "@/server/media";
import { viewerFromHeaders } from "@/server/session";

/**
 * Step 1 of a direct browser upload: issues a short-lived token scoped to one file.
 * Files then go straight to Blob storage, so large videos never pass through this function.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const viewer = await viewerFromHeaders(request.headers);
        if (!viewer) throw new Error("Log in to upload files.");

        const purpose = (clientPayload ? JSON.parse(clientPayload).purpose : undefined) as UploadPurpose | undefined;
        if (!purpose || !(purpose in UPLOAD_RULES)) throw new Error("Unknown upload type.");
        // Files are stored under the uploader's id, so ownership is visible in the path.
        if (!pathname.startsWith(`users/${viewer.id}/`)) throw new Error("Invalid upload path.");

        const rule = UPLOAD_RULES[purpose];
        return {
          allowedContentTypes: [...rule.types],
          maximumSizeInBytes: rule.maxBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: viewer.id, purpose }),
        };
      },
      onUploadCompleted: async () => {
        // Nothing to record: the file URL is saved when the post or profile is saved.
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
