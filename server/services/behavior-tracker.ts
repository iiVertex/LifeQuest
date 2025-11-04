/**
 * Behavior Tracking Service
 * Collects and aggregates user behavior data for AI adaptive learning
 */

import { supabase } from "../storage-supabase";
import type { UserBehaviorAnalytics, UserSession } from "@shared/schema";

export class BehaviorTracker {
  /**
   * Initialize behavior analytics for a new user
   */
  static async initializeUserAnalytics(userId: string): Promise<UserBehaviorAnalytics> {
    const { data: existing, error } = await supabase
      .from('user_behavior_analytics')
      .select()
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (existing && !error) {
      return existing as UserBehaviorAnalytics;
    }

    const { data, error: insertError } = await supabase
      .from('user_behavior_analytics')
      .insert({
        user_id: userId,
        challenge_preferences: {
          preferredCategories: {},
          preferredDifficulties: {},
          preferredTypes: {},
        },
        protection_score_history: [],
        ai_insights: {},
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return data as UserBehaviorAnalytics;
  }

  /**
   * Get user's behavior analytics
   */
  static async getUserAnalytics(userId: string): Promise<UserBehaviorAnalytics | null> {
    const { data, error } = await supabase
      .from('user_behavior_analytics')
      .select()
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error) return null;
    return data as UserBehaviorAnalytics;
  }

  /**
   * Start a new user session
   */
  static async startSession(userId: string): Promise<UserSession> {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        start_time: new Date().toISOString(),
        actions_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as UserSession;
  }

  /**
   * End a user session and update analytics
   */
  static async endSession(sessionId: string): Promise<void> {
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select()
      .eq('id', sessionId)
      .single();

    if (error || !session || session.end_time) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - new Date(session.start_time).getTime()) / 1000 / 60); // minutes

    await supabase
      .from('user_sessions')
      .update({
        end_time: endTime.toISOString(),
        duration,
      })
      .eq('id', sessionId);

    // Update user analytics
    await this.updateSessionAnalytics(session.user_id);
  }

  /**
   * Increment session action count
   */
  static async trackAction(sessionId: string): Promise<void> {
    const { data: session } = await supabase
      .from('user_sessions')
      .select('actions_count')
      .eq('id', sessionId)
      .single();

    if (session) {
      await supabase
        .from('user_sessions')
        .update({
          actions_count: (session.actions_count || 0) + 1,
        })
        .eq('id', sessionId);
    }
  }

  /**
   * Update session-related analytics
   */
  private static async updateSessionAnalytics(userId: string): Promise<void> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select()
      .eq('user_id', userId)
      .not('end_time', 'is', null);

    if (!sessions) return;

    const totalSessions = sessions.length;
    const totalTimeSpent = sessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
    const averageSessionDuration = totalSessions > 0 ? totalTimeSpent / totalSessions : 0;
    const lastSession = sessions[sessions.length - 1];

    await supabase
      .from('user_behavior_analytics')
      .update({
        total_sessions: totalSessions,
        total_time_spent: totalTimeSpent,
        average_session_duration: averageSessionDuration,
        last_session_date: lastSession?.end_time || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  /**
   * Track when a challenge is accepted
   */
  static async trackChallengeAccepted(userId: string, challengeId: string, templateId: string): Promise<void> {
    // Get challenge template info
    const { data: template } = await supabase
      .from('challenge_templates')
      .select()
      .eq('id', templateId)
      .limit(1)
      .single();

    if (!template) return;

    const analytics = await this.getUserAnalytics(userId);
    if (!analytics) {
      await this.initializeUserAnalytics(userId);
      return this.trackChallengeAccepted(userId, challengeId, templateId);
    }

    // Update challenge preferences
    const prefs = analytics.challengePreferences || {
      preferredCategories: {},
      preferredDifficulties: {},
      preferredTypes: {},
    };
    const category = template.insurance_category;
    const difficulty = template.difficulty;

    prefs.preferredCategories[category] = (prefs.preferredCategories[category] || 0) + 1;
    prefs.preferredDifficulties[difficulty] = (prefs.preferredDifficulties[difficulty] || 0) + 1;

    const currentAccepted = analytics.totalChallengesAccepted || 0;

    await supabase
      .from('user_behavior_analytics')
      .update({
        total_challenges_accepted: currentAccepted + 1,
        challenge_preferences: prefs,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  /**
   * Track when a challenge is completed
   */
  static async trackChallengeCompleted(userId: string, challengeId: string): Promise<void> {
    const { data: challenge } = await supabase
      .from('user_challenges')
      .select()
      .eq('id', challengeId)
      .limit(1)
      .single();

    if (!challenge) return;

    // Calculate completion time in hours
    const startTime = challenge.started_at || challenge.created_at;
    const completionTime = challenge.completed_at || new Date().toISOString();
    const hoursToComplete = (new Date(completionTime).getTime() - new Date(startTime).getTime()) / 1000 / 60 / 60;

    // Update analytics
    const analytics = await this.getUserAnalytics(userId);
    if (!analytics) return;

    const newTotalCompleted = (analytics.totalChallengesCompleted || 0) + 1;
    const avgTime = analytics.averageCompletionTime || 0;
    const totalCompleted = analytics.totalChallengesCompleted || 0;
    const newAvgTime = (avgTime * totalCompleted + hoursToComplete) / newTotalCompleted;
    const totalAccepted = analytics.totalChallengesAccepted || 0;
    const newCompletionRate = totalAccepted > 0 ? (newTotalCompleted / totalAccepted) * 100 : 0;

    await supabase
      .from('user_behavior_analytics')
      .update({
        total_challenges_completed: newTotalCompleted,
        average_completion_time: newAvgTime,
        completion_rate: newCompletionRate,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  /**
   * Track abandoned challenges
   */
  static async trackChallengeAbandoned(userId: string): Promise<void> {
    const analytics = await this.getUserAnalytics(userId);
    if (!analytics) return;

    const currentAbandoned = analytics.totalChallengesAbandoned || 0;

    await supabase
      .from('user_behavior_analytics')
      .update({
        total_challenges_abandoned: currentAbandoned + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  /**
   * Update protection score history
   */
  static async trackProtectionScoreChange(userId: string, newScore: number): Promise<void> {
    const analytics = await this.getUserAnalytics(userId);
    if (!analytics) return;

    const history = (analytics as any).protection_score_history || analytics.protectionScoreHistory || [];
    
    // Add new score entry
    history.push({
      score: newScore,
      date: new Date().toISOString(),
    });

    // Keep only last 30 entries
    const recentHistory = history.slice(-30);

    // Calculate average score change per week
    let averageChange = 0;
    if (recentHistory.length >= 2) {
      const firstEntry = recentHistory[0];
      const lastEntry = recentHistory[recentHistory.length - 1];
      const scoreDiff = lastEntry.score - firstEntry.score;
      const timeDiff = new Date(lastEntry.date).getTime() - new Date(firstEntry.date).getTime();
      const weeks = timeDiff / (1000 * 60 * 60 * 24 * 7);
      averageChange = weeks > 0 ? scoreDiff / weeks : 0;
    }

    await supabase
      .from('user_behavior_analytics')
      .update({
        protection_score_history: recentHistory,
        average_score_change: averageChange,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  /**
   * Track reward redemption
   */
  static async trackRewardRedemption(userId: string): Promise<void> {
    const analytics = await this.getUserAnalytics(userId);
    if (!analytics) return;

    const currentRedeemed = (analytics as any).total_rewards_redeemed || analytics.totalRewardsRedeemed || 0;
    const newTotal = currentRedeemed + 1;
    
    // Calculate redemption frequency (times per month)
    const createdDate = (analytics as any).created_at || analytics.createdAt || new Date();
    const accountAge = new Date().getTime() - new Date(createdDate).getTime();
    const months = accountAge / (1000 * 60 * 60 * 24 * 30);
    const frequency = months > 0 ? newTotal / months : 0;

    await supabase
      .from('user_behavior_analytics')
      .update({
        total_rewards_redeemed: newTotal,
        reward_redemption_frequency: frequency,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  /**
   * Get comprehensive behavior summary for AI analysis
   */
  static async getBehaviorSummary(userId: string): Promise<{
    analytics: UserBehaviorAnalytics | null;
    recentSessions: UserSession[];
    challengeStats: any;
  }> {
    const analytics = await this.getUserAnalytics(userId);
    
    const { data: recentSessions } = await supabase
      .from('user_sessions')
      .select()
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(10);

    const { data: challenges } = await supabase
      .from('user_challenges')
      .select()
      .eq('user_id', userId);

    const challengeStats = {
      total: challenges?.length || 0,
      active: challenges?.filter((c: any) => c.status === 'active').length || 0,
      completed: challenges?.filter((c: any) => c.status === 'completed').length || 0,
      abandoned: challenges?.filter((c: any) => c.status === 'abandoned').length || 0,
    };

    return {
      analytics,
      recentSessions: (recentSessions || []) as UserSession[],
      challengeStats,
    };
  }

  /**
   * Update AI insights from learning analysis
   */
  static async updateAIInsights(
    userId: string,
    insights: {
      recommendedDifficulty?: string;
      recommendedCategories?: string[];
      recommendedTone?: string;
      engagementPattern?: string;
      notes?: string;
    }
  ): Promise<void> {
    await supabase
      .from('user_behavior_analytics')
      .update({
        ai_insights: insights,
        last_analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }
}
