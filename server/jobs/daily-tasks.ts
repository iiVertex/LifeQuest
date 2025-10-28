import { storage } from '../storage';
import { scheduler } from './scheduler';
import { generateAdvisorMessage } from '../ai/companion';

/**
 * Daily Tasks Job
 * Runs at midnight UTC every day
 * - Calculate and update user streaks
 * - Check for challenge expiration
 * - Send Smart Advisor nudges to inactive users
 */

export function initializeDailyTasks() {
  // Run daily at midnight UTC (00:00)
  scheduler.schedule('daily-tasks', '0 0 * * *', async () => {
    await updateUserStreaks();
    await checkChallengeExpiry();
    await sendInactivityNudges();
  });
}

/**
 * Update all user streaks based on last active date
 */
async function updateUserStreaks() {
  console.log('[Daily] Updating user streaks...');
  
  // Note: This is a placeholder - in production, you'd query all users
  // For now, we'll skip implementation since we don't have a "getAllUsers" method
  // TODO: Add getAllUsers() to storage interface
}

/**
 * Check for expired challenges and mark them as abandoned
 */
async function checkChallengeExpiry() {
  console.log('[Daily] Checking challenge expiry...');
  
  // Note: This requires challenge expiry logic in the schema
  // TODO: Add expiresAt field to userChallenges table
}

/**
 * Send Smart Advisor nudges to users who haven't been active recently
 */
async function sendInactivityNudges() {
  console.log('[Daily] Sending Smart Advisor inactivity nudges...');
  
  // Note: Requires getAllUsers() and last activity check
  // TODO: Implement when user iteration is available
}
