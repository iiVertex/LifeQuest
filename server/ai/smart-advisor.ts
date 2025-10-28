import { generateStructuredResponse, generateAIResponse } from './client';
import type { User } from '@shared/schema';

/**
 * QIC LifeQuest Smart Advisor
 * Powered by DeepSeek AI - Generates personalized insurance challenges and nudges
 */

export interface UserContext {
  userId: string;
  name: string;
  activePolicies: string[]; // motor, health, travel, home, life
  protectionScore: number;
  lastLoginDays: number;
  recentChallenges: string[];
  preferredTone: 'strict' | 'balanced' | 'friendly';
  engagementLevel: 'low' | 'medium' | 'high';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  streakDays: number;
}

export interface SmartAdvisorResponse {
  message: string;
  challengeType: 'policy_renewal' | 'safety_check' | 'referral' | 'education' | 'milestone';
  reward: number;
  badge?: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface AdvisorNudge {
  message: string;
  type: 'celebration' | 'reminder' | 'insight' | 'nudge';
  timestamp: string;
}

/**
 * Generate personalized challenge based on user context
 */
export async function generatePersonalizedChallenge(
  context: UserContext
): Promise<SmartAdvisorResponse | null> {
  const systemPrompt = `You are QIC's Smart Advisor, an AI assistant helping users improve their insurance protection score.

Your role:
- Generate personalized challenges based on user's active policies and engagement
- Suggest relevant insurance actions with clear rewards
- Match the user's preferred communication tone (${context.preferredTone})
- Focus on real insurance value, not just gamification

Tone Guidelines:
- STRICT: Direct, performance-focused, accountability-driven. "Your motor policy expires soon. Renew now to maintain coverage."
- BALANCED: Professional yet friendly, encouraging. "Great job staying protected! Your motor policy renewal is coming up—renew early for bonus points."
- FRIENDLY: Warm, supportive, casual. "Hey! 👋 Your motor policy needs some love. Renew it early and grab those sweet bonus points!"

CRITICAL: You must respond ONLY with valid JSON. No explanations, no markdown, just the JSON object.`;

  const userPrompt = `User Context:
- Name: ${context.name}
- Active Policies: ${context.activePolicies.join(', ')}
- Protection Score: ${context.protectionScore}/100 (${context.tier} tier)
- Last Login: ${context.lastLoginDays} days ago
- Recent Challenges: ${context.recentChallenges.join(', ') || 'None'}
- Engagement Level: ${context.engagementLevel}
- Streak: ${context.streakDays} days

Generate ONE personalized challenge with:
1. A ${context.preferredTone} tone message (1-2 sentences max)
2. Challenge type (policy_renewal, safety_check, referral, education, or milestone)
3. Engagement points reward (50-200 based on difficulty)
4. Optional badge name if it's a milestone
5. Priority (low/medium/high based on urgency)

Respond with ONLY this JSON structure:
{
  "message": "Your personalized message here",
  "challengeType": "policy_renewal",
  "reward": 100,
  "badge": "Loyalty Star",
  "priority": "medium"
}`;

  try {
    const response = await generateStructuredResponse<SmartAdvisorResponse>(
      systemPrompt,
      userPrompt,
      { temperature: 0.8, maxTokens: 300 }
    );

    if (!response) {
      return getFallbackChallenge(context);
    }

    // Validate response structure
    if (!response.message || !response.challengeType || !response.reward || !response.priority) {
      console.error('Invalid AI response structure:', response);
      return getFallbackChallenge(context);
    }

    return response;
  } catch (error) {
    console.error('Smart Advisor challenge generation error:', error);
    return getFallbackChallenge(context);
  }
}

/**
 * Generate Smart Advisor nudge/message based on user stage
 */
export async function generateAdvisorNudge(
  context: UserContext,
  stage: 'week1' | 'week2-3' | 'month1+' | 'inactive'
): Promise<AdvisorNudge> {
  const stageContext = {
    'week1': 'New user (Week 1) - Focus on education and motivation. Explain benefits and build trust.',
    'week2-3': 'Engaged user (Week 2-3) - Personalize based on their active policies and progress.',
    'month1+': 'Habit formed (Month 1+) - Optimize and celebrate achievements. Suggest advanced actions.',
    'inactive': 'Inactive user (5+ days) - Send friendly reminder about waiting rewards or expiring benefits.',
  };

  const messageTypes = {
    'week1': 'insight',
    'week2-3': 'nudge',
    'month1+': 'celebration',
    'inactive': 'reminder',
  } as const;

  const systemPrompt = `You are QIC's Smart Advisor for insurance engagement.

User Stage: ${stage}
Context: ${stageContext[stage]}
Tone: ${context.preferredTone}

Generate a SHORT (1-2 sentences) ${messageTypes[stage]} message that:
- Matches the ${context.preferredTone} tone
- References the user's protection score (${context.protectionScore}/100) or policies
- Provides clear value and motivation
- Feels personal and human, not corporate

Respond with ONLY a JSON object:
{
  "message": "Your message here",
  "type": "${messageTypes[stage]}"
}`;

  const userPrompt = `User: ${context.name}
Active Policies: ${context.activePolicies.join(', ')}
Protection Score: ${context.protectionScore}/100
Tier: ${context.tier}
Last Login: ${context.lastLoginDays} days ago
Streak: ${context.streakDays} days

Generate the ${messageTypes[stage]} message now.`;

  try {
    const response = await generateStructuredResponse<{ message: string; type: string }>(
      systemPrompt,
      userPrompt,
      { temperature: 0.85, maxTokens: 150 }
    );

    if (!response || !response.message) {
      return getFallbackNudge(context, stage);
    }

    return {
      message: response.message,
      type: messageTypes[stage],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Smart Advisor nudge generation error:', error);
    return getFallbackNudge(context, stage);
  }
}

/**
 * Generate context summary for user (used in prompts)
 */
export function buildUserContext(user: any, recentChallenges: any[] = []): UserContext {
  const lastLogin = user.lastLogin ? Math.floor((Date.now() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  // Determine engagement level based on recent activity
  const engagementLevel = 
    recentChallenges.length >= 5 ? 'high' :
    recentChallenges.length >= 2 ? 'medium' : 'low';

  // Determine tier based on protection score
  const protectionScore = user.protectionScore || 42;
  const tier = 
    protectionScore >= 90 ? 'platinum' :
    protectionScore >= 70 ? 'gold' :
    protectionScore >= 50 ? 'silver' : 'bronze';

  return {
    userId: user.id,
    name: user.name || user.username || 'User',
    activePolicies: user.focusAreas || ['motor'], // fallback to motor
    protectionScore,
    lastLoginDays: lastLogin,
    recentChallenges: recentChallenges.slice(0, 5).map((c: any) => c.title || 'Challenge'),
    preferredTone: user.preferences?.aiTone || 'balanced',
    engagementLevel,
    tier,
    streakDays: user.streak || 0,
  };
}

/**
 * Fallback challenge when AI is unavailable
 */
function getFallbackChallenge(context: UserContext): SmartAdvisorResponse {
  const challenges: Record<string, SmartAdvisorResponse> = {
    motor: {
      message: "Review your motor insurance policy and verify your coverage details to earn 50 points!",
      challengeType: 'safety_check',
      reward: 50,
      priority: 'medium',
    },
    health: {
      message: "Check your health insurance benefits and schedule a preventive care appointment for 75 points.",
      challengeType: 'safety_check',
      reward: 75,
      priority: 'medium',
    },
    travel: {
      message: "Review your travel insurance coverage and learn about claim procedures to earn 60 points.",
      challengeType: 'education',
      reward: 60,
      priority: 'low',
    },
  };

  const primaryPolicy = context.activePolicies[0] || 'motor';
  return challenges[primaryPolicy] || challenges.motor;
}

/**
 * Fallback nudge when AI is unavailable
 */
function getFallbackNudge(context: UserContext, stage: string): AdvisorNudge {
  const messages = {
    'week1': `Welcome to QIC LifeQuest! Complete your first challenge to start earning points and building your Protection Score.`,
    'week2-3': `You're making great progress! Keep completing challenges to boost your ${context.tier} tier status.`,
    'month1+': `Amazing work maintaining your ${context.streakDays}-day streak! You're ${context.protectionScore}% protected.`,
    'inactive': `Hey ${context.name}! You have pending rewards waiting. Come back and boost your Protection Score!`,
  };

  const types = {
    'week1': 'insight',
    'week2-3': 'nudge',
    'month1+': 'celebration',
    'inactive': 'reminder',
  } as const;

  return {
    message: messages[stage as keyof typeof messages] || messages['week1'],
    type: types[stage as keyof typeof types] || 'nudge',
    timestamp: new Date().toISOString(),
  };
}
