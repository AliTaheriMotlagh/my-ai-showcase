import type { Post, User } from "./types";

export const profileHref = (user: Pick<User, "id" | "username">) => (user.id === "me" ? "/me" : `/u/${user.username}`);
export const postHref = (post: Pick<Post, "id">) => `/p/${post.id}`;
export const tagHref = (tag: string) => `/tags/${encodeURIComponent(tag)}`;
