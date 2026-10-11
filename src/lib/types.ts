export type PostKind = "image" | "gallery" | "video" | "audio" | "text" | "code" | "chat" | "chart" | "3d";

export type ArtStyle = "mesh" | "orbit" | "bauhaus" | "waves" | "flow" | "bloom" | "planet" | "dunes";

export type Aspect = "square" | "portrait" | "landscape";

/** A visual is either a generated artwork (seed + style + palette) or an uploaded image (`src`). */
export interface Visual {
  seed: number;
  style: ArtStyle;
  palette: string[];
  src?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  headline: string;
  bio: string;
  avatarSeed: number;
  palette: string[];
  verified: boolean;
  followers: number;
  following: number;
  location?: string;
  website?: string;
  tools: string[];
  joinedAt: string;
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

export interface PostStats {
  likes: number;
  comments: number;
  views: number;
  saves: number;
  remixes: number;
}

export interface Post {
  id: string;
  authorId: string;
  kind: PostKind;
  title: string;
  caption: string;
  prompt: string;
  model: string;
  tags: string[];
  createdAt: string;
  aspect: Aspect;
  visuals: Visual[];
  stats: PostStats;
  text?: { form: string; body: string };
  code?: CodeSpec;
  chat?: ChatMessage[];
  chart?: ChartSpec;
  audio?: { duration: number; bpm: number; key: string; genre: string };
  video?: { duration: number };
  object3d?: { shape: "sphere" | "cube" | "atom" };
  remixOf?: { id: string; title: string; username: string };
}

export interface FeedPost extends Post {
  author: User;
}

export interface FeedPage {
  items: FeedPost[];
  nextCursor: number | null;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  createdAt: string;
  likes: number;
}

export type FeedKind = "foryou" | "following" | "explore" | "latest" | "user" | "tag" | "ids";
