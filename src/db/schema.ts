import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import type { ChartSpec, ChatMessage, CodeSpec, MediaItem, PostKind, TextSpec } from "@/lib/types";

const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

// ---------------------------------------------------------------- auth (Better Auth)

/** A user is also the public profile. Extra columns are declared as `additionalFields` in lib/auth.ts. */
export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    /** Lowercase, unique, used in /u/[username]. */
    username: varchar("username", { length: 30 }).notNull().unique(),
    headline: varchar("headline", { length: 120 }).default("").notNull(),
    bio: varchar("bio", { length: 500 }).default("").notNull(),
    location: varchar("location", { length: 80 }).default("").notNull(),
    /** Stored as a normalized https URL. */
    website: text("website").default("").notNull(),
    tools: text("tools").array().default(sql`'{}'::text[]`).notNull(),
    banner: text("banner"),
    /** Set by staff only (never from user input). */
    verified: boolean("verified").default(false).notNull(),
  },
  (t) => [uniqueIndex("user_username_lower_idx").on(sql`lower(${t.username})`)],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// ---------------------------------------------------------------- showcase

export const posts = pgTable(
  "posts",
  {
    /** Short random id, used in /p/[id]. */
    id: varchar("id", { length: 12 }).primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: text("kind").$type<PostKind>().notNull(),
    title: varchar("title", { length: 120 }).notNull(),
    caption: varchar("caption", { length: 2000 }).default("").notNull(),
    prompt: varchar("prompt", { length: 4000 }).default("").notNull(),
    model: varchar("model", { length: 80 }).notNull(),
    tags: text("tags").array().default(sql`'{}'::text[]`).notNull(),
    aspect: text("aspect").$type<"square" | "portrait" | "landscape">().default("square").notNull(),
    media: jsonb("media").$type<MediaItem[]>().default([]).notNull(),
    /** Kind-specific payload for text, code, chat and chart posts. */
    spec: jsonb("spec")
      .$type<{ text?: TextSpec; code?: CodeSpec; chat?: ChatMessage[]; chart?: ChartSpec }>()
      .default({})
      .notNull(),
    remixOfId: varchar("remix_of_id", { length: 12 }).references((): AnyPgColumn => posts.id, { onDelete: "set null" }),
    // Denormalized counters, kept in step inside the same transaction as the write that changes them.
    likeCount: integer("like_count").default(0).notNull(),
    commentCount: integer("comment_count").default(0).notNull(),
    saveCount: integer("save_count").default(0).notNull(),
    remixCount: integer("remix_count").default(0).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    /** Hidden by staff after reports. Hidden posts never appear in any public query. */
    hidden: boolean("hidden").default(false).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("posts_author_created_idx").on(t.authorId, t.createdAt),
    index("posts_created_idx").on(t.createdAt),
    index("posts_likes_idx").on(t.likeCount),
    index("posts_remix_of_idx").on(t.remixOfId),
    index("posts_tags_idx").using("gin", t.tags),
  ],
);

export const postLikes = pgTable(
  "post_likes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    postId: varchar("post_id", { length: 12 })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.postId] }), index("post_likes_post_idx").on(t.postId)],
);

export const postSaves = pgTable(
  "post_saves",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    postId: varchar("post_id", { length: 12 })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.postId] }), index("post_saves_user_idx").on(t.userId, t.createdAt)],
);

export const follows = pgTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followingId] }), index("follows_following_idx").on(t.followingId)],
);

export const comments = pgTable(
  "comments",
  {
    id: varchar("id", { length: 12 }).primaryKey(),
    postId: varchar("post_id", { length: 12 })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    body: varchar("body", { length: 1000 }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("comments_post_idx").on(t.postId, t.createdAt)],
);

/** Linktree-style links shown on a profile. `clicks` is incremented by /go/[id]. */
export const profileLinks = pgTable(
  "profile_links",
  {
    id: varchar("id", { length: 12 }).primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 80 }).notNull(),
    url: text("url").notNull(),
    position: integer("position").notNull(),
    clicks: integer("clicks").default(0).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("profile_links_user_idx").on(t.userId, t.position)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id", { length: 12 }).primaryKey(),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    actorId: text("actor_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").$type<"like" | "follow" | "comment" | "remix">().notNull(),
    postId: varchar("post_id", { length: 12 }).references(() => posts.id, { onDelete: "cascade" }),
    /** Short preview of the comment text, for comment notifications. */
    text: varchar("text", { length: 200 }),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_recipient_idx").on(t.recipientId, t.createdAt)],
);

export const reports = pgTable(
  "reports",
  {
    id: varchar("id", { length: 12 }).primaryKey(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    postId: varchar("post_id", { length: 12 }).references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    details: varchar("details", { length: 500 }).default("").notNull(),
    status: text("status").$type<"open" | "reviewed" | "dismissed">().default("open").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("reports_reporter_post_idx").on(t.reporterId, t.postId)],
);

// ---------------------------------------------------------------- relations

export const userRelations = relations(user, ({ many }) => ({
  posts: many(posts),
  links: many(profileLinks),
}));

export const postRelations = relations(posts, ({ one }) => ({
  author: one(user, { fields: [posts.authorId], references: [user.id] }),
  remixOf: one(posts, { fields: [posts.remixOfId], references: [posts.id], relationName: "remix" }),
}));

export const commentRelations = relations(comments, ({ one }) => ({
  author: one(user, { fields: [comments.authorId], references: [user.id] }),
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  actor: one(user, { fields: [notifications.actorId], references: [user.id] }),
  post: one(posts, { fields: [notifications.postId], references: [posts.id] }),
}));

export const schema = {
  user,
  session,
  account,
  verification,
  posts,
  postLikes,
  postSaves,
  follows,
  comments,
  profileLinks,
  notifications,
  reports,
  userRelations,
  postRelations,
  commentRelations,
  notificationRelations,
};
