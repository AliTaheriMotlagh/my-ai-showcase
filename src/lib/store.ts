"use client";

import { useSyncExternalStore } from "react";
import { PALETTES } from "./palettes";
import type { FeedPost, User } from "./types";

/**
 * Client-side social state (likes, saves, follows, your posts and comments),
 * persisted to localStorage. In production these become API calls.
 */

export interface LocalComment {
  id: string;
  postId: string;
  text: string;
  createdAt: string;
}

export interface Me {
  name: string;
  username: string;
  bio: string;
  avatarSeed: number;
  palette: string[];
}

export interface State {
  liked: Record<string, true>;
  saved: Record<string, true>;
  following: Record<string, true>;
  posts: FeedPost[];
  comments: Record<string, LocalComment[]>;
  me: Me;
  welcomeDismissed: boolean;
}

const KEY = "latent:v1";

const DEFAULT: State = {
  liked: {},
  saved: {},
  following: { u1: true, u3: true, u6: true, u7: true, u15: true },
  posts: [],
  comments: {},
  me: {
    name: "You",
    username: "you",
    bio: "Exploring what AI can make. Edit your profile to make it yours.",
    avatarSeed: 7,
    palette: PALETTES[7].colors,
  },
  welcomeDismissed: false,
};

let state: State = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    state = DEFAULT;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Returns false if the change could not be persisted (e.g. storage quota exceeded). */
function set(update: (s: State) => State): boolean {
  load();
  state = update(state);
  emit();
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Selectors must return primitives or existing references (never build new objects inside). */
export function useAppStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return selector(state);
    },
    () => selector(DEFAULT),
  );
}

const toggle = (map: Record<string, true>, id: string) => {
  const next = { ...map };
  if (next[id]) delete next[id];
  else next[id] = true;
  return next;
};

export const actions = {
  toggleLike: (id: string) => set((s) => ({ ...s, liked: toggle(s.liked, id) })),
  toggleSave: (id: string) => set((s) => ({ ...s, saved: toggle(s.saved, id) })),
  toggleFollow: (id: string) => set((s) => ({ ...s, following: toggle(s.following, id) })),
  addPost: (post: FeedPost) => set((s) => ({ ...s, posts: [post, ...s.posts] })),
  deletePost: (id: string) => set((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== id) })),
  addComment: (postId: string, text: string) =>
    set((s) => ({
      ...s,
      comments: {
        ...s.comments,
        [postId]: [
          { id: `lc-${Date.now().toString(36)}`, postId, text, createdAt: new Date().toISOString() },
          ...(s.comments[postId] ?? []),
        ],
      },
    })),
  updateMe: (patch: Partial<Me>) =>
    set((s) => {
      const me = { ...s.me, ...patch };
      // keep the author info on your own posts in sync
      const posts = s.posts.map((p) => ({ ...p, author: meAsUser(me) }));
      return { ...s, me, posts };
    }),
  dismissWelcome: () => set((s) => ({ ...s, welcomeDismissed: true })),
};

export function meAsUser(me: Me): User {
  return {
    id: "me",
    username: me.username,
    name: me.name,
    headline: "Creator on Latent",
    bio: me.bio,
    avatarSeed: me.avatarSeed,
    palette: me.palette,
    verified: false,
    followers: 0,
    following: 0,
    tools: [],
    joinedAt: "2026-01-01T00:00:00.000Z",
  };
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true afterwards. Use to avoid flashing default local state. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
