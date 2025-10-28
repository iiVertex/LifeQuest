import type { User, MissionTemplate } from '@shared/schema';
import type { IStorage } from '../storage';
import { generateStructuredResponse } from './client';

/**
 * AI-powered mission recommendation engine
 * Suggests missions based on:
 * - User's focus areas
 * - Completed missions
 * - Skill tree progress
 * - Current level and XP
 */

interface RecommendationContext {
  user: User;
  completedMissionCount: number;
  activeMissionCount: number;
  recentCategories: string[];
}

interface MissionRecommendation {
  templateId: string;
  reason: string;
  priority: number; // 1-5, higher = more important
  personalizedTitle?: string;
}

/**
 * Get AI-powered mission recommendations
 */
export async function getAIRecommendedMissions(
  storage: IStorage,
  userId: string,
  limit: number = 3
): Promise<MissionTemplate[]> {
  try {
    // Gather user context
    const user = await storage.getUser(userId);
    if (!user) return [];

    const completedMissions = await storage.getCompletedMissions(userId);
    const activeMissions = await storage.getActiveMissions(userId);
    const allTemplates = await storage.getMissionTemplates();

    // Build context for AI
    const context: RecommendationContext = {
      user,
      completedMissionCount: completedMissions.length,
      activeMissionCount: activeMissions.length,
      recentCategories: completedMissions
        .slice(-5)
        .map((m) => {
          const template = allTemplates.find((t) => t.id === m.templateId);
          return template?.category || '';
        })
        .filter(Boolean),
    };

    // Filter available templates (not currently active)
    const activeMissionTemplateIds = new Set(activeMissions.map((m) => m.templateId));
    const availableTemplates = allTemplates.filter(
      (t) => !activeMissionTemplateIds.has(t.id) && t.isActive
    );

    if (availableTemplates.length === 0) {
      return [];
    }

    // Use AI to recommend missions
    const systemPrompt = `You are an intelligent lifestyle coach AI assistant. 
Your role is to recommend personalized missions based on the user's profile and progress.

User Profile:
- Level: ${user.level || 1}
- XP: ${user.xp || 0}
- Focus Areas: ${user.focusAreas?.join(', ') || 'None selected'}
- Completed Missions: ${context.completedMissionCount}
- Active Missions: ${context.activeMissionCount}
- Recent Activity: ${context.recentCategories.join(', ') || 'No recent activity'}
- AI Tone Preference: ${user.preferences?.aiTone || 'balanced'}

Available Mission Templates:
${availableTemplates.map((t, i) => `${i + 1}. ${t.title} (${t.category}, ${t.difficulty}, ${t.xpReward} XP) - ${t.description}`).join('\n')}

Recommend ${limit} missions that:
1. Match the user's focus areas (if set)
2. Are appropriate for their level (beginners get easier missions)
3. Provide variety (don't recommend same category repeatedly)
4. Challenge but don't overwhelm

Respond with a JSON array of recommendations with this structure:
{
  "recommendations": [
    {
      "templateId": "template-id-from-list",
      "reason": "One sentence explaining why this mission fits the user",
      "priority": 1-5 (higher is more important)
    }
  ]
}`;

    const userPrompt = `Recommend ${limit} missions for this user right now.`;

    const aiResponse = await generateStructuredResponse<{
      recommendations: MissionRecommendation[];
    }>(systemPrompt, userPrompt, { temperature: 0.8 });

    if (!aiResponse || !aiResponse.recommendations) {
      // Fallback: return random missions from focus areas
      return getDefaultRecommendations(availableTemplates, user, limit);
    }

    // Map AI recommendations to actual templates
    const recommendedTemplates = aiResponse.recommendations
      .map((rec) => availableTemplates.find((t) => t.id === rec.templateId))
      .filter((t): t is MissionTemplate => t !== undefined)
      .slice(0, limit);

    return recommendedTemplates.length > 0
      ? recommendedTemplates
      : getDefaultRecommendations(availableTemplates, user, limit);
  } catch (error) {
    console.error('AI mission recommendation error:', error);
    // Fallback to simple filtering
    const user = await storage.getUser(userId);
    const allTemplates = await storage.getMissionTemplates();
    return user ? getDefaultRecommendations(allTemplates, user, limit) : [];
  }
}

/**
 * Fallback recommendation algorithm (no AI required)
 */
function getDefaultRecommendations(
  templates: MissionTemplate[],
  user: User,
  limit: number
): MissionTemplate[] {
  let filtered = templates.filter((t) => t.isActive);

  // Filter by focus areas if set
  if (user.focusAreas && user.focusAreas.length > 0) {
    const focusFiltered = filtered.filter((t) =>
      user.focusAreas!.includes(t.category)
    );
    if (focusFiltered.length > 0) {
      filtered = focusFiltered;
    }
  }

  // Filter by difficulty based on level
  const userLevel = user.level || 1;
  if (userLevel <= 3) {
    filtered = filtered.filter((t) => t.difficulty === 'beginner');
  } else if (userLevel <= 7) {
    filtered = filtered.filter((t) =>
      ['beginner', 'intermediate'].includes(t.difficulty)
    );
  }

  // Shuffle and return limited results
  return filtered
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
}
