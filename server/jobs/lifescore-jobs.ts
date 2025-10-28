import { storage } from '../storage';
import { scheduler } from './scheduler';
// import { calculateProtectionScore } from '../protection-score-calculator'; // TODO: Export this function

/**
 * Protection Score Calculation Job
 * Runs every 6 hours
 * Recalculates Protection Scores for active users based on recent activity
 */

export function initializeProtectionScoreJobs() {
  // Run every 6 hours (0:00, 6:00, 12:00, 18:00 UTC)
  scheduler.schedule('protection-score-update', '0 */6 * * *', async () => {
    await updateProtectionScores();
  });
}

/**
 * Update Protection Scores for all users
 */
async function updateProtectionScores() {
  console.log('[ProtectionScore] Updating scores...');
  
  // Note: This requires user iteration
  // TODO: Implement when getAllUsers() is available
  // For each user:
  // 1. Get recent challenges
  // 2. Calculate category scores (motor, health, travel, home, life)
  // 3. Update protectionScores table
}
