/**
 * Adaptive Learning Job
 * Runs AI analysis on user behavior every 2-3 days to improve personalization
 */

import cron from 'node-cron';
import { supabase } from '../storage-supabase';
import { LearningAnalyzer } from '../ai/learning-analyzer';

let isRunning = false;

/**
 * Run adaptive learning analysis for all active users
 */
export async function runAdaptiveLearning(): Promise<void> {
  if (isRunning) {
    console.log('⏭️  Adaptive learning job already running, skipping...');
    return;
  }

  isRunning = true;
  console.log('🧠 Starting adaptive learning analysis...');

  try {
    // Get all users who need analysis (active in last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: activeUsers } = await supabase
      .from('users')
      .select('id')
      .gte('last_active_date', fourteenDaysAgo.toISOString());

    console.log(`Found ${activeUsers?.length || 0} active users for analysis`);

    if (activeUsers && activeUsers.length > 0) {
      // Batch analyze users
      const userIds = activeUsers.map((u: any) => u.id);
      await LearningAnalyzer.batchAnalyzeUsers(userIds);
    }

    console.log('✅ Adaptive learning analysis completed successfully');
  } catch (error) {
    console.error('❌ Adaptive learning analysis failed:', error);
  } finally {
    isRunning = false;
  }
}

/**
 * Schedule adaptive learning job
 * Runs every 2 days at 3 AM
 */
export function scheduleAdaptiveLearning(): void {
  // Run every 2 days at 3:00 AM
  cron.schedule('0 3 */2 * *', async () => {
    console.log('⏰ Triggered scheduled adaptive learning analysis');
    await runAdaptiveLearning();
  });

  console.log('📅 Adaptive learning job scheduled (every 2 days at 3 AM)');
}

/**
 * Run on-demand analysis for a specific user
 */
export async function analyzeUserOnDemand(userId: string): Promise<void> {
  console.log(`🎯 Running on-demand analysis for user: ${userId}`);
  
  try {
    const insights = await LearningAnalyzer.analyzeUserBehavior(userId);
    
    if (insights) {
      console.log(`✅ Analysis complete for ${userId}:`, {
        difficulty: insights.recommendedDifficulty,
        pattern: insights.engagementPattern,
        confidence: insights.confidence,
      });
    } else {
      console.log(`⚠️  No insights generated for ${userId}`);
    }
  } catch (error) {
    console.error(`❌ On-demand analysis failed for ${userId}:`, error);
    throw error;
  }
}
