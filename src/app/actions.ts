"use server";

import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import type { Comment, ProfileLink } from "@/lib/types";
import { type ActionResult, ServiceError } from "@/server/errors";
import { getViewer, type Viewer } from "@/server/session";
import { deleteBlobs } from "@/server/media";
import { createComment, deleteComment, markNotificationsRead, reportPost, toggleFollow } from "@/server/services/social";
import { createPost, deletePost, recordView, toggleLike, toggleSave } from "@/server/services/posts";
import { addLink, collectAccountBlobs, deleteLink, moveLink, updateLink, updateProfile } from "@/server/services/profile";

/**
 * Every write goes through here. Each action checks the session, runs one service call and maps
 * failures to a message that is safe to show. Unexpected errors are logged and replaced with a generic message.
 */
async function run<T>(fn: (viewer: Viewer) => Promise<T>): Promise<ActionResult<T>> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Log in to do that.", needsAuth: true };
  try {
    return { ok: true, data: await fn(viewer) };
  } catch (error) {
    if (error instanceof ServiceError) return { ok: false, error: error.message };
    console.error("Action failed", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function toggleLikeAction(postId: string) {
  return run((v) => toggleLike(v.id, postId));
}

export async function toggleSaveAction(postId: string) {
  return run((v) => toggleSave(v.id, postId));
}

export async function toggleFollowAction(userId: string) {
  return run((v) => toggleFollow(v.id, userId));
}

export async function createCommentAction(postId: string, body: string): Promise<ActionResult<Comment>> {
  return run((v) => createComment(v.id, { postId, body }));
}

export async function deleteCommentAction(commentId: string): Promise<ActionResult> {
  return run((v) => deleteComment(v.id, commentId));
}

export async function createPostAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return run((v) => createPost(v.id, input));
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
  return run((v) => deletePost(v.id, postId));
}

export async function reportPostAction(input: unknown): Promise<ActionResult> {
  return run((v) => reportPost(v.id, input));
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  return run((v) => updateProfile(v.id, input));
}

export async function addLinkAction(input: unknown): Promise<ActionResult<ProfileLink[]>> {
  return run((v) => addLink(v.id, input));
}

export async function updateLinkAction(linkId: string, input: unknown): Promise<ActionResult<ProfileLink[]>> {
  return run((v) => updateLink(v.id, linkId, input));
}

export async function deleteLinkAction(linkId: string): Promise<ActionResult<ProfileLink[]>> {
  return run((v) => deleteLink(v.id, linkId));
}

export async function moveLinkAction(linkId: string, direction: "up" | "down"): Promise<ActionResult<ProfileLink[]>> {
  return run((v) => moveLink(v.id, linkId, direction));
}

export async function markNotificationsReadAction(): Promise<ActionResult> {
  return run((v) => markNotificationsRead(v.id));
}

/** Anyone can view a post, so views are counted without a session. */
export async function recordViewAction(postId: string): Promise<void> {
  try {
    await recordView(postId);
  } catch {
    // A missed view count is harmless; never surface this to the reader.
  }
}

/** Deletes the account after a password check, then removes its uploaded files. */
export async function deleteAccountAction(password: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Log in to do that.", needsAuth: true };
  if (!password) return { ok: false, error: "Enter your password to delete your account." };
  try {
    const files = await collectAccountBlobs(viewer.id);
    await auth.api.deleteUser({ body: { password }, headers: await headers() });
    await deleteBlobs(files);
    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof APIError) return { ok: false, error: error.message || "We couldn't delete your account." };
    console.error("Account deletion failed", error);
    return { ok: false, error: "We couldn't delete your account. Please try again." };
  }
}
