import { storage } from '../storage';
import { scheduler } from './scheduler';
import { generateAdvisorMessage } from '../ai/companion';
import { generateStructuredResponse } from '../ai/client';
import { CHALLENGE_LIBRARY, getRecommendedChallenges, ChallengeTemplate } from '../challenges/framework';

/**
 * Daily Tasks Job
 * Runs at midnight UTC every day
 * - Calculate and update user streaks
 * - Check for challenge expiration
 * - Send Smart Advisor nudges to inactive users
 * - Generate daily AI challenges for all active users
 */

export function initializeDailyTasks() {
  // Run daily at midnight UTC (00:00)
  scheduler.schedule('daily-tasks', '0 0 * * *', async () => {
    await updateUserStreaks();
    await checkChallengeExpiry();
    await sendInactivityNudges();
    await generateDailyChallenges();
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

/**
 * Generate daily AI-powered challenges for all active users
 * Uses the QIC Challenge Framework to create behavior-shaping challenges that:
 * - Increase login frequency
 * - Drive renewals and cross-selling
 * - Educate users about insurance products
 * - Reward engagement and responsible behavior
 * 
 * Strategy:
 * 1. Use pre-defined high-impact challenges from CHALLENGE_LIBRARY
 * 2. Filter based on user context (stage, policies, renewal dates)
 * 3. Fallback to AI-generated challenges for variety
 */
async function generateDailyChallenges() {
  console.log('[Daily] Generating behavior-shaping challenges for active users...');
  
  try {
    // Get all active users from Supabase
    const users = await storage.getAllUsers();
    
    if (!users || users.length === 0) {
      console.log('[Daily] No users found for challenge generation');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let libraryUsed = 0;
    let aiGenerated = 0;

    for (const user of users) {
      try {
        // Skip users without focus areas
        const focusAreas = (user as any).focusAreas || (user as any).focus_areas;
        if (!focusAreas || focusAreas.length === 0) {
          console.log(`[Daily] Skipping user ${user.id} - no focus areas`);
          continue;
        }

        // Get user's existing challenges to avoid duplicates
        const userChallenges = await storage.getUserChallenges(user.id);
        const existingTitles = userChallenges.map((c: any) => c.title?.toLowerCase() || '');
        
        // Determine user stage based on activity
        const lastActive = (user as any).lastActiveDate;
        const inactiveDays = lastActive ? Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        // Calculate protection level from score
        const lifeProtectionScore = (user as any).lifeProtectionScore || 0;
        let protectionLevel = 'Beginner';
        if (lifeProtectionScore > 80) protectionLevel = 'Diamond';
        else if (lifeProtectionScore > 60) protectionLevel = 'Gold';
        else if (lifeProtectionScore > 40) protectionLevel = 'Silver';
        else if (lifeProtectionScore > 20) protectionLevel = 'Bronze';
        
        let userStage: 'new' | 'active' | 'loyal' | 'inactive';
        if (lifeProtectionScore > 60) userStage = 'loyal';
        else if (inactiveDays > 7) userStage = 'inactive';
        else if (lifeProtectionScore < 20) userStage = 'new';
        else userStage = 'active';

        // Get recommended challenges from library
        const recommendedChallenges = getRecommendedChallenges({
          stage: userStage,
          activePolicies: [], // TODO: Get from user policies when implemented
          inactiveDays,
          focusAreas,
          level: lifeProtectionScore > 60 ? 10 : lifeProtectionScore > 30 ? 5 : 1
        });

        // Filter out already assigned challenges
        const availableChallenges = recommendedChallenges.filter(
          challenge => !existingTitles.includes(challenge.name.toLowerCase())
        );

        let challengeToCreate: any = null;

        // Strategy 1: Use pre-defined challenge (70% of time)
        if (availableChallenges.length > 0 && Math.random() < 0.7) {
          const selectedChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
          
          challengeToCreate = {
            title: selectedChallenge.name,
            description: selectedChallenge.description,
            category: selectedChallenge.category,
            difficulty: selectedChallenge.difficulty,
            engagementPoints: selectedChallenge.engagementPoints,
            estimatedDuration: selectedChallenge.estimatedDuration,
            steps: selectedChallenge.steps,
            protectionScoreBoost: selectedChallenge.protectionScoreBoost,
            practicalReward: selectedChallenge.practicalReward,
            type: selectedChallenge.type
          };
          
          libraryUsed++;
          console.log(`[Daily] 📚 Using library challenge "${selectedChallenge.name}" for user ${user.id}`);
        } 
        // Strategy 2: AI-generate custom challenge (30% of time or when library exhausted)
        else {
          const focusArea = focusAreas[Math.floor(Math.random() * focusAreas.length)];
          
          // Determine difficulty based on score
          let difficulty = 'Easy';
          let points = 5;
          let duration = 1;
          if (lifeProtectionScore > 60) { 
            difficulty = 'Hard'; 
            points = 15;
            duration = 3;
          } else if (lifeProtectionScore > 30) { 
            difficulty = 'Medium'; 
            points = 10;
            duration = 2;
          }

          const systemPrompt = `You are a QIC insurance expert creating behavior-shaping challenges.

User Profile:
- Insurance interests: ${focusAreas.join(', ')}
- User stage: ${userStage}
- Protection level: ${protectionLevel}
- Life Protection Score: ${lifeProtectionScore}/100
- Inactive days: ${inactiveDays}

Create a challenge that drives ONE of these business goals:
1. Renewal: Encourage early policy renewal
2. Awareness: Educate about ${focusArea} insurance products
3. Engagement: Drive daily app usage
4. Safety/Wellness: Promote responsible behavior
5. Cross-Product: Introduce new insurance products
6. Referral: Encourage friend invitations

Challenge should be:
- Actionable and achievable in ${duration} hours
- Educational about insurance
- Rewarding (${points} points)
- Fresh and unique (avoid generic titles)

Return ONLY valid JSON:
{
  "title": "Compelling, specific title (max 50 chars)",
  "description": "Clear explanation of what they'll learn and accomplish (2-3 sentences)",
  "category": "${focusArea}",
  "difficulty": "${difficulty}",
  "engagementPoints": ${points},
  "estimatedDuration": ${duration},
  "steps": ["Step 1: actionable task", "Step 2: actionable task", "Step 3: actionable task"],
  "type": "renewal|awareness|engagement|safety-wellness|cross-product|referral"
}`;

          const aiChallenge = await generateStructuredResponse<any>(
            systemPrompt,
            'Generate a behavior-shaping insurance challenge',
            { temperature: 0.9, maxTokens: 600 }
          );

          if (aiChallenge && aiChallenge.title) {
            challengeToCreate = aiChallenge;
            aiGenerated++;
            console.log(`[Daily] 🤖 AI-generated challenge "${aiChallenge.title}" for user ${user.id}`);
          }
        }

        // Create the challenge if we have one
        if (challengeToCreate) {
          const template = await storage.createChallenge({
            title: challengeToCreate.title,
            description: challengeToCreate.description,
            insuranceCategory: challengeToCreate.category,
            difficulty: challengeToCreate.difficulty || 'beginner',
            engagementPoints: challengeToCreate.engagementPoints || 50,
            estimatedDuration: challengeToCreate.estimatedDuration || 1,
            requirements: {
              steps: challengeToCreate.steps || [],
              conditions: {
                type: challengeToCreate.type || 'awareness',
                protectionScoreBoost: challengeToCreate.protectionScoreBoost || 3,
                practicalReward: challengeToCreate.practicalReward
              }
            },
            prerequisites: [],
            isActive: true,
          });

          await storage.createUserChallenge({
            userId: user.id,
            templateId: template.id,
            userData: {
              aiGenerated: challengeToCreate.type === undefined,
              dailyChallenge: true,
              challengeType: challengeToCreate.type || 'awareness',
              generatedAt: new Date().toISOString(),
              userStage
            } as any
          });

          successCount++;
        } else {
          console.log(`[Daily] ⚠️ No suitable challenge found for user ${user.id}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`[Daily] Error generating challenge for user ${user.id}:`, error);
        errorCount++;
      }
    }

    console.log(`[Daily] Challenge generation complete:`);
    console.log(`  ✓ ${successCount} challenges created`);
    console.log(`  📚 ${libraryUsed} from pre-defined library`);
    console.log(`  🤖 ${aiGenerated} AI-generated`);
    console.log(`  ✗ ${errorCount} errors`);
  } catch (error) {
    console.error('[Daily] Fatal error in generateDailyChallenges:', error);
  }
}
