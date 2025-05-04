import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Instagram accounts table
export const instagramAccounts = pgTable("instagram_accounts", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isActive: boolean("is_active").default(true),
  profilePic: text("profile_pic"),
  sessionData: json("session_data").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInstagramAccountSchema = createInsertSchema(instagramAccounts).omit({
  id: true,
  createdAt: true,
});

// Content posts and stories
export const scheduledContent = pgTable("scheduled_content", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => instagramAccounts.id),
  type: text("type", { enum: ["post", "story"] }).notNull(),
  caption: text("caption").notNull(),
  mediaUrl: text("media_url").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status", { enum: ["scheduled", "published", "failed"] }).notNull().default("scheduled"),
  firstComment: text("first_comment"),
  location: text("location"),
  hideLikeCount: boolean("hide_like_count").default(false),
  taggedUsers: json("tagged_users").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScheduledContentSchema = createInsertSchema(scheduledContent).omit({
  id: true,
  createdAt: true,
});

// Export types
export type InstagramAccount = typeof instagramAccounts.$inferSelect;
export type InsertInstagramAccount = z.infer<typeof insertInstagramAccountSchema>;

export type ScheduledContent = typeof scheduledContent.$inferSelect;
export type InsertScheduledContent = z.infer<typeof insertScheduledContentSchema>;
