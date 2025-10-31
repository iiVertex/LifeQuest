/**
 * Daily Streak System
 * Duolingo-style streak tracking that encourages daily engagement
 * 
 * Core Rules:
 * 1. User completes activity today + had activity yesterday → streak += 1
 * 2. User missed yesterday → streak = 1 (fresh start)
 * 3. User missed today (no activity by 23:59) → streak = 0 (unless freeze active)
 * 4. Streak Freeze: One-time protection that prevents streak reset for one missed day
 */

import { storage } from '../storage';

interface StreakUpdate {
  currentStreak: number;
  longestStreak: number;
  hasStreakFreeze: boolean;
  streakIncreased: boolean;
  streakReset: boolean;
  freezeUsed: boolean;
  message: string;
}

/**
 * Update user's daily streak
 * Called whenever user completes any significant action (challenge, login, etc.)
 * 
 * @param userId - The user's ID
 * @returns Streak update information
 */
export async function updateDailyStreak(userId: string): Promise<StreakUpdate> {
  console.log('[Streak] Starting streak update for user:', userId);
  
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Get user's local date (you might want to pass timezone from client)
  // For now, using server time (UTC) - in production, use user's timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  const lastActiveDate = (user as any).last_active_date ? new Date((user as any).last_active_date) : null;
  if (lastActiveDate) {
    lastActiveDate.setHours(0, 0, 0, 0);
  }

  let currentStreak = user.streak || 0;
  let longestStreak = (user as any).longest_streak || 0;
  let streakIncreased = false;
  let streakReset = false;
  let message = '';

  console.log('[Streak] Current state:', {
    userId,
    currentStreak,
    longestStreak,
    lastActiveDate: lastActiveDate?.toISOString(),
    today: today.toISOString()
  });

  // Case 1: First activity ever
  if (!lastActiveDate) {
    currentStreak = 1;
    message = '🔥 Streak started! Come back tomorrow to keep it going.';
    console.log('[Streak] Case 1: First activity ever');
  }
  // Case 2: Already completed today (same day)
  else if (today.getTime() === lastActiveDate.getTime()) {
    // No change - already counted for today
    message = '✅ Already counted today. Keep up the great work!';
    console.log('[Streak] Case 2: Already counted today');
    
    // Don't update anything - just return current state
    return {
      currentStreak,
      longestStreak,
      hasStreakFreeze: false,
      streakIncreased: false,
      streakReset: false,
      freezeUsed: false,
      message,
    };
  }
  // Case 3: Consecutive day (yesterday + today)
  else if (isConsecutiveDay(lastActiveDate, today)) {
    currentStreak += 1;
    streakIncreased = true;
    
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
      message = `🔥 ${currentStreak}-day streak! New personal record! 🎉`;
    } else {
      message = `🔥 ${currentStreak}-day streak! Keep it up!`;
    }
    console.log('[Streak] Case 3: Consecutive day - streak increased to', currentStreak);
  }
  // Case 4: Missed day(s) - reset streak
  else {
    currentStreak = 1;
    streakReset = true;
    message = `⚠️ Streak reset. Starting fresh at Day 1. Don't give up!`;
    console.log('[Streak] Case 4: Missed days - streak reset to 1');
  }

  // Update user record
  console.log('[Streak] Updating user with:', {
    streak: currentStreak,
    last_active_date: today.toISOString(),
    longest_streak: longestStreak
  });
  
  const updateResult = await storage.updateUser(userId, {
    streak: currentStreak,
    last_active_date: today.toISOString(),
    longest_streak: longestStreak,
  } as any);
  
  console.log('[Streak] Update result:', updateResult ? 'Success' : 'Failed');


  return {
    currentStreak,
    longestStreak,
    hasStreakFreeze: false,
    streakIncreased,
    streakReset,
    freezeUsed: false,
    message,
  };
}

/**
 * Check if two dates are consecutive calendar days (date2 is the day after date1)
 * Works regardless of exact hour/minute - only checks if it's the next day
 */
function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffMs = date2.getTime() - date1.getTime();
  const diffDays = Math.floor(diffMs / oneDayMs);
  return diffDays === 1;
}

/**
 * Check if one day was missed (date2 is 2+ days after date1)
 */
function isMissedOneDay(date1: Date, date2: Date): boolean {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffMs = date2.getTime() - date1.getTime();
  const diffDays = Math.floor(diffMs / oneDayMs);
  return diffDays >= 2;
}

/**
 * Grant streak freeze to user
 * This can be earned through rewards, achievements, or purchases
 */
export async function grantStreakFreeze(userId: string): Promise<void> {
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  await storage.updateUser(userId, {
    hasStreakFreeze: true,
  } as any);
}

/**
 * Check if user's streak is at risk
 * Call this to send notifications if user hasn't been active today
 */
export async function checkStreakAtRisk(userId: string): Promise<{
  atRisk: boolean;
  hoursRemaining: number;
  currentStreak: number;
}> {
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const lastActiveDate = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (lastActiveDate) {
    lastActiveDate.setHours(0, 0, 0, 0);
  }

  // If already active today, not at risk
  if (lastActiveDate && lastActiveDate.getTime() === today.getTime()) {
    return {
      atRisk: false,
      hoursRemaining: 24,
      currentStreak: user.streak || 0,
    };
  }

  // Calculate hours remaining in the day
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  const hoursRemaining = Math.ceil((endOfDay.getTime() - now.getTime()) / (60 * 60 * 1000));

  return {
    atRisk: true,
    hoursRemaining,
    currentStreak: user.streak || 0,
  };
}

/**
 * Get milestone achievements for streaks
 */
export function getStreakMilestone(streak: number): {
  achieved: boolean;
  milestone: number;
  nextMilestone: number;
  badge?: string;
} {
  const milestones = [7, 14, 30, 50, 100, 365];
  
  let achievedMilestone = 0;
  let nextMilestone = milestones[0];
  
  for (const milestone of milestones) {
    if (streak >= milestone) {
      achievedMilestone = milestone;
    } else {
      nextMilestone = milestone;
      break;
    }
  }

  const badges: Record<number, string> = {
    7: '🔥 Week Warrior',
    14: '⚡ Two-Week Thunder',
    30: '💪 Monthly Master',
    50: '🌟 Streak Star',
    100: '👑 Century Champion',
    365: '🏆 Year Legend',
  };

  return {
    achieved: achievedMilestone > 0,
    milestone: achievedMilestone,
    nextMilestone,
    badge: badges[achievedMilestone],
  };
}
