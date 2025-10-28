import { storage } from '../storage';
import type { User, Milestone } from '@shared/schema';

/**
 * Milestone Detection System
 * Checks if users have earned new milestones based on their progress
 * Called after challenge completions, XP updates, and other milestones
 */

/**
 * Check and award milestones for a user
 */
export async function checkMilestones(userId: string): Promise<Milestone[]> {
  const user = await storage.getUser(userId);
  if (!user) return [];

  const completedChallenges = await storage.getCompletedChallenges(userId);
  const userMilestones = await storage.getUserMilestones(userId);
  const allMilestones = await storage.getMilestones();

  // Filter out already earned milestones
  const earnedMilestoneIds = new Set(userMilestones.map(um => um.milestoneId));
  const availableMilestones = allMilestones.filter(
    m => !earnedMilestoneIds.has(m.id) && m.isActive
  );

  const newMilestones: Milestone[] = [];

  for (const milestone of availableMilestones) {
    if (await checkMilestoneConditions(milestone, user, completedChallenges)) {
      // Award milestone
      // TODO: Create proper milestone award method
      newMilestones.push(milestone);
    }
  }

  return newMilestones;
}

/**
 * Check if user meets milestone conditions
 */
async function checkMilestoneConditions(
  milestone: Milestone,
  user: User,
  completedChallenges: any[]
): Promise<boolean> {
  const conditions = milestone.conditions as Record<string, any> || {};

  // First Steps - Complete 1 challenge
  if (conditions.challengesCompleted) {
    if (completedChallenges.length >= conditions.challengesCompleted) {
      return true;
    }
  }

  // Streak Master - 7 day streak
  if (conditions.streakDays) {
    if ((user.streak || 0) >= conditions.streakDays) {
      return true;
    }
  }

  // Category-specific milestones (insurance categories)
  if (conditions.motorChallengesCompleted) {
    const motorChallenges = completedChallenges.filter(c => 
      c.userData?.insuranceCategory === 'motor' || false
    );
    if (motorChallenges.length >= conditions.motorChallengesCompleted) {
      return true;
    }
  }

  if (conditions.healthChallengesCompleted) {
    const healthChallenges = completedChallenges.filter(c => 
      c.userData?.insuranceCategory === 'health' || false
    );
    if (healthChallenges.length >= conditions.healthChallengesCompleted) {
      return true;
    }
  }

  if (conditions.travelChallengesCompleted) {
    const travelChallenges = completedChallenges.filter(c => 
      c.userData?.insuranceCategory === 'travel' || false
    );
    if (travelChallenges.length >= conditions.travelChallengesCompleted) {
      return true;
    }
  }

  if (conditions.homeChallengesCompleted) {
    const homeChallenges = completedChallenges.filter(c => 
      c.userData?.insuranceCategory === 'home' || false
    );
    if (homeChallenges.length >= conditions.homeChallengesCompleted) {
      return true;
    }
  }

  if (conditions.lifeChallengesCompleted) {
    const lifeChallenges = completedChallenges.filter(c => 
      c.userData?.insuranceCategory === 'life' || false
    );
    if (lifeChallenges.length >= conditions.lifeChallengesCompleted) {
      return true;
    }
  }

  // Level milestones
  if (conditions.level) {
    if ((user.level || 1) >= conditions.level) {
      return true;
    }
  }

  // Perfect Week - 7 days of completed challenges
  if (conditions.perfectDays) {
    // TODO: Implement daily mission tracking
    return false;
  }

  return false;
}
