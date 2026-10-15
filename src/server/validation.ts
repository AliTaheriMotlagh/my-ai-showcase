import "server-only";
import { z } from "zod";
import { LIMITS } from "@/lib/rules";
import { POST_KINDS } from "@/lib/kinds";
import { isBlobUrl } from "./media";

export const idSchema = z.string().regex(/^[a-z0-9]{10}$/, "Invalid id");

const blobUrl = z.string().max(2048).refine(isBlobUrl, "This file didn't come from an upload. Please try again.");

export const mediaSchema = z.object({
  url: blobUrl,
  type: z.enum(["image", "video", "audio", "model"]),
  mime: z.string().max(100),
  width: z.number().int().positive().max(20000).nullable().optional(),
  height: z.number().int().positive().max(20000).nullable().optional(),
  duration: z.number().nonnegative().max(60 * 60 * 6).nullable().optional(),
});

export const postInputSchema = z
  .object({
    kind: z.enum(POST_KINDS),
    title: z.string().trim().min(1, "Give your showcase a title.").max(LIMITS.postTitle),
    caption: z.string().trim().max(LIMITS.caption).default(""),
    prompt: z.string().trim().max(LIMITS.prompt).default(""),
    model: z.string().trim().min(1, "Tell people which model or tool you used.").max(LIMITS.model),
    tags: z.array(z.string().max(60)).max(20).default([]),
    aspect: z.enum(["square", "portrait", "landscape"]).default("square"),
    media: z.array(mediaSchema).max(LIMITS.galleryImages).default([]),
    text: z
      .object({
        form: z.string().trim().min(1).max(40),
        body: z.string().trim().min(1, "Add the writing.").max(LIMITS.textBody),
      })
      .optional(),
    code: z
      .object({
        language: z.string().trim().min(1).max(40),
        filename: z.string().trim().min(1).max(120),
        source: z.string().min(1, "Add the code.").max(LIMITS.codeSource),
      })
      .optional(),
    chat: z
      .array(z.object({ role: z.enum(["user", "ai"]), text: z.string().trim().min(1).max(LIMITS.chatMessages.text) }))
      .min(1, "Add at least one message.")
      .max(LIMITS.chatMessages.max)
      .optional(),
    chart: z
      .object({
        type: z.enum(["bar", "line", "donut"]),
        labels: z.array(z.string().trim().min(1).max(LIMITS.chartRows.label)).min(1).max(LIMITS.chartRows.max),
        values: z.array(z.number().finite().nonnegative().max(1e12)).min(1).max(LIMITS.chartRows.max),
        unit: z.string().max(8).optional(),
      })
      .refine((c) => c.labels.length === c.values.length, "Every chart row needs a label and a value.")
      .optional(),
    remixOfId: idSchema.nullable().optional(),
  })
  .superRefine((input, ctx) => {
    const count = (type: string) => input.media.filter((m) => m.type === type).length;
    const need = (ok: boolean, message: string) => {
      if (!ok) ctx.addIssue({ code: "custom", message, path: ["media"] });
    };
    switch (input.kind) {
      case "image":
        need(count("image") === 1, "Upload one image.");
        break;
      case "gallery":
        need(count("image") >= 2, "A series needs at least two images.");
        break;
      case "video":
        need(count("video") === 1, "Upload a video.");
        break;
      case "audio":
        need(count("audio") === 1, "Upload an audio file.");
        break;
      case "3d":
        need(count("model") === 1, "Upload a .glb or .gltf model.");
        break;
      case "text":
        need(!!input.text, "Add the writing.");
        break;
      case "code":
        need(!!input.code, "Add the code.");
        break;
      case "chat":
        need(!!input.chat, "Add the conversation.");
        break;
      case "chart":
        need(!!input.chart, "Add the chart data.");
        break;
    }
  });

export type PostInput = z.infer<typeof postInputSchema>;

export const profileInputSchema = z.object({
  name: z.string().trim().min(1, "Enter a display name.").max(LIMITS.name),
  username: z.string().trim().toLowerCase().min(LIMITS.username.min).max(LIMITS.username.max),
  headline: z.string().trim().max(LIMITS.headline),
  bio: z.string().trim().max(LIMITS.bio),
  location: z.string().trim().max(LIMITS.location),
  website: z.string().trim().max(LIMITS.website),
  tools: z.array(z.string().max(LIMITS.tools.item)).max(LIMITS.tools.max),
  avatar: blobUrl.nullable(),
  banner: blobUrl.nullable(),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export const linkInputSchema = z.object({
  title: z.string().trim().min(1, "Give the link a title.").max(LIMITS.linkTitle),
  url: z.string().trim().min(1, "Enter a link.").max(LIMITS.linkUrl),
});

export const commentInputSchema = z.object({
  postId: idSchema,
  body: z.string().trim().min(1, "Write something first.").max(LIMITS.comment),
});

export const reportReasons = ["spam", "inappropriate", "copyright", "other"] as const;

export const reportInputSchema = z.object({
  postId: idSchema,
  reason: z.enum(reportReasons),
  details: z.string().trim().max(LIMITS.reportDetails).default(""),
});
