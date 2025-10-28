import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with extended profile information
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email").unique(),
  avatar: text("avatar"),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  xpToNextLevel: integer("xp_to_next_level").default(100),
  streak: integer("streak").default(0),
  lastActiveDate: timestamp("last_active_date"),
  focusAreas: jsonb("focus_areas").$type<string[]>().default([]),
  preferences: jsonb("preferences").$type<{
    theme: "light" | "dark";
    notifications: boolean;
    aiTone: "strict" | "balanced" | "soft";
  }>().default({ theme: "light", notifications: true, aiTone: "balanced" }),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Mission categories and templates
export const challengeTemplates = pgTable("challenge_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  insuranceCategory: text("insurance_category").notNull(), // "motor", "health", "travel", "home", "life"
  difficulty: text("difficulty").notNull(), // "beginner", "intermediate", "advanced"
  engagementPoints: integer("engagement_points").notNull(),
  estimatedDuration: integer("estimated_duration"), // in hours
  requirements: jsonb("requirements").$type<{
    steps: string[];
    conditions: Record<string, any>;
  }>(),
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// User's active and completed missions
export const userChallenges = pgTable("user_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  templateId: varchar("template_id").notNull().references(() => challengeTemplates.id),
  status: text("status").notNull().default("active"), // "active", "completed", "abandoned"
  progress: integer("progress").default(0), // 0-100
  startedAt: timestamp("started_at").default(sql`now()`),
  completedAt: timestamp("completed_at"),
  engagementPointsEarned: integer("engagement_points_earned").default(0),
  userData: jsonb("user_data").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Skill tree nodes
export const skillTreeNodes = pgTable("skill_tree_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  xpCost: integer("xp_cost").notNull(),
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
  unlocks: jsonb("unlocks").$type<string[]>().default([]),
  position: jsonb("position").$type<{ x: number; y: number }>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// User's skill tree progress
export const userSkillNodes = pgTable("user_skill_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  nodeId: varchar("node_id").notNull().references(() => skillTreeNodes.id),
  status: text("status").notNull().default("locked"), // "locked", "available", "unlocked", "completed"
  unlockedAt: timestamp("unlocked_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Milestones and badges (formerly achievements)
export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  category: text("category").notNull(),
  engagementPoints: integer("engagement_points").default(0),
  conditions: jsonb("conditions").$type<Record<string, any>>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// User's earned milestones
export const userMilestones = pgTable("user_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  milestoneId: varchar("milestone_id").notNull().references(() => milestones.id),
  earnedAt: timestamp("earned_at").default(sql`now()`),
  engagementPointsEarned: integer("engagement_points_earned").default(0),
});

// Smart Advisor interactions and nudges (formerly ai_interactions)
export const smartAdvisorInteractions = pgTable("smart_advisor_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "nudge", "celebration", "guidance", "insight"
  message: text("message").notNull(),
  context: jsonb("context").$type<Record<string, any>>().default({}),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ProtectionScore tracking (replaces life_scores)
export const protectionScores = pgTable("protection_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: text("category").notNull(), // "motor", "health", "travel", "home", "overall"
  score: real("score").notNull(), // 0-100
  factors: jsonb("factors").$type<{ activePolicies: number; engagement: number; productDiversity: number }>().default({ activePolicies: 0, engagement: 0, productDiversity: 0 }),
  calculatedAt: timestamp("calculated_at").default(sql`now()`),
});

// Schema validation
// Schema validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  focusAreas: true,
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).pick({
  userId: true,
  templateId: true,
  userData: true,
});

export const insertSmartAdvisorInteractionSchema = createInsertSchema(smartAdvisorInteractions).pick({
  userId: true,
  type: true,
  message: true,
  context: true,
});

// Additional insert schemas
export const insertUserChallengeSchemaFull = createInsertSchema(userChallenges);
export const insertSmartAdvisorInteractionSchemaFull = createInsertSchema(smartAdvisorInteractions);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type InsertSmartAdvisorInteraction = z.infer<typeof insertSmartAdvisorInteractionSchema>;
export type User = typeof users.$inferSelect;
export type UserChallenge = typeof userChallenges.$inferSelect;
export type ChallengeTemplate = typeof challengeTemplates.$inferSelect;
export type SkillTreeNode = typeof skillTreeNodes.$inferSelect;
export type UserSkillNode = typeof userSkillNodes.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type UserMilestone = typeof userMilestones.$inferSelect;
export type SmartAdvisorInteraction = typeof smartAdvisorInteractions.$inferSelect;
export type ProtectionScore = typeof protectionScores.$inferSelect;
