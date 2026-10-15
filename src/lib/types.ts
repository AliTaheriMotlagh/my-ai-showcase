// Shared DTOs. These are what the server sends to the browser, so they never contain
// private fields such as email addresses or session data.

export type PostKind = "image" | "gallery" | "video" | "audio" | "text" | "code" | "chat" | "chart" | "3d";

export type Aspect = "square" | "portrait" | "landscape";

export type MediaType = "image" | "video" | "audio" | "model";

/** A file uploaded to our blob store. Dimensions and duration are measured in the browser on upload. */
export interface MediaItem {
  url: string;
  type: MediaType;
  mime: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}

export interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

export interface ChartSpec {
  type: "bar" | "line" | "donut";
  labels: string[];
  values: number[];
  unit?: string;
}

export interface CodeSpec {
  language: string;
  filename: string;
  source: string;
}

export interface TextSpec {
  form: string;
  body: string;
}

export interface PostStats {
  likes: number;
  comments: number;
  views: number;
  saves: number;
  remixes: number;
}

/** Public author details. Never includes email. */
export interface UserSummary {
  id: string;
  username: string;
  name: string;
  headline: string;
  avatar: string | null;
  verified: boolean;
}

export interface UserProfile extends UserSummary {
  bio: string;
  location: string;
  website: string;
  tools: string[];
  banner: string | null;
  followers: number;
  following: number;
  posts: number;
  likes: number;
  joinedAt: string;
}

/** Per-viewer state. All false for logged-out visitors. */
export interface ViewerFlags {
  liked: boolean;
  saved: boolean;
  /** Whether the viewer follows the post's author. */
  following: boolean;
  /** Whether the viewer wrote the post. */
  owner: boolean;
}

export interface Post {
  id: string;
  kind: PostKind;
  title: string;
  caption: string;
  prompt: string;
  model: string;
  tags: string[];
  createdAt: string;
  aspect: Aspect;
  media: MediaItem[];
  stats: PostStats;
  text?: TextSpec;
  code?: CodeSpec;
  chat?: ChatMessage[];
  chart?: ChartSpec;
  remixOf: { id: string; title: string; username: string } | null;
}

export interface FeedPost extends Post {
  author: UserSummary;
  viewer: ViewerFlags;
}

export interface FeedPage {
  items: FeedPost[];
  nextCursor: number | null;
}

export interface Comment {
  id: string;
  author: UserSummary;
  text: string;
  createdAt: string;
  canDelete: boolean;
}

export interface ProfileLink {
  id: string;
  title: string;
  url: string;
  clicks: number;
}

export interface AppNotification {
  id: string;
  type: "like" | "follow" | "comment" | "remix";
  group: "today" | "week" | "earlier";
  createdAt: string;
  read: boolean;
  actor: UserSummary;
  post: { id: string; title: string; thumb: string | null } | null;
  text: string | null;
}

export type FeedKind = "foryou" | "following" | "explore" | "latest" | "user" | "tag" | "saved" | "liked";
