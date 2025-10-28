/**
 * MCP-based Storage Implementation
 * This bypasses direct database connections and uses MCP Supabase tools instead
 * to avoid DNS resolution issues on the host machine.
 */

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
} from "@shared/schema";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";

// Helper function to execute SQL via MCP (you'll need to implement the actual MCP call)
async function executeSQL(query: string, params: any[] = []): Promise<any[]> {
  // This is a placeholder - in production, this would call the MCP Supabase tool
  // For now, we'll use a simple in-memory store
  console.warn("⚠️  Using in-memory storage - MCP SQL execution not yet implemented");
  return [];
}

export class MCPStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private userChallenges: Map<string, UserChallenge> = new Map();
  private challengeTemplates: Map<string, ChallengeTemplate> = new Map();
  private skillTreeNodes: Map<string, SkillTreeNode> = new Map();
  private userSkillNodes: Map<string, UserSkillNode> = new Map();
  private milestones: Map<string, Milestone> = new Map();
  private userMilestones: Map<string, UserMilestone> = new Map();
  private smartAdvisorInteractions: Map<string, SmartAdvisorInteraction> = new Map();
  private protectionScores: Map<string, ProtectionScore> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name || null,
      email: insertUser.email || null,
      avatar: null,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      streak: 0,
      lastActiveDate: null,
      focusAreas: (insertUser.focusAreas ? Array.from(insertUser.focusAreas) : []) as string[],
      preferences: { theme: "light", notifications: true, aiTone: "balanced" },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async getActiveChallenges(userId: string): Promise<UserChallenge[]> {
    return Array.from(this.userChallenges.values())
      .filter(c => c.userId === userId && c.status === "active")
      .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0));
  }

  async getCompletedChallenges(userId: string): Promise<UserChallenge[]> {
    return Array.from(this.userChallenges.values())
      .filter(c => c.userId === userId && c.status === "completed")
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
  }

  async createUserChallenge(challenge: InsertUserChallenge): Promise<UserChallenge> {
    const id = randomUUID();
    const userChallenge: UserChallenge = {
      id,
      userId: challenge.userId,
      templateId: challenge.templateId,
      status: "active",
      progress: 0,
      startedAt: new Date(),
      completedAt: null,
      engagementPointsEarned: 0,
      userData: challenge.userData || {},
      createdAt: new Date(),
    };
    this.userChallenges.set(id, userChallenge);
    return userChallenge;
  }

  async updateChallengeProgress(challengeId: string, progress: number): Promise<UserChallenge> {
    const challenge = this.userChallenges.get(challengeId);
    if (!challenge) throw new Error("Challenge not found");
    challenge.progress = progress;
    return challenge;
  }

  async completeChallenge(challengeId: string, engagementPointsEarned: number): Promise<UserChallenge> {
    const challenge = this.userChallenges.get(challengeId);
    if (!challenge) throw new Error("Challenge not found");
    challenge.status = "completed";
    challenge.progress = 100;
    challenge.completedAt = new Date();
    challenge.engagementPointsEarned = engagementPointsEarned;
    return challenge;
  }

  async getChallengeTemplates(category?: string): Promise<ChallengeTemplate[]> {
    const templates = Array.from(this.challengeTemplates.values()).filter(t => t.isActive);
    if (category) {
      return templates.filter(t => t.insuranceCategory === category);
    }
    return templates;
  }

  async getRecommendedChallenges(userId: string): Promise<ChallengeTemplate[]> {
    return Array.from(this.challengeTemplates.values()).filter(t => t.isActive).slice(0, 5);
  }

  async getSkillTreeNodes(category: string): Promise<SkillTreeNode[]> {
    return Array.from(this.skillTreeNodes.values())
      .filter(n => n.category === category && n.isActive)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async getUserSkillProgress(userId: string, category: string): Promise<UserSkillNode[]> {
    return Array.from(this.userSkillNodes.values()).filter(n => n.userId === userId);
  }

  async unlockSkillNode(userId: string, nodeId: string): Promise<UserSkillNode> {
    const id = randomUUID();
    const node: UserSkillNode = {
      id,
      userId,
      nodeId,
      status: "unlocked",
      unlockedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
    };
    this.userSkillNodes.set(id, node);
    return node;
  }

  async getMilestones(category?: string): Promise<Milestone[]> {
    const milestones = Array.from(this.milestones.values()).filter(m => m.isActive);
    if (category) {
      return milestones.filter(m => m.category === category);
    }
    return milestones;
  }

  async getUserMilestones(userId: string): Promise<UserMilestone[]> {
    return Array.from(this.userMilestones.values()).filter(m => m.userId === userId);
  }

  async checkAndAwardMilestones(userId: string): Promise<Milestone[]> {
    return [];
  }

  async getSmartAdvisorInteractions(userId: string): Promise<SmartAdvisorInteraction[]> {
    return Array.from(this.smartAdvisorInteractions.values())
      .filter(i => i.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createSmartAdvisorInteraction(interaction: InsertSmartAdvisorInteraction): Promise<SmartAdvisorInteraction> {
    const id = randomUUID();
    const newInteraction: SmartAdvisorInteraction = {
      id,
      userId: interaction.userId,
      type: interaction.type,
      message: interaction.message,
      context: interaction.context || {},
      isRead: false,
      createdAt: new Date(),
    };
    this.smartAdvisorInteractions.set(id, newInteraction);
    return newInteraction;
  }

  async markInteractionAsRead(interactionId: string): Promise<void> {
    const interaction = this.smartAdvisorInteractions.get(interactionId);
    if (interaction) {
      interaction.isRead = true;
    }
  }

  async getProtectionScores(userId: string): Promise<ProtectionScore[]> {
    return Array.from(this.protectionScores.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => (b.calculatedAt?.getTime() || 0) - (a.calculatedAt?.getTime() || 0));
  }

  async updateProtectionScore(userId: string, category: string, score: number, factors: Record<string, number>): Promise<ProtectionScore> {
    const id = randomUUID();
    const protectionScore: ProtectionScore = {
      id,
      userId,
      category,
      score,
      factors: {
        activePolicies: factors.activePolicies || 0,
        engagement: factors.engagement || 0,
        productDiversity: factors.productDiversity || 0,
      },
      calculatedAt: new Date(),
    };
    this.protectionScores.set(id, protectionScore);
    return protectionScore;
  }

  async addXP(userId: string, xp: number): Promise<{ leveledUp: boolean; newLevel: number; xpToNext: number }> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    // Ensure values are not null
    const currentXP = user.xp ?? 0;
    const currentLevel = user.level ?? 1;
    const currentXPToNext = user.xpToNextLevel ?? 100;
    
    user.xp = currentXP + xp;
    user.level = currentLevel;
    user.xpToNextLevel = currentXPToNext;
    
    let leveledUp = false;
    
    while (user.xp >= user.xpToNextLevel) {
      user.xp -= user.xpToNextLevel;
      user.level++;
      user.xpToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
      leveledUp = true;
    }
    
    return {
      leveledUp,
      newLevel: user.level,
      xpToNext: user.xpToNextLevel - user.xp,
    };
  }
}
