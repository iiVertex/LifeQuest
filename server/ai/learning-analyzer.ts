/**
 * AI Learning Analyzer
 * Uses DeepSeek AI to analyze user behavior and generate adaptive recommendations
 */

import { generateAIResponse, isAIAvailable } from './client';
import { BehaviorTracker } from '../services/behavior-tracker';
import type { UserBehaviorAnalytics } from '@shared/schema';

export interface AdaptiveLearningInsights {
  recommendedDifficulty: string;
  recommendedCategories: string[];
  recommendedTone: 'strict' | 'balanced' | 'friendly';
  engagementPattern: 'highly-engaged' | 'moderate' | 'declining' | 'new';
  notes: string;
  confidence: number; // 0-100
}

export class LearningAnalyzer {
  /**
   * Analyze user behavior and generate adaptive insights using AI
   */
  static async analyzeUserBehavior(userId: string): Promise<AdaptiveLearningInsights | null> {
    if (!isAIAvailable()) {
      console.log('AI not available, using fallback analysis');
      return this.fallbackAnalysis(userId);
    }

    const summary = await BehaviorTracker.getBehaviorSummary(userId);
    
    if (!summary.analytics) {
      console.log('No analytics data available for user:', userId);
      return null;
    }

    const systemPrompt = this.buildAnalysisPrompt(summary.analytics, summary.challengeStats, summary.recentSessions);
    
    try {
      const response = await generateAIResponse(
        systemPrompt,
        'Based on this user\'s behavior data, provide adaptive learning recommendations in JSON format.'
      );

      if (!response) {
        console.warn(`No AI response for user ${userId}, using fallback`);
        return this.fallbackAnalysis(userId);
      }

      const insights = this.parseAIResponse(response);
      
      // Update user's AI insights in database
      await BehaviorTracker.updateAIInsights(userId, {
        recommendedDifficulty: insights.recommendedDifficulty,
        recommendedCategories: insights.recommendedCategories,
        recommendedTone: insights.recommendedTone,
        engagementPattern: insights.engagementPattern,
        notes: insights.notes,
      });

      return insights;
    } catch (error) {
      console.error('AI analysis failed, using fallback:', error);
      return this.fallbackAnalysis(userId);
    }
  }

  /**
   * Build comprehensive analysis prompt for AI
   */
  private static buildAnalysisPrompt(
    analytics: UserBehaviorAnalytics,
    challengeStats: any,
    recentSessions: any[]
  ): string {
    const prefs = analytics.challengePreferences || {
      preferredCategories: {},
      preferredDifficulties: {},
      preferredTypes: {},
    };
    
    // Calculate engagement metrics
    const avgSessionDuration = analytics.averageSessionDuration || 0;
    const recentSessionCount = recentSessions.length;
    const lastSessionDate = (analytics as any).last_session_date || analytics.lastSessionDate;
    const daysSinceLastSession = lastSessionDate
      ? Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const totalChallengesAccepted = (analytics as any).total_challenges_accepted || analytics.totalChallengesAccepted || 0;
    const totalChallengesCompleted = (analytics as any).total_challenges_completed || analytics.totalChallengesCompleted || 0;
    const totalChallengesAbandoned = (analytics as any).total_challenges_abandoned || analytics.totalChallengesAbandoned || 0;
    const completionRate = (analytics as any).completion_rate || analytics.completionRate || 0;
    const averageCompletionTime = (analytics as any).average_completion_time || analytics.averageCompletionTime || 0;
    const totalSessions = (analytics as any).total_sessions || analytics.totalSessions || 0;
    const totalTimeSpent = (analytics as any).total_time_spent || analytics.totalTimeSpent || 0;
    const protectionScoreHistory = (analytics as any).protection_score_history || analytics.protectionScoreHistory || [];
    const averageScoreChange = (analytics as any).average_score_change || analytics.averageScoreChange || 0;
    const totalRewardsRedeemed = (analytics as any).total_rewards_redeemed || analytics.totalRewardsRedeemed || 0;
    const rewardRedemptionFrequency = (analytics as any).reward_redemption_frequency || analytics.rewardRedemptionFrequency || 0;

    return `You are an expert data analyst for QIC LifeQuest, analyzing user behavior patterns to provide adaptive learning recommendations.

USER BEHAVIOR DATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHALLENGE INTERACTION PATTERNS:
• Total Accepted: ${totalChallengesAccepted}
• Total Completed: ${totalChallengesCompleted}
• Total Abandoned: ${totalChallengesAbandoned}
• Completion Rate: ${completionRate.toFixed(1)}%
• Average Completion Time: ${averageCompletionTime.toFixed(1)} hours

CATEGORY PREFERENCES (times selected):
${Object.entries(prefs.preferredCategories)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, count]) => `  • ${cat}: ${count}`)
  .join('\n') || '  No data yet'}

DIFFICULTY PREFERENCES (times selected):
${Object.entries(prefs.preferredDifficulties)
  .sort((a, b) => b[1] - a[1])
  .map(([diff, count]) => `  • ${diff}: ${count}`)
  .join('\n') || '  No data yet'}

SESSION DATA:
• Total Sessions: ${totalSessions}
• Total Time Spent: ${totalTimeSpent} minutes (${(totalTimeSpent / 60).toFixed(1)} hours)
• Average Session Duration: ${avgSessionDuration.toFixed(1)} minutes
• Recent Sessions (last 10): ${recentSessionCount}
• Days Since Last Session: ${daysSinceLastSession}

PROTECTION SCORE PROGRESSION:
• Score History Entries: ${protectionScoreHistory.length}
• Average Score Change: ${averageScoreChange.toFixed(1)} points/week
• Recent Scores: ${protectionScoreHistory.slice(-5).map((h: any) => h.score).join(', ') || 'No data'}

REWARD BEHAVIOR:
• Total Rewards Redeemed: ${totalRewardsRedeemed}
• Redemption Frequency: ${rewardRedemptionFrequency.toFixed(2)} times/month

ACTIVE CHALLENGES:
• Active: ${challengeStats.active}
• Completed: ${challengeStats.completed}
• Abandoned: ${challengeStats.abandoned}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK: Analyze this data and provide adaptive recommendations.

Consider:
1. **Difficulty Level**: Based on completion rate and time, should we increase/decrease difficulty?
2. **Category Focus**: Which insurance categories should we prioritize based on preferences and gaps?
3. **Advisor Tone**: Based on engagement pattern, what tone would work best?
   - "strict": For highly disciplined users who respond to direct challenges
   - "balanced": For steady users who need mix of encouragement and direction
   - "friendly": For users who need more motivation and positive reinforcement
4. **Engagement Pattern**: Is user highly-engaged, moderate, declining, or new?
5. **Actionable Insights**: What specific changes would improve their experience?

RESPOND WITH ONLY THIS JSON (no markdown, no code blocks):
{
  "recommendedDifficulty": "Easy" | "Medium" | "Hard",
  "recommendedCategories": ["category1", "category2", "category3"],
  "recommendedTone": "strict" | "balanced" | "friendly",
  "engagementPattern": "highly-engaged" | "moderate" | "declining" | "new",
  "notes": "2-3 sentence explanation of key insights and recommendations",
  "confidence": 0-100
}`;
  }

  /**
   * Parse AI response into structured insights
   */
  private static parseAIResponse(response: string): AdaptiveLearningInsights {
    try {
      // Remove markdown code blocks if present
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      return {
        recommendedDifficulty: parsed.recommendedDifficulty || 'Medium',
        recommendedCategories: parsed.recommendedCategories || [],
        recommendedTone: parsed.recommendedTone || 'balanced',
        engagementPattern: parsed.engagementPattern || 'moderate',
        notes: parsed.notes || '',
        confidence: parsed.confidence || 70,
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw error;
    }
  }

  /**
   * Fallback analysis when AI is unavailable
   */
  private static async fallbackAnalysis(userId: string): Promise<AdaptiveLearningInsights> {
    const summary = await BehaviorTracker.getBehaviorSummary(userId);
    const analytics = summary.analytics;

    if (!analytics) {
      return {
        recommendedDifficulty: 'Easy',
        recommendedCategories: ['motor', 'health'],
        recommendedTone: 'balanced',
        engagementPattern: 'new',
        notes: 'New user - starting with basics',
        confidence: 50,
      };
    }

    // Simple rule-based analysis with null-safe access
    const completionRate = (analytics as any).completion_rate || analytics.completionRate || 0;
    const avgSessionDuration = (analytics as any).average_session_duration || analytics.averageSessionDuration || 0;
    const avgCompletionTime = (analytics as any).average_completion_time || analytics.averageCompletionTime || 0;
    const totalAccepted = (analytics as any).total_challenges_accepted || analytics.totalChallengesAccepted || 0;
    const totalSessions = (analytics as any).total_sessions || analytics.totalSessions || 0;
    const lastSessionDate = (analytics as any).last_session_date || analytics.lastSessionDate;
    const prefs = analytics.challengePreferences || {
      preferredCategories: {},
      preferredDifficulties: {},
      preferredTypes: {},
    };

    // Determine difficulty
    let recommendedDifficulty = 'Medium';
    if (completionRate > 80 && avgCompletionTime < 24) {
      recommendedDifficulty = 'Hard';
    } else if (completionRate < 40 || totalAccepted < 3) {
      recommendedDifficulty = 'Easy';
    }

    // Determine categories (top 3 or defaults)
    const sortedCategories = Object.entries(prefs.preferredCategories)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
    const recommendedCategories = sortedCategories.length > 0
      ? sortedCategories.slice(0, 3)
      : ['motor', 'health', 'travel'];

    // Determine tone
    let recommendedTone: 'strict' | 'balanced' | 'friendly' = 'balanced';
    if (completionRate > 75 && avgSessionDuration > 15) {
      recommendedTone = 'strict';
    } else if (completionRate < 50 || avgSessionDuration < 5) {
      recommendedTone = 'friendly';
    }

    // Determine engagement pattern
    let engagementPattern: 'highly-engaged' | 'moderate' | 'declining' | 'new' = 'moderate';
    if (totalSessions < 5) {
      engagementPattern = 'new';
    } else if (avgSessionDuration > 20 && totalSessions > 15) {
      engagementPattern = 'highly-engaged';
    } else if (lastSessionDate) {
      const daysSince = Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 7) {
        engagementPattern = 'declining';
      }
    }

    const insights: AdaptiveLearningInsights = {
      recommendedDifficulty,
      recommendedCategories,
      recommendedTone,
      engagementPattern,
      notes: `Completion rate: ${completionRate.toFixed(0)}%. Avg session: ${avgSessionDuration.toFixed(0)}min. Adjust difficulty and tone accordingly.`,
      confidence: 60,
    };

    // Update database
    await BehaviorTracker.updateAIInsights(userId, {
      recommendedDifficulty: insights.recommendedDifficulty,
      recommendedCategories: insights.recommendedCategories,
      recommendedTone: insights.recommendedTone,
      engagementPattern: insights.engagementPattern,
      notes: insights.notes,
    });

    return insights;
  }

  /**
   * Check if user needs analysis (hasn't been analyzed in 2-3 days)
   */
  static async needsAnalysis(userId: string): Promise<boolean> {
    const analytics = await BehaviorTracker.getUserAnalytics(userId);
    
    if (!analytics) return true;
    if (!analytics.lastAnalyzedAt) return true;

    const daysSinceAnalysis = Math.floor(
      (Date.now() - analytics.lastAnalyzedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceAnalysis >= 2;
  }

  /**
   * Batch analyze multiple users (for scheduled jobs)
   */
  static async batchAnalyzeUsers(userIds: string[]): Promise<void> {
    console.log(`Starting batch analysis for ${userIds.length} users...`);
    
    for (const userId of userIds) {
      try {
        const needsAnalysis = await this.needsAnalysis(userId);
        
        if (needsAnalysis) {
          console.log(`Analyzing user: ${userId}`);
          await this.analyzeUserBehavior(userId);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(`Skipping user ${userId} - recently analyzed`);
        }
      } catch (error) {
        console.error(`Failed to analyze user ${userId}:`, error);
      }
    }
    
    console.log('Batch analysis completed');
  }
}
