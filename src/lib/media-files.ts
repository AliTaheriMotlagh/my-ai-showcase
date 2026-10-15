import type { MediaType } from "./types";

/** Client-side mirror of the upload rules in src/server/media.ts, so people learn about a bad file before uploading it. */
const LIMITS: Record<MediaType, { maxBytes: number; ok: (f: File) => boolean; label: string }> = {
  image: {
    maxBytes: 20 * 1024 * 1024,
    ok: (f) => /^image\/(jpeg|png|webp|gif|avif)$/.test(f.type),
    label: "JPG, PNG, WebP, GIF or AVIF images up to 20 MB",
  },
  video: {
    maxBytes: 250 * 1024 * 1024,
    ok: (f) => /^video\/(mp4|webm|quicktime)$/.test(f.type),
    label: "MP4, WebM or MOV videos up to 250 MB",
  },
  audio: {
    maxBytes: 80 * 1024 * 1024,
    ok: (f) => /^audio\//.test(f.type),
    label: "MP3, M4A, WAV, OGG or FLAC audio up to 80 MB",
  },
  model: {
    maxBytes: 150 * 1024 * 1024,
    ok: (f) => /\.(glb|gltf)$/i.test(f.name),
    label: ".glb or .gltf models up to 150 MB",
  },
};

/** Returns an error message, or null when the file is acceptable for that media type. */
export function fileProblem(file: File, type: MediaType): string | null {
  const rule = LIMITS[type];
  if (!rule.ok(file)) return `${file.name}: please use ${rule.label}.`;
  if (file.size > rule.maxBytes) return `${file.name} is too large. The limit is ${Math.round(rule.maxBytes / 1024 / 1024)} MB.`;
  return null;
}

export const ACCEPT: Record<MediaType, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif,image/avif",
  video: "video/mp4,video/webm,video/quicktime",
  audio: "audio/*",
  model: ".glb,.gltf,model/gltf-binary,model/gltf+json",
};

/** Which media type a file should be uploaded as, if the user picked it for a given slot. */
export function mediaTypeOf(file: File): MediaType | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (/\.(glb|gltf)$/i.test(file.name)) return "model";
  return null;
}
