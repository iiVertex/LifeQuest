import type { User } from '@shared/schema';
import { generateAIResponse } from './client';

/**
 * Smart Advisor - Personalized messaging system
 * Generates contextual nudges, celebrations, guidance, and insights for insurance engagement
 */

export type AdvisorMessageType = 'nudge' | 'celebration' | 'guidance' | 'insight';

interface AdvisorContext {
  user: User;
  recentChallenges?: any[]; // previously UserMission[]
  challengeTemplates?: any[]; // previously MissionTemplate[]
  streakStatus?: 'active' | 'at-risk' | 'broken';
}

/**
 * Generate personalized Smart Advisor message
 */
export async function generateAdvisorMessage(
  type: AdvisorMessageType,
  context: AdvisorContext
): Promise<string> {
  const { user } = context;
  const tone = user.preferences?.aiTone || 'balanced';

  // Build system prompt based on tone
  const toneInstructions = {
    strict: 'Be direct, disciplined, and performance-focused. Use facts and accountability. Example: "You missed yesterday. Get back on track today."',
    balanced: 'Be encouraging but honest. Mix motivation with gentle accountability. Example: "You\'re doing great! Let\'s keep this momentum going."',
    soft: 'Be warm, supportive, and empathetic. Focus on progress, not perfection. Example: "Every step counts! You\'re making real progress."',
  };

  const systemPrompt = `You are QIC's Smart Advisor for ${user.name || user.username}.

Tone: ${tone.toUpperCase()}
${toneInstructions[tone]}

User Context:
- Level: ${user.level || 1}
- Engagement Points: ${user.xp || 0} / ${user.xpToNextLevel || 100}
- Current Streak: ${user.streak || 0} days
- Insurance Categories: ${user.focusAreas?.join(', ') || 'General insurance engagement'}

Guidelines:
- Keep messages SHORT (1-2 sentences max)
- Be personal and human
- Use the user's name occasionally
- Match the ${tone} tone perfectly
- No emojis unless tone is "soft"
- No generic corporate speak

Generate a ${type} message.`;

  let userPrompt = '';

  switch (type) {
    case 'nudge':
      userPrompt = `The user hasn't been active recently. Send a short Smart Advisor nudge encouraging them to engage with a challenge or review a renewal offer.`;
      break;

    case 'celebration':
      userPrompt = `The user just completed a challenge! Celebrate their achievement and suggest the next relevant insurance action.${
        context.recentChallenges && context.recentChallenges.length > 0
          ? ` Recent challenge: ${JSON.stringify(context.recentChallenges[0].userData || context.recentChallenges[0])}`
          : ''
      }`;
      break;

    case 'guidance':
      userPrompt = `The user seems unsure. Provide actionable guidance on relevant insurance products or next steps.${
        user.focusAreas && user.focusAreas.length > 0
          ? ` Their insurance categories: ${user.focusAreas.join(', ')}`
          : ''
      }`;
      break;

    case 'insight':
      userPrompt = `Share a brief insight about the user's protection score or engagement. Be data-driven and tie suggestions to insurance products.${
        context.recentChallenges
          ? ` They've completed ${context.recentChallenges.length} challenges recently.`
          : ''
      }`;
      break;
  }

  try {
    const aiMessage = await generateAIResponse(systemPrompt, userPrompt, {
      temperature: 0.8,
      maxTokens: 100,
    });

    return aiMessage || getFallbackMessage(type, tone);
  } catch (error) {
    console.error('AI companion message generation error:', error);
    return getFallbackMessage(type, tone);
  }
}

/**
 * Generate streak reminder message
 */
export async function generateStreakReminder(
  user: User,
  daysUntilStreakBreaks: number
): Promise<string> {
  const tone = user.preferences?.aiTone || 'balanced';

  if (daysUntilStreakBreaks <= 0) {
    return generateAdvisorMessage('nudge', { user });
  }

  const systemPrompt = `You are QIC's Smart Advisor for ${user.name || user.username}.
Tone: ${tone.toUpperCase()}.
The user has a ${user.streak}-day streak that will break in ${daysUntilStreakBreaks} day(s).
Send a SHORT (1 sentence) reminder to keep their engagement streak alive.`;

  const userPrompt = `Remind them to engage with a challenge or review a policy today.`;

  try {
    const message = await generateAIResponse(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: 50,
    });
    return message || `Your ${user.streak}-day streak is at risk! Complete a challenge today to keep it going.`;
  } catch {
    return `Your ${user.streak}-day streak is at risk! Complete a challenge today to keep it going.`;
  }
}

/**
 * Generate level-up celebration message
 */
export async function generateLevelUpMessage(user: User, newLevel: number): Promise<string> {
  const tone = user.preferences?.aiTone || 'balanced';

  const systemPrompt = `You are QIC's Smart Advisor celebrating a user's level-up.
Tone: ${tone.toUpperCase()}
User ${user.name || user.username} just reached Level ${newLevel}!
Generate a SHORT (1-2 sentences) celebration message and suggest a relevant next challenge or insurance action.`;

  const userPrompt = `Celebrate reaching level ${newLevel} and suggest a sensible next challenge or insurance action.`;

  try {
    const message = await generateAIResponse(systemPrompt, userPrompt, {
      temperature: 0.9,
      maxTokens: 80,
    });
    return message || `Congratulations on reaching Level ${newLevel}! You're making incredible progress.`;
  } catch {
    return `Congratulations on reaching Level ${newLevel}! You're making incredible progress.`;
  }
}

/**
 * Fallback messages when AI is unavailable
 */
function getFallbackMessage(type: AdvisorMessageType, tone: string): string {
  const messages = {
    nudge: {
      strict: "You're falling behind. Complete a mission today.",
      balanced: "Ready to make progress? Let's tackle a mission together.",
      soft: "Hey! Just checking in. How about we try a small mission today?",
    },
    celebration: {
      strict: "Mission complete. Keep up the discipline.",
      balanced: "Great work! You're building real momentum.",
      soft: "You did it! Every small win counts. 🎉",
    },
    guidance: {
      strict: "Focus on your goals. Pick a mission and execute.",
      balanced: "Not sure what's next? Check out your recommended missions.",
      soft: "Take it one step at a time. Your next mission is waiting!",
    },
    insight: {
      strict: "Consistency drives results. Stay on track.",
      balanced: "You're making steady progress. Keep going!",
      soft: "Look how far you've come! Be proud of your journey.",
    },
  };

  // ensure sensible defaults: fall back to the 'nudge' group
  const messageGroup = (messages as any)[type] || messages.nudge;
  return messageGroup[tone] || messageGroup.balanced;
}
