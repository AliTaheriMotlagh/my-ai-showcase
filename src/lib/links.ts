export const profileHref = (user: { username: string }) => `/u/${user.username}`;
export const postHref = (post: { id: string }) => `/p/${post.id}`;
export const tagHref = (tag: string) => `/tags/${encodeURIComponent(tag)}`;
