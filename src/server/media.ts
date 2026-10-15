import "server-only";
import { del } from "@vercel/blob";

/** Uploads go to Vercel Blob. Only URLs from our store may be saved, so posts cannot embed arbitrary third-party files. */
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export function isBlobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

/** Best-effort removal from the blob store. Failures are logged, never thrown, so they can't block a delete. */
export async function deleteBlobs(urls: string[]): Promise<void> {
  const owned = urls.filter(isBlobUrl);
  if (!owned.length) return;
  try {
    await del(owned);
  } catch (error) {
    console.error("Blob cleanup failed", error);
  }
}

/** Upload rules per purpose. The browser asks for a purpose, and the server decides what is allowed. */
export const UPLOAD_RULES = {
  avatar: { types: ["image/jpeg", "image/png", "image/webp", "image/gif"], maxBytes: 5 * 1024 * 1024 },
  banner: { types: ["image/jpeg", "image/png", "image/webp", "image/gif"], maxBytes: 10 * 1024 * 1024 },
  image: { types: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"], maxBytes: 20 * 1024 * 1024 },
  video: { types: ["video/mp4", "video/webm", "video/quicktime"], maxBytes: 250 * 1024 * 1024 },
  audio: {
    types: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/wav", "audio/x-wav", "audio/ogg", "audio/flac"],
    maxBytes: 80 * 1024 * 1024,
  },
  // Browsers often send .glb as application/octet-stream, so that type is allowed here.
  model: { types: ["model/gltf-binary", "model/gltf+json", "application/octet-stream"], maxBytes: 150 * 1024 * 1024 },
} as const;

export type UploadPurpose = keyof typeof UPLOAD_RULES;
