import { 
  type User, 
  type InsertUser, 
  type UserChallenge, 
  type InsertUserChallenge,
  type ChallengeTemplate,
  type SkillTreeNode,
  type UserSkillNode,
  type Milestone,
  type UserMilestone,
  type SmartAdvisorInteraction,
  type InsertSmartAdvisorInteraction,
  type ProtectionScore,
  users,
  userChallenges,
  challengeTemplates,
  skillTreeNodes,
  userSkillNodes,
  milestones,
  userMilestones,
  smartAdvisorInteractions,
  protectionScores
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Use HTTP fetch mode instead of WebSocket to avoid DNS issues
// This allows the MCP server to handle the connection
const connectionString = process.env.DATABASE_URL!;
const sqlClient = neon(connectionString, { 
  fetchOptions: {
    cache: 'no-store',
  }
});
const db = drizzle(sqlClient, { schema });

console.log("✅ Database connected successfully via HTTP fetch (MCP compatible)");

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Challenge operations (formerly mission operations)
  getActiveChallenges(userId: string): Promise<UserChallenge[]>;
  getCompletedChallenges(userId: string): Promise<UserChallenge[]>;
  createUserChallenge(challenge: InsertUserChallenge): Promise<UserChallenge>;
  updateChallengeProgress(challengeId: string, progress: number): Promise<UserChallenge>;
  completeChallenge(challengeId: string, engagementPointsEarned: number): Promise<UserChallenge>;
  
  // Challenge templates (formerly mission templates)
  getChallengeTemplates(category?: string): Promise<ChallengeTemplate[]>;
  getRecommendedChallenges(userId: string): Promise<ChallengeTemplate[]>;
  
  // Skill tree operations
  getSkillTreeNodes(category: string): Promise<SkillTreeNode[]>;
  getUserSkillProgress(userId: string, category: string): Promise<UserSkillNode[]>;
  unlockSkillNode(userId: string, nodeId: string): Promise<UserSkillNode>;
  
  // Milestone operations (formerly achievement operations)
  getMilestones(category?: string): Promise<Milestone[]>;
  getUserMilestones(userId: string): Promise<UserMilestone[]>;
  checkAndAwardMilestones(userId: string): Promise<Milestone[]>;
  
  // Smart Advisor operations (formerly AI Companion operations)
  getSmartAdvisorInteractions(userId: string): Promise<SmartAdvisorInteraction[]>;
  createSmartAdvisorInteraction(interaction: InsertSmartAdvisorInteraction): Promise<SmartAdvisorInteraction>;
  markInteractionAsRead(interactionId: string): Promise<void>;
  
  // ProtectionScore operations (formerly LifeScore operations)
  getProtectionScores(userId: string): Promise<ProtectionScore[]>;
  updateProtectionScore(userId: string, category: string, score: number, factors: Record<string, number>): Promise<ProtectionScore>;
  
  // XP and leveling
  addXP(userId: string, xp: number): Promise<{ leveledUp: boolean; newLevel: number; xpToNext: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData: any = {
      ...insertUser,
      focusAreas: insertUser.focusAreas ? Array.from(insertUser.focusAreas) : []
    };
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getActiveChallenges(userId: string): Promise<UserChallenge[]> {
    return await db.select()
      .from(userChallenges)
      .where(and(eq(userChallenges.userId, userId), eq(userChallenges.status, "active")))
      .orderBy(desc(userChallenges.startedAt));
  }

  async getCompletedChallenges(userId: string): Promise<UserChallenge[]> {
    return await db.select()
      .from(userChallenges)
      .where(and(eq(userChallenges.userId, userId), eq(userChallenges.status, "completed")))
      .orderBy(desc(userChallenges.completedAt));
  }

  async createUserChallenge(challenge: InsertUserChallenge): Promise<UserChallenge> {
    const result = await db.insert(userChallenges).values(challenge).returning();
    return result[0];
  }

  async updateChallengeProgress(challengeId: string, progress: number): Promise<UserChallenge> {
    const result = await db.update(userChallenges)
      .set({ progress })
      .where(eq(userChallenges.id, challengeId))
      .returning();
    return result[0];
  }

  async completeChallenge(challengeId: string, engagementPointsEarned: number): Promise<UserChallenge> {
    const result = await db.update(userChallenges)
      .set({ 
        status: "completed", 
        progress: 100, 
        completedAt: new Date(),
        engagementPointsEarned 
      })
      .where(eq(userChallenges.id, challengeId))
      .returning();
    return result[0];
  }

  async getChallengeTemplates(category?: string): Promise<ChallengeTemplate[]> {
    if (category) {
      return await db.select()
        .from(challengeTemplates)
        .where(and(eq(challengeTemplates.isActive, true), eq(challengeTemplates.insuranceCategory, category)));
    }
    return await db.select()
      .from(challengeTemplates)
      .where(eq(challengeTemplates.isActive, true));
  }

  async getRecommendedChallenges(userId: string): Promise<ChallengeTemplate[]> {
    // Get user's focus areas and completed challenges to recommend new ones
    const user = await this.getUser(userId);
    if (!user) return [];
    
    const completedChallenges = await this.getCompletedChallenges(userId);
    const completedTemplateIds = completedChallenges.map(m => m.templateId);
    
    // Build conditions array
    const conditions = [eq(challengeTemplates.isActive, true)];
    
    if (user.focusAreas && user.focusAreas.length > 0) {
      conditions.push(sql`insurance_category = ANY(${user.focusAreas})`);
    }
    
    if (completedTemplateIds.length > 0) {
      conditions.push(sql`id != ALL(${completedTemplateIds})`);
    }
    
    return await db.select()
      .from(challengeTemplates)
      .where(and(...conditions))
      .limit(5);
  }

  async getSkillTreeNodes(category: string): Promise<SkillTreeNode[]> {
    return await db.select()
      .from(skillTreeNodes)
      .where(and(eq(skillTreeNodes.category, category), eq(skillTreeNodes.isActive, true)))
      .orderBy(skillTreeNodes.createdAt);
  }

  async getUserSkillProgress(userId: string, category: string): Promise<UserSkillNode[]> {
    const results = await db.select()
      .from(userSkillNodes)
      .innerJoin(skillTreeNodes, eq(userSkillNodes.nodeId, skillTreeNodes.id))
      .where(and(eq(userSkillNodes.userId, userId), eq(skillTreeNodes.category, category)));
    
    return results.map(r => r.user_skill_nodes);
  }

  async unlockSkillNode(userId: string, nodeId: string): Promise<UserSkillNode> {
    const result = await db.insert(userSkillNodes).values({
      userId,
      nodeId,
      status: "unlocked",
      unlockedAt: new Date()
    }).returning();
    return result[0];
  }

  async getMilestones(category?: string): Promise<Milestone[]> {
    if (category) {
      return await db.select()
        .from(milestones)
        .where(and(eq(milestones.isActive, true), eq(milestones.category, category)));
    }
    return await db.select()
      .from(milestones)
      .where(eq(milestones.isActive, true));
  }

  async getUserMilestones(userId: string): Promise<UserMilestone[]> {
    return await db.select()
      .from(userMilestones)
      .where(eq(userMilestones.userId, userId))
      .orderBy(desc(userMilestones.earnedAt));
  }

  async checkAndAwardMilestones(userId: string): Promise<Milestone[]> {
    // This would implement logic to check if user qualifies for new milestones
    // For now, return empty array - would need complex logic based on user's progress
    return [];
  }

  async getSmartAdvisorInteractions(userId: string): Promise<SmartAdvisorInteraction[]> {
    return await db.select()
      .from(smartAdvisorInteractions)
      .where(eq(smartAdvisorInteractions.userId, userId))
      .orderBy(desc(smartAdvisorInteractions.createdAt))
      .limit(10);
  }

  async createSmartAdvisorInteraction(interaction: InsertSmartAdvisorInteraction): Promise<SmartAdvisorInteraction> {
    const result = await db.insert(smartAdvisorInteractions).values(interaction).returning();
    return result[0];
  }

  async markInteractionAsRead(interactionId: string): Promise<void> {
    await db.update(smartAdvisorInteractions)
      .set({ isRead: true })
      .where(eq(smartAdvisorInteractions.id, interactionId));
  }

  async getProtectionScores(userId: string): Promise<ProtectionScore[]> {
    return await db.select()
      .from(protectionScores)
      .where(eq(protectionScores.userId, userId))
      .orderBy(desc(protectionScores.calculatedAt));
  }

  async updateProtectionScore(userId: string, category: string, score: number, factors: Record<string, number>): Promise<ProtectionScore> {
    const result = await db.insert(protectionScores).values({
      userId,
      category,
      score,
      factors: {
        activePolicies: factors.activePolicies || 0,
        engagement: factors.engagement || 0,
        productDiversity: factors.productDiversity || 0
      }
    }).returning();
    return result[0];
  }

  async addXP(userId: string, xp: number): Promise<{ leveledUp: boolean; newLevel: number; xpToNext: number }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    let newXP = (user.xp || 0) + xp;
    let newLevel = user.level || 1;
    let xpToNext = user.xpToNextLevel || 100;
    let leveledUp = false;

    // Check if user should level up
    while (newXP >= xpToNext) {
      newLevel++;
      newXP -= xpToNext;
      xpToNext = Math.floor(xpToNext * 1.2); // Exponential XP requirement growth
      leveledUp = true;
    }

    await this.updateUser(userId, {
      xp: newXP,
      level: newLevel,
      xpToNextLevel: xpToNext
    });

    return { leveledUp, newLevel, xpToNext };
  }
}

// Fallback to in-memory storage for development
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private challenges: Map<string, UserChallenge>;
  private interactions: Map<string, SmartAdvisorInteraction>;

  constructor() {
    this.users = new Map();
    this.challenges = new Map();
    this.interactions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      name: insertUser.name || null,
      email: insertUser.email || null,
      id,
      avatar: null,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      streak: 0,
      lastActiveDate: null,
      focusAreas: (insertUser.focusAreas || []) as string[],
      preferences: { theme: "light", notifications: true, aiTone: "balanced" },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getActiveChallenges(userId: string): Promise<UserChallenge[]> {
    return Array.from(this.challenges.values()).filter(
      m => m.userId === userId && m.status === "active"
    );
  }

  async getCompletedChallenges(userId: string): Promise<UserChallenge[]> {
    return Array.from(this.challenges.values()).filter(
      m => m.userId === userId && m.status === "completed"
    );
  }

  async createUserChallenge(challenge: InsertUserChallenge): Promise<UserChallenge> {
    const id = randomUUID();
    const userChallenge: UserChallenge = {
      ...challenge,
      id,
      status: "active",
      progress: 0,
      startedAt: new Date(),
      completedAt: null,
      engagementPointsEarned: 0,
      userData: {},
      createdAt: new Date(),
    };
    this.challenges.set(id, userChallenge);
    return userChallenge;
  }

  async updateChallengeProgress(challengeId: string, progress: number): Promise<UserChallenge> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) throw new Error("Challenge not found");
    const updatedChallenge = { ...challenge, progress };
    this.challenges.set(challengeId, updatedChallenge);
    return updatedChallenge;
  }

  async completeChallenge(challengeId: string, engagementPointsEarned: number): Promise<UserChallenge> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) throw new Error("Challenge not found");
    const completedChallenge = { 
      ...challenge, 
      status: "completed" as const,
      progress: 100,
      completedAt: new Date(),
      engagementPointsEarned
    };
    this.challenges.set(challengeId, completedChallenge);
    return completedChallenge;
  }

  async getChallengeTemplates(category?: string): Promise<ChallengeTemplate[]> {
    // Return mock templates for development
    return [
      {
        id: "1",
        title: "Motor Insurance Basics",
        description: "Learn about your motor insurance coverage",
        insuranceCategory: "motor",
        difficulty: "beginner",
        engagementPoints: 250,
        estimatedDuration: 24,
        requirements: { steps: ["Review policy details", "Complete safety checklist"], conditions: {} },
        prerequisites: [],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: "2", 
        title: "Health Coverage Review",
        description: "Review and update your health insurance",
        insuranceCategory: "health",
        difficulty: "beginner",
        engagementPoints: 150,
        estimatedDuration: 24,
        requirements: { steps: ["Review coverage", "Update beneficiaries"], conditions: {} },
        prerequisites: [],
        isActive: true,
        createdAt: new Date()
      }
    ].filter(t => !category || t.insuranceCategory === category);
  }

  async getRecommendedChallenges(userId: string): Promise<ChallengeTemplate[]> {
    return await this.getChallengeTemplates();
  }

  async getSkillTreeNodes(category: string): Promise<SkillTreeNode[]> {
    return [
      {
        id: "1",
        title: "Safe Start",
        description: "Learn basic safe driving",
        category,
        xpCost: 100,
        prerequisites: [],
        unlocks: ["2"],
        position: { x: 0, y: 0 },
        isActive: true,
        createdAt: new Date()
      }
    ];
  }

  async getUserSkillProgress(userId: string, category: string): Promise<UserSkillNode[]> {
    return [];
  }

  async unlockSkillNode(userId: string, nodeId: string): Promise<UserSkillNode> {
    return {
      id: randomUUID(),
      userId,
      nodeId,
      status: "unlocked",
      completedAt: null,
      unlockedAt: new Date(),
      createdAt: new Date()
    };
  }

  async getMilestones(category?: string): Promise<Milestone[]> {
    return [];
  }

  async getUserMilestones(userId: string): Promise<UserMilestone[]> {
    return [];
  }

  async checkAndAwardMilestones(userId: string): Promise<Milestone[]> {
    return [];
  }

  async getSmartAdvisorInteractions(userId: string): Promise<SmartAdvisorInteraction[]> {
    return Array.from(this.interactions.values()).filter(i => i.userId === userId);
  }

  async createSmartAdvisorInteraction(interaction: InsertSmartAdvisorInteraction): Promise<SmartAdvisorInteraction> {
    const id = randomUUID();
    const smartAdvisorInteraction: SmartAdvisorInteraction = {
      ...interaction,
      id,
      context: interaction.context || {},
      isRead: false,
      createdAt: new Date()
    };
    this.interactions.set(id, smartAdvisorInteraction);
    return smartAdvisorInteraction;
  }

  async markInteractionAsRead(interactionId: string): Promise<void> {
    const interaction = this.interactions.get(interactionId);
    if (interaction) {
      this.interactions.set(interactionId, { ...interaction, isRead: true });
    }
  }

  async getProtectionScores(userId: string): Promise<ProtectionScore[]> {
    return [];
  }

  async updateProtectionScore(userId: string, category: string, score: number, factors: Record<string, number>): Promise<ProtectionScore> {
    return {
      id: randomUUID(),
      userId,
      category,
      score,
      factors: {
        activePolicies: factors.activePolicies || 0,
        engagement: factors.engagement || 0,
        productDiversity: factors.productDiversity || 0
      },
      calculatedAt: new Date()
    };
  }

  async addXP(userId: string, xp: number): Promise<{ leveledUp: boolean; newLevel: number; xpToNext: number }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    let newXP = (user.xp || 0) + xp;
    let newLevel = user.level || 1;
    let xpToNext = user.xpToNextLevel || 100;
    let leveledUp = false;

    while (newXP >= xpToNext) {
      newLevel++;
      newXP -= xpToNext;
      xpToNext = Math.floor(xpToNext * 1.2);
      leveledUp = true;
    }

    await this.updateUser(userId, {
      xp: newXP,
      level: newLevel,
      xpToNextLevel: xpToNext
    });

    return { leveledUp, newLevel, xpToNext };
  }
}

// Use MCP-compatible in-memory storage as fallback (DNS resolution issues)
// TODO: Integrate with MCP Supabase execute_sql tool for real persistence
import { MCPStorage } from "./storage-mcp";
export const storage = new MCPStorage();

console.log("✅ Using in-memory storage (MCP-compatible fallback)");
console.log("⚠️  Note: Data will be lost on server restart. To persist data, implement MCP Supabase integration.");
