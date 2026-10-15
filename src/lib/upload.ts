"use client";

import { upload } from "@vercel/blob/client";
import type { MediaType } from "./types";

/** Must match the purposes in src/server/media.ts. */
export type UploadPurpose = "avatar" | "banner" | "image" | "video" | "audio" | "model";

const MULTIPART_ABOVE = 20 * 1024 * 1024;

/** Uploads straight to Blob storage using a token from /api/upload. Returns the public URL. */
export async function uploadFile(file: File, purpose: UploadPurpose, userId: string, onProgress?: (fraction: number) => void): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "upload";
  const pathname = `users/${userId}/${purpose}/${Date.now().toString(36)}-${safeName}`;
  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    clientPayload: JSON.stringify({ purpose }),
    multipart: file.size > MULTIPART_ABOVE,
    onUploadProgress: onProgress ? ({ percentage }) => onProgress(percentage / 100) : undefined,
  });
  return blob.url;
}

/** Reads what the browser can tell about a file: pixel size for images, length for audio and video. */
export async function measureFile(file: File, type: MediaType): Promise<{ width?: number; height?: number; duration?: number }> {
  if (type === "image") {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  }
  if (type === "video" || type === "audio") {
    const url = URL.createObjectURL(file);
    try {
      const el: HTMLMediaElement = type === "video" ? document.createElement("video") : document.createElement("audio");
      el.preload = "metadata";
      el.src = url;
      await new Promise<void>((resolve, reject) => {
        el.onloadedmetadata = () => resolve();
        el.onerror = () => reject(new Error("unreadable media"));
      });
      const duration = Number.isFinite(el.duration) ? el.duration : undefined;
      if (el instanceof HTMLVideoElement) return { width: el.videoWidth || undefined, height: el.videoHeight || undefined, duration };
      return { duration };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return {};
}

export function aspectFor(width?: number, height?: number): "square" | "portrait" | "landscape" {
  if (!width || !height) return "square";
  const ratio = width / height;
  if (ratio > 1.2) return "landscape";
  if (ratio < 0.9) return "portrait";
  return "square";
}
