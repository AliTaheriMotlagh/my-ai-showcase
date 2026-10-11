import {
  Box,
  ChartColumn,
  Clapperboard,
  Code2,
  FileText,
  Image as ImageIcon,
  Images,
  MessagesSquare,
  Music2,
  type LucideIcon,
} from "lucide-react";
import type { PostKind } from "./types";

export interface KindMeta {
  id: PostKind;
  label: string;
  plural: string;
  icon: LucideIcon;
  blurb: string;
  /** schema.org type used for structured data. */
  schemaType: string;
}

export const KINDS: KindMeta[] = [
  { id: "image", label: "Image", plural: "Images", icon: ImageIcon, blurb: "Stills, art and photography from image models", schemaType: "ImageObject" },
  { id: "gallery", label: "Series", plural: "Series", icon: Images, blurb: "Multi-image carousels and collections", schemaType: "ImageGallery" },
  { id: "video", label: "Video", plural: "Videos", icon: Clapperboard, blurb: "Clips and short films from text-to-video models", schemaType: "VideoObject" },
  { id: "audio", label: "Music", plural: "Music", icon: Music2, blurb: "Songs, loops and soundscapes", schemaType: "MusicRecording" },
  { id: "text", label: "Writing", plural: "Writing", icon: FileText, blurb: "Poems, stories and essays", schemaType: "CreativeWork" },
  { id: "code", label: "Code", plural: "Code", icon: Code2, blurb: "Snippets, tools and creative coding", schemaType: "SoftwareSourceCode" },
  { id: "chat", label: "Chat", plural: "Chats", icon: MessagesSquare, blurb: "Conversations worth sharing", schemaType: "Conversation" },
  { id: "chart", label: "Data", plural: "Data viz", icon: ChartColumn, blurb: "Charts, dashboards and analysis", schemaType: "Dataset" },
  { id: "3d", label: "3D", plural: "3D", icon: Box, blurb: "Objects, models and scenes", schemaType: "3DModel" },
];

export const KIND_MAP = Object.fromEntries(KINDS.map((k) => [k.id, k])) as Record<PostKind, KindMeta>;

export const isKind = (v: unknown): v is PostKind => typeof v === "string" && v in KIND_MAP;

/** Kinds whose media is a picture-like surface (vs. text-like cards). */
export const VISUAL_KINDS: PostKind[] = ["image", "gallery", "video", "audio", "3d"];

export const KIND_MODELS: Record<PostKind, string[]> = {
  image: ["Midjourney v7", "FLUX.1 Pro", "GPT Image", "Imagen 4", "Stable Diffusion 3.5", "Ideogram 3", "Firefly Image 4"],
  gallery: ["Midjourney v7", "FLUX.1 Pro", "Imagen 4", "Niji 6", "Stable Diffusion 3.5"],
  video: ["Sora 2", "Veo 3", "Runway Gen-4", "Kling 2.1", "Pika 2.2", "Luma Ray 2"],
  audio: ["Suno v5", "Udio", "ElevenLabs Music", "Stable Audio 2"],
  text: ["Claude Opus 5.5", "Claude Sonnet 5.5", "GPT-5", "Gemini 2.5 Pro"],
  code: ["Claude Code", "Claude Opus 5.5", "Cursor", "GitHub Copilot", "v0"],
  chat: ["Claude Sonnet 5.5", "Claude Opus 5.5", "GPT-5", "Gemini 2.5 Pro"],
  chart: ["Claude Opus 5.5", "Julius AI", "ChatGPT Data Analysis"],
  "3d": ["Meshy 5", "Tripo 2", "Luma Genie", "Rodin Gen-1"],
};
