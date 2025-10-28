import { storage } from "./storage";
import { type User, type ChallengeTemplate, type UserChallenge } from "@shared/schema";
// AI recommendations import - file to be created
// import { getAIRecommendedChallenges } from "./ai/recommendations";

export class ChallengeGenerator {
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

  async generatePersonalizedChallenges(): Promise<ChallengeTemplate[]> {
    if (!this.user) await this.initialize();

    // Try AI-powered recommendations first (when implemented)
    // try {
    //   const aiRecommendations = await getAIRecommendedChallenges(storage, this.userId, 5);
    //   if (aiRecommendations.length > 0) {
    //     return aiRecommendations;
    //   }
    // } catch (error) {
    //   console.warn('AI recommendations failed, falling back to rule-based:', error);
    // }

    // Fallback to rule-based recommendations
    const userProfile = await this.analyzeUserProfile();
    const availableTemplates = await storage.getChallengeTemplates();
    
    // Filter and rank challenges based on user profile
    const personalizedChallenges = this.rankChallenges(availableTemplates, userProfile);
    
    return personalizedChallenges.slice(0, 5); // Return top 5 recommendations
  }

  async createChallengeFromTemplate(templateId: string): Promise<UserChallenge> {
    const template = await this.getChallengeTemplate(templateId);
    if (!template) {
      throw new Error("Challenge template not found");
    }

    // Customize challenge based on user's level and preferences
    const customizedChallenge = this.customizeChallenge(template);
    
    return await storage.createUserChallenge({
      userId: this.userId,
      templateId,
      userData: customizedChallenge
    });
  }

  async suggestNextChallenge(): Promise<ChallengeTemplate | null> {
    if (!this.user) await this.initialize();

    const activeChallenges = await storage.getActiveChallenges(this.userId);
    const completedChallenges = await storage.getCompletedChallenges(this.userId);
    
    // Don't suggest if user has too many active challenges
    if (activeChallenges.length >= 3) {
      return null;
    }

    const userProfile = await this.analyzeUserProfile();
    const availableTemplates = await storage.getChallengeTemplates();
    
    // Filter out completed challenges
    const completedTemplateIds = completedChallenges.map(m => m.templateId);
    const availableTemplatesFiltered = availableTemplates.filter(
      t => !completedTemplateIds.includes(t.id)
    );

    const rankedChallenges = this.rankChallenges(availableTemplatesFiltered, userProfile);
    return rankedChallenges[0] || null;
  }

  private async analyzeUserProfile() {
    if (!this.user) return null;

    const activeChallenges = await storage.getActiveChallenges(this.userId);
    const completedChallenges = await storage.getCompletedChallenges(this.userId);
    const protectionScores = await storage.getProtectionScores(this.userId);

    // Calculate user's strengths and weaknesses
    const categoryPerformance = this.calculateCategoryPerformance(completedChallenges);
    const difficultyPreference = this.calculateDifficultyPreference(completedChallenges);
    const activityLevel = this.calculateActivityLevel(activeChallenges, completedChallenges);

    return {
      level: this.user.level,
      xp: this.user.xp,
      focusAreas: this.user.focusAreas,
      categoryPerformance,
      difficultyPreference,
      activityLevel,
      activeChallengesCount: activeChallenges.length,
      completedChallengesCount: completedChallenges.length,
      protectionScores: protectionScores.slice(0, 5),
      preferences: this.user.preferences
    };
  }

  private calculateCategoryPerformance(completedChallenges: UserChallenge[]) {
    const performance: Record<string, number> = {};
    
    completedChallenges.forEach(challenge => {
      // This would need to be enhanced with actual challenge template data
      const category = "general"; // Would come from challenge template
      if (!performance[category]) {
        performance[category] = 0;
      }
      performance[category] += challenge.engagementPointsEarned || 0;
    });

    return performance;
  }

  private calculateDifficultyPreference(completedChallenges: UserChallenge[]) {
    // Analyze which difficulty levels user completes most successfully
    const difficultyStats: Record<string, number> = {};
    
    completedChallenges.forEach(challenge => {
      const difficulty = "beginner"; // Would come from challenge template
      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = 0;
      }
      difficultyStats[difficulty]++;
    });

    // Return preferred difficulty based on completion rate
    const sortedDifficulties = Object.entries(difficultyStats)
      .sort(([,a], [,b]) => b - a);
    
    return sortedDifficulties[0]?.[0] || "beginner";
  }

  private calculateActivityLevel(activeChallenges: UserChallenge[], completedChallenges: UserChallenge[]) {
    const totalChallenges = activeChallenges.length + completedChallenges.length;
    const completionRate = completedChallenges.length / Math.max(totalChallenges, 1);
    
    if (completionRate > 0.8 && totalChallenges > 5) {
      return "high";
    } else if (completionRate > 0.5 && totalChallenges > 2) {
      return "medium";
    } else {
      return "low";
    }
  }

  private rankChallenges(templates: ChallengeTemplate[], userProfile: any): ChallengeTemplate[] {
    return templates
      .map(template => ({
        template,
        score: this.calculateChallengeScore(template, userProfile)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.template);
  }

  private calculateChallengeScore(template: ChallengeTemplate, userProfile: any): number {
    let score = 0;

    // Base score from engagement points reward
    score += template.engagementPoints * 0.1;

    // Bonus for user's focus areas (insurance categories)
    if (userProfile.focusAreas.includes(template.insuranceCategory)) {
      score += 50;
    }

    // Difficulty matching
    if (template.difficulty === userProfile.difficultyPreference) {
      score += 30;
    } else if (template.difficulty === "beginner" && userProfile.activityLevel === "low") {
      score += 20;
    }

    // Activity level matching
    if (userProfile.activityLevel === "high" && template.difficulty === "advanced") {
      score += 25;
    } else if (userProfile.activityLevel === "low" && template.difficulty === "beginner") {
      score += 25;
    }

    // Duration preference (shorter challenges for busy users)
    if (template.estimatedDuration && template.estimatedDuration <= 24) {
      score += 15;
    }

    // Level appropriateness
    const levelThreshold = template.difficulty === "beginner" ? 1 : 
                          template.difficulty === "intermediate" ? 3 : 5;
    if (userProfile.level >= levelThreshold) {
      score += 20;
    }

    return score;
  }

  private async getChallengeTemplate(templateId: string): Promise<ChallengeTemplate | null> {
    const templates = await storage.getChallengeTemplates();
    return templates.find(t => t.id === templateId) || null;
  }

  private customizeChallenge(template: ChallengeTemplate) {
    const customizations: Record<string, any> = {};

    // Customize based on user level
    const userLevel = this.user?.level || 1;
    if (userLevel > 3) {
      customizations.difficultyMultiplier = 1.2;
    }

    // Customize based on user preferences
    if (this.user?.preferences?.aiTone === "strict") {
      customizations.strictMode = true;
    }

    // Add personalized goals
    customizations.personalizedGoals = this.generatePersonalizedGoals(template);

    return customizations;
  }

  private generatePersonalizedGoals(template: ChallengeTemplate): string[] {
    const goals: string[] = [];

    switch (template.insuranceCategory) {
      case "motor":
        goals.push("Review your current motor policy coverage");
        goals.push("Complete vehicle safety checklist");
        goals.push("Update your beneficiary information");
        break;
      case "health":
        goals.push("Review your health policy coverage");
        goals.push("Schedule annual health check-up");
        goals.push("Update medical history information");
        break;
      case "travel":
        goals.push("Review travel insurance options");
        goals.push("Check coverage limits");
        goals.push("Understand claim procedures");
        break;
      case "home":
        goals.push("Review home insurance coverage");
        goals.push("Update property value assessment");
        goals.push("Check for coverage gaps");
        break;
      case "life":
        goals.push("Review life insurance policy");
        goals.push("Update beneficiaries");
        goals.push("Ensure adequate coverage");
        break;
    }

    return goals;
  }

  async generateChallengeVariants(baseTemplate: ChallengeTemplate): Promise<ChallengeTemplate[]> {
    // Generate variations of a base challenge for different user types
    const variants: ChallengeTemplate[] = [];

    // Beginner variant
    variants.push({
      ...baseTemplate,
      id: `${baseTemplate.id}-beginner`,
      title: `${baseTemplate.title} (Beginner)`,
      difficulty: "beginner",
      engagementPoints: Math.floor(baseTemplate.engagementPoints * 0.7),
      estimatedDuration: baseTemplate.estimatedDuration ? Math.floor(baseTemplate.estimatedDuration * 1.5) : null
    });

    // Advanced variant
    variants.push({
      ...baseTemplate,
      id: `${baseTemplate.id}-advanced`,
      title: `${baseTemplate.title} (Advanced)`,
      difficulty: "advanced",
      engagementPoints: Math.floor(baseTemplate.engagementPoints * 1.5),
      estimatedDuration: baseTemplate.estimatedDuration ? Math.floor(baseTemplate.estimatedDuration * 0.7) : null
    });

    return variants;
  }
}

export const challengeGenerator = new ChallengeGenerator("default-user-id");
