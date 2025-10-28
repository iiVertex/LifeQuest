import { storage } from "./storage";
import { type User, type UserMission, type AIInteraction } from "@shared/schema";
import { 
  generateCompanionMessage, 
  generateStreakReminder, 
  generateLevelUpMessage,
  type AIMessageType 
} from "./ai/companion";

export class AICompanion {
  private userId: string;
  private user: User | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  async initialize(): Promise<void> {
    const user = await storage.getUser(this.userId);
    if (!user) {
      throw new Error("User not found");
    }
    this.user = user;
  }

  async generateContextualNudge(): Promise<AIInteraction> {
    if (!this.user) await this.initialize();

    const activeMissions = await storage.getActiveMissions(this.userId);
    const recentMissions = await storage.getCompletedMissions(this.userId);
    
    // Use AI to generate personalized nudge
    const message = await generateCompanionMessage('nudge', {
      user: this.user!,
      recentMissions: recentMissions.slice(0, 5),
    });
    
    return await storage.createAIInteraction({
      userId: this.userId,
      type: "nudge",
      message,
      context: { activeMissionsCount: activeMissions.length } as any
    });
  }

  async generateCelebration(achievement: string): Promise<AIInteraction> {
    if (!this.user) await this.initialize();

    // Use AI to generate personalized celebration
    const message = await generateCompanionMessage('celebration', {
      user: this.user!,
    });
    
    return await storage.createAIInteraction({
      userId: this.userId,
      type: "celebration",
      message: `${message} (${achievement})`,
      context: { achievement } as any
    });
  }

  async generateGuidance(missionTitle: string, step: string): Promise<AIInteraction> {
    if (!this.user) await this.initialize();

    // Use AI to generate mission guidance
    const message = await generateCompanionMessage('guidance', {
      user: this.user!,
    });

    return await storage.createAIInteraction({
      userId: this.userId,
      type: "guidance",
      message,
      context: { missionTitle, step } as any
    });
  }

  async generateInsight(data: any): Promise<AIInteraction> {
    if (!this.user) await this.initialize();

    const recentMissions = await storage.getCompletedMissions(this.userId);

    // Use AI to generate data-driven insight
    const message = await generateCompanionMessage('insight', {
      user: this.user!,
      recentMissions: recentMissions.slice(0, 10),
    });
    
    return await storage.createAIInteraction({
      userId: this.userId,
      type: "insight",
      message,
      context: { data }
    });
  }

  async generateStreakMessage(daysUntilBreak: number): Promise<string> {
    if (!this.user) await this.initialize();
    return await generateStreakReminder(this.user!, daysUntilBreak);
  }

  async generateLevelUpCelebration(newLevel: number): Promise<string> {
    if (!this.user) await this.initialize();
    return await generateLevelUpMessage(this.user!, newLevel);
  }

  private async analyzeUserState() {
    if (!this.user) return null;

    const activeMissions = await storage.getActiveMissions(this.userId);
    const completedMissions = await storage.getCompletedMissions(this.userId);
    const lifeScores = await storage.getLifeScores(this.userId);

    return {
      level: this.user.level,
      xp: this.user.xp,
      streak: this.user.streak,
      activeMissionsCount: activeMissions.length,
      completedMissionsCount: completedMissions.length,
      focusAreas: this.user.focusAreas,
      recentActivity: this.user.lastActiveDate,
      lifeScores: lifeScores.slice(0, 3) // Last 3 scores
    };
  }

  private generateNudgeMessage(analysis: any, activeMissions: UserMission[], recentInteractions: AIInteraction[]) {
    const now = new Date();
    const lastActive = analysis?.recentActivity ? new Date(analysis.recentActivity) : null;
    const hoursSinceLastActive = lastActive ? (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60) : 24;

    // Check if user needs motivation
    if (hoursSinceLastActive > 24) {
      return {
        message: "🌅 Good morning! Ready to tackle today's missions? Your goals are waiting for you.",
        context: { type: "motivation", hoursSinceLastActive }
      };
    }

    // Check for mission progress
    if (activeMissions.length > 0) {
      const mission = activeMissions[0];
      const progress = mission.progress || 0;
      if (progress < 25) {
        return {
          message: `🚀 Let's get started on your mission! Every journey begins with a single step.`,
          context: { type: "mission_start", missionId: mission.id }
        };
      } else if (progress > 75) {
        return {
          message: `🏁 You're almost there! Your mission is ${progress}% complete. Keep going!`,
          context: { type: "mission_almost_done", missionId: mission.id }
        };
      }
    }

    // Check for streak maintenance
    if (analysis?.streak > 0 && analysis.streak % 7 === 0) {
      return {
        message: `🔥 Amazing! You've maintained a ${analysis.streak}-day streak! Consistency is your superpower.`,
        context: { type: "streak_celebration", streak: analysis.streak }
      };
    }

    // Default motivational message
    const motivationalMessages = [
      "💪 You're doing great! Every small step counts towards your bigger goals.",
      "🌟 Your dedication is inspiring. Keep pushing forward!",
      "🎯 Focus on progress, not perfection. You're on the right track!",
      "✨ Every day is a new opportunity to improve. You've got this!",
      "🚀 Your future self will thank you for the effort you're putting in today."
    ];

    return {
      message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
      context: { type: "general_motivation" }
    };
  }

  async getPersonalizedRecommendations(): Promise<string[]> {
    if (!this.user) await this.initialize();

    const analysis = await this.analyzeUserState();
    const recommendations: string[] = [];

    // Based on focus areas
    const focusAreas = this.user?.focusAreas || [];
    if (focusAreas.includes("driving")) {
      recommendations.push("Try the 'Eco-Friendly Driving' challenge to reduce your carbon footprint");
    }
    
    if (focusAreas.includes("health")) {
      recommendations.push("Consider the 'Hydration Hero' mission to improve your daily water intake");
    }
    
    if (focusAreas.includes("financial")) {
      recommendations.push("Start the 'Smart Spending' mission to track and optimize your expenses");
    }

    // Based on current level
    const level = analysis?.level || 1;
    if (level < 3) {
      recommendations.push("Complete beginner missions to build your foundation");
    } else if (level > 5) {
      recommendations.push("Ready for advanced challenges? Try the 'Master Level' missions");
    }

    // Based on activity patterns
    if (analysis?.activeMissionsCount === 0) {
      recommendations.push("Start a new mission to keep your momentum going");
    }

    return recommendations;
  }
}

export const aiCompanion = new AICompanion("default-user-id");
