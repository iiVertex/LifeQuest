/**
 * Database Synchronization Module
 * This module persists in-memory data to the actual Supabase database
 * using direct SQL queries via the neon HTTP client.
 */

import { neon } from "@neondatabase/serverless";
import type { User, UserChallenge } from "@shared/schema";

const connectionString = process.env.DATABASE_URL!;
const sql = neon(connectionString, { 
  fetchOptions: {
    cache: 'no-store',
  }
});

/**
 * Persist a user to the database
 */
export async function persistUser(user: User): Promise<void> {
  try {
    const focusAreasJson = JSON.stringify(user.focusAreas || []);
    const now = user.createdAt || new Date();
    
    await sql`
      INSERT INTO users (
        id, username, password, name, email, 
        avatar, level, xp, xp_to_next_level,
        focus_areas, insurance_priority, advisor_tone,
        last_active_date, created_at, updated_at
      )
      VALUES (
        ${user.id}, ${user.username}, ${user.password}, ${user.name}, ${user.email},
        ${user.avatar}, ${user.level ?? 1}, ${user.xp ?? 0}, ${user.xpToNextLevel ?? 100},
        ${focusAreasJson}::jsonb, ${(user as any).insurancePriority || null}, ${(user as any).advisorTone || null},
        ${user.lastActiveDate || now}, ${now}, ${user.updatedAt || now}
      )
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        avatar = EXCLUDED.avatar,
        level = EXCLUDED.level,
        xp = EXCLUDED.xp,
        xp_to_next_level = EXCLUDED.xp_to_next_level,
        focus_areas = EXCLUDED.focus_areas,
        insurance_priority = EXCLUDED.insurance_priority,
        advisor_tone = EXCLUDED.advisor_tone,
        last_active_date = EXCLUDED.last_active_date,
        updated_at = EXCLUDED.updated_at;
    `;
    
    console.log(`✅ User ${user.username} (${user.id}) persisted to database`);
  } catch (error: any) {
    console.error(`❌ Failed to persist user ${user.id}:`, error.message);
    throw error;
  }
}

/**
 * Persist a user challenge to the database
 */
export async function persistUserChallenge(challenge: UserChallenge): Promise<void> {
  try {
    const now = challenge.createdAt || new Date();
    const userDataJson = JSON.stringify((challenge as any).userData || {});
    
    await sql`
      INSERT INTO user_challenges (
        id, user_id, template_id, status, progress,
        started_at, completed_at, engagement_points_earned,
        user_data, created_at
      )
      VALUES (
        ${challenge.id}, ${challenge.userId}, ${challenge.templateId},
        ${challenge.status}, ${challenge.progress ?? 0},
        ${(challenge as any).startedAt || now}, ${(challenge as any).completedAt || null},
        ${(challenge as any).engagementPointsEarned ?? null},
        ${userDataJson}::jsonb, ${now}
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        progress = EXCLUDED.progress,
        completed_at = EXCLUDED.completed_at,
        engagement_points_earned = EXCLUDED.engagement_points_earned,
        user_data = EXCLUDED.user_data;
    `;
    
    console.log(`✅ Challenge ${challenge.id} for user ${challenge.userId} persisted to database`);
  } catch (error: any) {
    console.error(`❌ Failed to persist challenge ${challenge.id}:`, error.message);
    throw error;
  }
}

/**
 * Verify a user exists in the database
 */
export async function verifyUserInDatabase(userId: string): Promise<boolean> {
  try {
    const result = await sql`SELECT id FROM users WHERE id = ${userId} LIMIT 1;`;
    return result.length > 0;
  } catch (error: any) {
    console.error(`❌ Failed to verify user ${userId}:`, error.message);
    return false;
  }
}

/**
 * Get user count from database
 */
export async function getDatabaseUserCount(): Promise<number> {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM users;`;
    return parseInt(result[0].count);
  } catch (error: any) {
    console.error(`❌ Failed to get user count:`, error.message);
    return 0;
  }
}
