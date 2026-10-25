import { pgTable, text, integer, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const adminUser = pgTable("admin_user", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ideas = pgTable(
  "ideas",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    category: text("category").notNull().default("umum"),
    description: text("description").notNull().default(""),
    explanation: text("explanation").notNull().default(""),
    month: text("month").notNull(),
    lockStatus: text("lock_status", { enum: ["open", "title_only", "hidden"] })
      .notNull()
      .default("hidden"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ideas_month_idx").on(t.month), index("ideas_lock_idx").on(t.lockStatus)],
);

export const ideaFiles = pgTable(
  "idea_files",
  {
    id: text("id").primaryKey(),
    ideaId: text("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["image", "video", "html", "model3d", "cad", "other"] }).notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    url: text("url").notNull(),
    pathname: text("pathname").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idea_files_idea_idx").on(t.ideaId)],
);

export const reviewTokens = pgTable(
  "review_tokens",
  {
    id: text("id").primaryKey(),
    ideaId: text("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    regeneratedAt: timestamp("regenerated_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("review_tokens_token_hash_idx").on(t.tokenHash)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    ideaId: text("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    comment: text("comment").notNull().default(""),
    history: text("history").notNull().default("[]"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("reviews_idea_idx").on(t.ideaId)],
);

export const ideasRelations = relations(ideas, ({ many, one }) => ({
  files: many(ideaFiles),
  reviews: one(reviews),
  tokens: many(reviewTokens),
}));

export const ideaFilesRelations = relations(ideaFiles, ({ one }) => ({
  idea: one(ideas, { fields: [ideaFiles.ideaId], references: [ideas.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  idea: one(ideas, { fields: [reviews.ideaId], references: [ideas.id] }),
}));

export type Idea = typeof ideas.$inferSelect;
export type IdeaFile = typeof ideaFiles.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type ReviewToken = typeof reviewTokens.$inferSelect;
export type FileKind = IdeaFile["kind"];
export type LockStatus = Idea["lockStatus"];
