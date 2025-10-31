import { storage } from "./storage";
import { type User, type UserChallenge, type ProtectionScore } from "@shared/schema";

export class ProtectionScoreCalculator {
  private userId: string;
  private user: User | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  async initialize(): Promise<void> {
    this.user = await storage.getUser(this.userId) || null;
    if (!this.user) {
      throw new Error("User not found");
    }
  }

  async calculateOverallProtectionScore(): Promise<ProtectionScore> {
    if (!this.user) await this.initialize();

    const categoryScores = await this.calculateCategoryScores();
    const overallScore = this.calculateWeightedAverage(categoryScores);
    
    const factors = {
      activePolicies: this.calculateActivePolicies(),
      engagement: this.calculateEngagementScore(),
      productDiversity: this.calculateProductDiversity()
    };

    const score = await storage.updateProtectionScore(
      this.userId,
      "overall",
      overallScore,
      factors
    );
    
    return score;
  }

  async calculateCategoryScore(category: string): Promise<ProtectionScore> {
    if (!this.user) await this.initialize();

    const challenges = await this.getCategoryChallenges(category);
    const score = this.calculateCategorySpecificScore(category, challenges);
    
    const factors = {
      activePolicies: 1, // Would be fetched from policy data
      engagement: this.calculateChallengeCompletionRate(challenges),
      productDiversity: this.calculateCategoryDiversity(category)
    };

    const protectionScore = await storage.updateProtectionScore(
      this.userId,
      category,
      score,
      factors
    );
    
    return protectionScore;
  }

  private async calculateCategoryScores(): Promise<Record<string, number>> {
    const categories = ["motor", "health", "travel", "home", "life"];
    const scores: Record<string, number> = {};

    for (const category of categories) {
      const challenges = await this.getCategoryChallenges(category);
      scores[category] = this.calculateCategorySpecificScore(category, challenges);
    }

    return scores;
  }

  private calculateWeightedAverage(categoryScores: Record<string, number>): number {
    const weights = {
      motor: 0.25,
      health: 0.25,
      travel: 0.15,
      home: 0.20,
      life: 0.15
    };

    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(categoryScores).forEach(([category, score]) => {
      const weight = weights[category as keyof typeof weights] || 0.20;
      weightedSum += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private calculateCategorySpecificScore(category: string, challenges: UserChallenge[]): number {
    const completedChallenges = challenges.filter(m => m.status === "completed");
    const activeChallenges = challenges.filter(m => m.status === "active");
    
    let score = 0;

    // Base score from completed challenges (0-40 points)
    const completionRate = challenges.length > 0 ? completedChallenges.length / challenges.length : 0;
    score += completionRate * 40;

    // Progress bonus for active challenges (0-20 points)
    const averageProgress = activeChallenges.length > 0 
      ? activeChallenges.reduce((sum, m) => sum + (m.progress || 0), 0) / activeChallenges.length 
      : 0;
    score += (averageProgress / 100) * 20;

    // Engagement points bonus (0-20 points)
    const totalEngagement = completedChallenges.reduce((sum, m) => sum + (m.engagementPointsEarned || 0), 0);
    const engagementScore = Math.min(totalEngagement / 1000, 1) * 20; // Normalize to 1000 points = 20 score points
    score += engagementScore;

    // Streak bonus (0-20 points)
    const streakBonus = Math.min(this.user?.streak || 0, 30) / 30 * 20;
    score += streakBonus;

    return Math.min(Math.max(score, 0), 100);
  }

  private calculateActivePolicies(): number {
    // This would query actual policy data
    // For now, return based on user's focus areas
    return this.user?.focusAreas?.length || 0;
  }

  private calculateEngagementScore(): number {
    // Based on active challenges and recent activity
    const activeChallengesCount = this.getActiveChallengesCount();
    const engagementScore = Math.min(activeChallengesCount * 25, 100); // Max at 4 active challenges
    return Math.round(engagementScore);
  }

  private calculateProductDiversity(): number {
    // Based on how many different insurance categories user is engaged with
    const focusAreas = this.user?.focusAreas || [];
    const diversityScore = focusAreas.length > 0 ? (focusAreas.length / 5) * 100 : 0; // 5 main categories
    return Math.round(diversityScore);
  }

  private async getCategoryChallenges(category: string): Promise<UserChallenge[]> {
    const allChallenges = [
      ...await storage.getActiveChallenges(this.userId),
      ...await storage.getCompletedChallenges(this.userId)
    ];

    // Filter by category (this would need to be enhanced with actual challenge template data)
    return allChallenges; // For now, return all challenges
  }

  private calculateChallengeCompletionRate(challenges: UserChallenge[]): number {
    if (challenges.length === 0) return 0;
    const completed = challenges.filter(m => m.status === "completed").length;
    return (completed / challenges.length) * 100;
  }

  private calculateCategoryStreak(category: string): number {
    // This would need to be implemented based on category-specific streak tracking
    return this.user?.streak || 0;
  }

  private calculateCategoryEngagementPoints(challenges: UserChallenge[]): number {
    return challenges
      .filter(m => m.status === "completed")
      .reduce((sum, m) => sum + (m.engagementPointsEarned || 0), 0);
  }

  private calculateRecentActivity(challenges: UserChallenge[]): number {
    const now = new Date();
    const recentChallenges = challenges.filter(m => {
      const challengeDate = m.startedAt || m.createdAt;
      if (!challengeDate) return false;
      const daysSince = (now.getTime() - challengeDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7; // Last 7 days
    });

    return recentChallenges.length * 10; // 10 points per recent challenge
  }

  private getActiveChallengesCount(): number {
    // This would need to be implemented with actual data
    return 0;
  }

  private calculateCategoryDiversity(category: string): number {
    // Calculate how diverse user's engagement is within this insurance category
    // For now, return a base score
    return 50;
  }

  async generateProtectionScoreInsights(): Promise<string[]> {
    const protectionScores = await storage.getProtectionScores(this.userId);
    const latestScore = protectionScores[0];
    
    if (!latestScore) {
      return ["Start your first challenge to begin building your Protection Score!"];
    }

    const insights: string[] = [];
    const overallScore = latestScore.score;

    if (overallScore >= 80) {
      insights.push("🌟 Outstanding! Your Protection Score shows excellent insurance engagement.");
    } else if (overallScore >= 60) {
      insights.push("💪 Great job! You're actively managing your insurance portfolio.");
    } else if (overallScore >= 40) {
      insights.push("📈 Good start! Complete more challenges to boost your Protection Score.");
    } else {
      insights.push("🚀 Ready to level up? Engage with challenges to improve your Protection Score.");
    }

    // Category-specific insights
    const categoryScores = await this.calculateCategoryScores();
    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score < 40) {
        insights.push(`Focus on ${category} insurance challenges to improve your overall protection.`);
      } else if (score > 80) {
        insights.push(`Excellent work with ${category} insurance! You're well-protected in this area.`);
      }
    });

    return insights;
  }

  async getProtectionScoreTrend(): Promise<{ trend: "up" | "down" | "stable"; change: number }> {
    const protectionScores = await storage.getProtectionScores(this.userId);
    
    if (protectionScores.length < 2) {
      return { trend: "stable", change: 0 };
    }

    const latest = protectionScores[0].score;
    const previous = protectionScores[1].score;
    const change = latest - previous;

    if (change > 5) {
      return { trend: "up", change };
    } else if (change < -5) {
      return { trend: "down", change };
    } else {
      return { trend: "stable", change };
    }
  }
}

export const protectionScoreCalculator = new ProtectionScoreCalculator("default-user-id");
