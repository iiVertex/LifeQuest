import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserChallengeSchema, insertSmartAdvisorInteractionSchema } from "@shared/schema";
import authRoutes from "./auth/routes";
import { generateStructuredResponse } from "./ai/client";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route (only for production/API calls, not dev mode)
  app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "LifeQuest API is running" });
  });

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      console.log('[GET /api/user/:id] Fetching user:', req.params.id);
      
      // Try to get by email first (from Supabase auth), then by ID
      let user = await storage.getUserByEmail(req.params.id);
      if (!user) {
        user = await storage.getUser(req.params.id);
      }
      
      // If user doesn't exist, create a new one with default values
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log('[GET /api/user/:id] Current streak:', user.streak, 'Last active:', (user as any).last_active_date);

      // Auto-initialize missing data for existing users (silent background operation)
      console.log('[AUTO-INIT] Starting auto-initialization for user:', user.id);
      try {
        // Initialize life_protection_score if null
        if ((user as any).life_protection_score === null || (user as any).life_protection_score === undefined) {
          console.log('[AUTO-INIT] Initializing life_protection_score to 0');
          await storage.updateUser(user.id, { life_protection_score: 0 } as any);
        }
        
        // Create welcome challenge ONLY if user has NEVER had any challenges
        const allUserChallenges = await storage.getUserChallenges(user.id);
        
        console.log('[AUTO-INIT] User has', allUserChallenges.length, 'total challenges');
        
        // Check focusAreas (might be focus_areas in snake_case from DB)
        const focusAreas = (user as any).focusAreas || (user as any).focus_areas;
        console.log('[AUTO-INIT] User focusAreas:', focusAreas);
        
        // Only create welcome challenge if user is BRAND NEW (never had any challenges)
        if (allUserChallenges.length === 0 && focusAreas && focusAreas.length > 0) {
          console.log('[AUTO-INIT] Creating welcome challenge for focus area:', focusAreas[0]);
          
          const welcomeChallenge = await storage.createChallenge({
            title: `Welcome to ${focusAreas[0].charAt(0).toUpperCase() + focusAreas[0].slice(1)} Insurance!`,
            description: `Learn the basics of ${focusAreas[0]} insurance and start your protection journey.`,
            insuranceCategory: focusAreas[0] as string,
            difficulty: 'Easy',
            engagementPoints: 5, // Simple: Easy = 5 points
            estimatedDuration: 1,
            requirements: {
              steps: [
                'Complete your profile',
                'Review insurance basics',
                'Set your first protection goal'
              ],
              conditions: {}
            },
            prerequisites: [],
            isActive: true,
          });
          
          console.log('[AUTO-INIT] Welcome challenge created:', welcomeChallenge.id);
          
          const userChallenge = await storage.createUserChallenge({
            userId: user.id,
            templateId: welcomeChallenge.id,
            userData: {
              isWelcomeChallenge: true,
              createdAt: new Date().toISOString()
            } as any
          });
          
          console.log('[AUTO-INIT] User challenge created:', userChallenge.id);
          console.log('[AUTO-INIT] Welcome challenge setup complete!');
        } else {
          console.log('[AUTO-INIT] Skipping welcome challenge - user has', allUserChallenges.length, 'total challenges (new users only)');
        }
      } catch (error) {
        console.error('[AUTO-INIT] Auto-initialization failed:', error);
      }

      // Don't update streak here - it should only update on login or challenge completion
      // Fetching user data shouldn't trigger streak changes

      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

  // TEMPORARY: Reset streak endpoint
  app.post("/api/admin/reset-streak", async (req, res) => {
    try {
      const { userId, streak } = req.body;
      
      console.log('[ADMIN] Resetting streak for user:', userId, 'to', streak);
      
      // Get user first (handles email lookup)
      let user = await storage.getUserByEmail(userId);
      if (!user) {
        user = await storage.getUser(userId);
      }
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      console.log('[ADMIN] Found user ID:', user.id);
      
      const updatedUser = await storage.updateUser(user.id, {
        streak: streak || 0,
        last_active_date: new Date().toISOString()
      } as any);
      
      console.log('[ADMIN] Updated streak to:', updatedUser?.streak);
      
      res.json({ message: 'Streak reset successfully', user: updatedUser });
    } catch (error) {
      console.error('[ADMIN] Error resetting streak:', error);
      res.status(500).json({ message: 'Failed to reset streak', error: String(error) });
    }
  });

  // Get streak status
  app.get("/api/user/:userId/streak", async (req, res) => {
    try {
      let userId = req.params.userId;
      if (userId.includes('@')) {
        const user = await storage.getUserByEmail(userId);
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        userId = user.id;
      }

      const { checkStreakAtRisk, getStreakMilestone } = await import('./services/streak-tracker');
      const user = await storage.getUser(userId);
      
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const riskStatus = await checkStreakAtRisk(userId);
      const milestone = getStreakMilestone(user.streak || 0);

      res.json({
        currentStreak: user.streak || 0,
        lastActiveDate: user.lastActiveDate,
        atRisk: riskStatus.atRisk,
        hoursRemaining: riskStatus.hoursRemaining,
        milestone,
      });
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  app.post("/api/user", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Create the user with initial life_protection_score of 0
      const user = await storage.createUser(validatedData);
      
      // Initialize life_protection_score if not set
      if ((user as any).life_protection_score === null || (user as any).life_protection_score === undefined) {
        await storage.updateUser(user.id, { life_protection_score: 0 } as any);
      }
      
      // Create initial challenge if they selected a focus area
      if (user.focusAreas && user.focusAreas.length > 0) {
        try {
          // Create a welcome challenge template
          const welcomeChallenge = await storage.createChallenge({
            title: `Welcome to ${user.focusAreas[0]} Insurance!`,
            description: `Learn the basics of ${user.focusAreas[0]} insurance and start your protection journey.`,
            insuranceCategory: user.focusAreas[0] as string,
            difficulty: 'Easy',
            engagementPoints: 5,
            estimatedDuration: 1,
            requirements: {
              steps: [
                'Complete your profile',
                'Review insurance basics',
                'Set your first protection goal'
              ],
              conditions: {}
            },
            prerequisites: [],
            isActive: true,
          });
          
          // Assign the challenge to the user
          await storage.createUserChallenge({
            userId: user.id,
            templateId: welcomeChallenge.id,
            userData: {
              isWelcomeChallenge: true,
              createdAt: new Date().toISOString()
            } as any
          });
        } catch (error) {
          console.error('Failed to create welcome challenge:', error);
          // Don't fail user creation if challenge creation fails
        }
      }
      
      res.status(201).json({ 
        user
      });
    } catch (error) {
      console.error('User creation error:', error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Challenge routes (formerly mission routes)
  app.get("/api/user/:userId/challenges/active", async (req, res) => {
    try {
      // Check if userId is an email, and get the actual user ID
      let userId = req.params.userId;
      if (userId.includes('@')) {
        const user = await storage.getUserByEmail(userId);
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        userId = user.id;
      }
      
      const challenges = await storage.getActiveChallenges(userId);
      res.json(challenges);
    } catch (error: any) {
      console.error("Error fetching active challenges:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

  app.get("/api/user/:userId/challenges/completed", async (req, res) => {
    try {
      // Check if userId is an email, and get the actual user ID
      let userId = req.params.userId;
      if (userId.includes('@')) {
        const user = await storage.getUserByEmail(userId);
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        userId = user.id;
      }
      
      const allChallenges = await storage.getUserChallenges(userId);
      const completed = allChallenges.filter(c => c.status === 'completed');
      res.json(completed);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/:userId/challenges", async (req, res) => {
    try {
      // Check if userId is an email, and get the actual user ID
      let userId = req.params.userId;
      if (userId.includes('@')) {
        const user = await storage.getUserByEmail(userId);
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        userId = user.id;
      }
      
      const challengeData = insertUserChallengeSchema.parse({
        ...req.body,
        userId: userId
      });
      const challenge = await storage.createUserChallenge(challengeData);
      
      res.status(201).json(challenge);
    } catch (error) {
      res.status(400).json({ message: "Invalid challenge data" });
    }
  });

  app.put("/api/challenges/:challengeId/progress", async (req, res) => {
    try {
      const { progress } = req.body;
      const challenge = await storage.updateChallengeProgress(req.params.challengeId, progress);
      
      
      
      res.json(challenge);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  app.post("/api/challenges/:challengeId/complete", async (req, res) => {
    try {
      // Get the user challenge with template data BEFORE completing it
      const challengeData = await storage.getUserChallenge(req.params.challengeId);
      
      if (!challengeData) {
        console.error('[Challenge Complete] Challenge not found');
        res.status(404).json({ message: "Challenge not found" });
        return;
      }
      
      const userId = (challengeData as any).user_id || (challengeData as any).userId;
      const difficulty = (challengeData as any).difficulty || 'Easy';
      
      // Simple point system based on difficulty
      let scoreIncrease = 5; // Easy/Beginner
      if (difficulty === 'Medium' || difficulty === 'Intermediate') scoreIncrease = 10;
      if (difficulty === 'Hard' || difficulty === 'Advanced') scoreIncrease = 15;
      
      console.log('[Challenge Complete] UserId:', userId, 'Difficulty:', difficulty, 'Score increase:', scoreIncrease);
      console.log('[Challenge Complete] Challenge data:', JSON.stringify(challengeData, null, 2));
      
      // Complete the challenge
      const challenge = await storage.completeChallenge(req.params.challengeId, scoreIncrease);
      
      if (!challenge) {
        res.status(404).json({ message: "Failed to complete challenge" });
        return;
      }
      
      // Update Life Protection Score (simple increment, capped at 100)
      const user = await storage.getUser(userId);
      const currentScore = (user as any)?.life_protection_score || 0;
      const newScore = Math.min(100, currentScore + scoreIncrease);
      
      await storage.updateUser(userId, {
        life_protection_score: newScore
      } as any);
      
      console.log(`[Challenge Complete] Life Protection Score: ${currentScore} → ${newScore} (+${scoreIncrease})`);
      
      // Update daily streak
      let streakUpdate;
      try {
        const { updateDailyStreak } = await import('./services/streak-tracker');
        streakUpdate = await updateDailyStreak(userId);
        console.log('[Streak Update]', streakUpdate.message);
      } catch (error) {
        console.error('Error updating streak:', error);
      }
      
      res.json({ 
        challenge,
        lifeProtectionScore: newScore,
        scoreIncrease,
        streak: streakUpdate
      });
    } catch (error) {
      console.error('Challenge completion error:', error);
      res.status(400).json({ message: "Failed to complete challenge" });
    }
  });

  // Smart Advisor AI Endpoints
  app.post("/api/smart-advisor/generate-challenge", async (req, res) => {
    try {
      const { generatePersonalizedChallenge, buildUserContext } = await import("./ai/smart-advisor");
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      // Get user data
      const user = await storage.getUserByEmail(userId) || await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get recent challenges
      const allChallenges = await storage.getUserChallenges(user.id);
      const recentChallenges = allChallenges.filter(c => c.status === 'completed');

      // Build context and generate challenge
      const context = buildUserContext(user, recentChallenges.slice(0, 5));
      const challenge = await generatePersonalizedChallenge(context);

      if (!challenge) {
        return res.status(503).json({ message: "AI service unavailable" });
      }

      res.json(challenge);
    } catch (error: any) {
      console.error("Smart Advisor challenge generation error:", error);
      res.status(500).json({ message: "Failed to generate challenge", error: error.message });
    }
  });

  app.post("/api/smart-advisor/generate-nudge", async (req, res) => {
    try {
      const { generateAdvisorNudge, buildUserContext } = await import("./ai/smart-advisor");
      const { userId, stage } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      if (!stage || !['week1', 'week2-3', 'month1+', 'inactive'].includes(stage)) {
        return res.status(400).json({ message: "Invalid stage. Must be: week1, week2-3, month1+, or inactive" });
      }

      // Get user data
      const user = await storage.getUserByEmail(userId) || await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get recent challenges
      const allChallenges = await storage.getUserChallenges(user.id);
      const recentChallenges = allChallenges.filter(c => c.status === 'completed');

      // Build context and generate nudge
      const context = buildUserContext(user, recentChallenges.slice(0, 5));
      const nudge = await generateAdvisorNudge(context, stage as any);

      res.json(nudge);
    } catch (error: any) {
      console.error("Smart Advisor nudge generation error:", error);
      res.status(500).json({ message: "Failed to generate nudge", error: error.message });
    }
  });

  app.post("/api/smart-advisor/auto-message", async (req, res) => {
    try {
      const { generateAdvisorNudge, buildUserContext } = await import("./ai/smart-advisor");
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      // Get user data
      const user = await storage.getUserByEmail(userId) || await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Determine user stage based on activity
      const allChallenges = await storage.getUserChallenges(user.id);
      const recentChallenges = allChallenges.filter(c => c.status === 'completed');
      const lastActive = user.lastActiveDate ? Math.floor((Date.now() - new Date(user.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      let stage: 'week1' | 'week2-3' | 'month1+' | 'inactive';
      if (lastActive > 5) {
        stage = 'inactive';
      } else if (recentChallenges.length >= 10) {
        stage = 'month1+';
      } else if (recentChallenges.length >= 3) {
        stage = 'week2-3';
      } else {
        stage = 'week1';
      }

      // Build context and generate nudge
      const context = buildUserContext(user, recentChallenges.slice(0, 5));
      const nudge = await generateAdvisorNudge(context, stage);

      // Save interaction to database
      const interaction = await storage.createSmartAdvisorInteraction({
        userId: user.id,
        type: nudge.type,
        message: nudge.message,
        context: { stage, lastActive, challengeCount: recentChallenges.length } as any,
      });

      res.json({ nudge, interaction, stage });
    } catch (error: any) {
      console.error("Smart Advisor auto-message error:", error);
      res.status(500).json({ message: "Failed to generate message", error: error.message });
    }
  });

  // Smart Advisor Chat Endpoint
  app.post("/api/smart-advisor/chat", async (req, res) => {
    try {
      const { message, userId } = req.body;

      if (!message || !userId) {
        res.status(400).json({ message: "Message and userId are required" });
        return;
      }

      // Get user data for context
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Get COMPLETE user context for AI
      const lifeProtectionScore = (user as any).life_protection_score || 0;
      const currentStreak = user.streak || 0;
      
      // Calculate protection level
      let protectionLevel = 'Beginner';
      if (lifeProtectionScore > 80) protectionLevel = 'Diamond';
      else if (lifeProtectionScore > 60) protectionLevel = 'Gold';
      else if (lifeProtectionScore > 40) protectionLevel = 'Silver';
      else if (lifeProtectionScore > 20) protectionLevel = 'Bronze';

      // Get all challenges
      const allChallenges = await storage.getUserChallenges(userId);
      const completedChallenges = allChallenges.filter(c => c.status === 'completed');
      const activeChallenges = allChallenges.filter(c => c.status === 'active' || c.status === 'in_progress');
      
      // Get challenge categories breakdown
      const challengesByCategory = completedChallenges.reduce((acc: any, c: any) => {
        const cat = c.insuranceCategory || 'other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      // Build COMPREHENSIVE system prompt with ALL user data
      const systemPrompt = `You are QIC's Smart Advisor, an AI insurance expert helping users build their Life Protection Score.

COMPLETE USER PROFILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${user.name || user.username}
Email: ${user.email}

PROTECTION STATUS:
• Life Protection Score: ${lifeProtectionScore}/100 (${protectionLevel} Level 💎)
• Current Streak: ${currentStreak} days 🔥
• Total Challenges Completed: ${completedChallenges.length}
• Active Challenges: ${activeChallenges.length}

FOCUS AREAS: ${user.focusAreas?.join(', ') || 'motor, health, travel'}

CHALLENGE HISTORY BY CATEGORY:
${Object.entries(challengesByCategory).map(([cat, count]) => `• ${cat}: ${count} completed`).join('\n') || '• No challenges completed yet'}

RECENT ACTIVITY:
${completedChallenges.slice(-3).map((c: any, i: number) => `${i + 1}. "${c.title || 'Challenge'}" - ${c.insuranceCategory || 'general'}`).join('\n') || 'No recent activity'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR ROLE:
- Provide insights about their protection status
- Rate their profile based on ACTUAL data above
- Answer questions about their statistics
- Suggest improvements based on their focus areas
- Be ${(user as any).advisor_tone || 'balanced'} in tone
- Reference their REAL data (don't make up numbers)
- Keep responses concise but informative (3-4 sentences)

When rating profile: Consider score, streak, completed challenges, and focus area coverage.
When showing stats: Use the EXACT numbers from their profile above.`;

      // Import AI client
      const { generateAIResponse } = await import("./ai/client");
      
      // Generate AI response
      const aiResponse = await generateAIResponse(
        systemPrompt,
        message,
        { temperature: 0.7, maxTokens: 250 }
      );

      if (!aiResponse) {
        // Fallback response
        res.json({ 
          response: "I'm here to help! Could you tell me more about what you're looking for? I can rate your profile, show your stats, suggest challenges, or explain insurance concepts." 
        });
        return;
      }

      res.json({ response: aiResponse });
    } catch (error: any) {
      console.error("Smart Advisor chat error:", error);
      res.status(500).json({ message: "Failed to process message", error: error.message });
    }
  });

  // AI Mission Suggestion Endpoint
  // Smart Advisor - Suggest Challenge (with FULL user context)
  app.post("/api/smart-advisor/suggest-challenge", async (req, res) => {
    try {
      const { userId, context } = req.body;

      if (!userId) {
        res.status(400).json({ message: "userId is required" });
        return;
      }

      // Get user data
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Get COMPLETE user context
      const lifeProtectionScore = (user as any).life_protection_score || 0;
      const currentStreak = user.streak || 0;
      
      // Calculate protection level
      let protectionLevel = 'Beginner';
      if (lifeProtectionScore > 80) protectionLevel = 'Diamond';
      else if (lifeProtectionScore > 60) protectionLevel = 'Gold';
      else if (lifeProtectionScore > 40) protectionLevel = 'Silver';
      else if (lifeProtectionScore > 20) protectionLevel = 'Bronze';

      // Get all challenges (completed and active)
      const allChallenges = await storage.getUserChallenges(userId);
      const completedChallenges = allChallenges.filter(c => c.status === 'completed');
      const activeChallenges = allChallenges.filter(c => c.status === 'active' || c.status === 'in_progress');
      
      // Get challenge categories breakdown
      const challengesByCategory = completedChallenges.reduce((acc: any, c: any) => {
        const cat = c.insuranceCategory || 'other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      // Build COMPREHENSIVE system prompt
      const systemPrompt = `You are QIC's Smart Advisor, an AI insurance expert helping users build their Life Protection Score.

COMPLETE USER PROFILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${user.name || user.username}
Email: ${user.email}

PROTECTION STATUS:
• Life Protection Score: ${lifeProtectionScore}/100 (${protectionLevel} Level)
• Current Streak: ${currentStreak} days 🔥
• Total Challenges Completed: ${completedChallenges.length}
• Active Challenges: ${activeChallenges.length}

FOCUS AREAS: ${user.focusAreas?.join(', ') || 'motor, health, travel'}

CHALLENGE HISTORY BY CATEGORY:
${Object.entries(challengesByCategory).map(([cat, count]) => `• ${cat}: ${count} completed`).join('\n') || '• None yet'}

RECENT CHALLENGES:
${completedChallenges.slice(-5).map((c: any, i: number) => `${i + 1}. "${c.title || 'Challenge'}" - ${c.insuranceCategory || 'general'}`).join('\n') || 'None yet'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR TASK: Generate ONE new insurance challenge that:
1. Is HIGHLY RELEVANT to their focus areas: ${user.focusAreas?.join(', ') || 'motor, health, travel'}
2. Matches their ${protectionLevel} level (not too easy, not too hard)
3. Is DIFFERENT from their recent challenges
4. Teaches something valuable about insurance
5. Has clear, actionable steps
6. Fits their current score range (${lifeProtectionScore}/100)

DIFFICULTY & POINTS:
• Easy (+5 pts): Basic concepts, quick tasks (for scores 0-30)
• Medium (+10 pts): Moderate complexity, research needed (for scores 31-60)
• Hard (+15 pts): Advanced topics, detailed analysis (for scores 61-100)

RESPOND WITH ONLY THIS JSON (no markdown, no code blocks):
{
  "title": "Engaging title (4-8 words, insurance-related)",
  "description": "Clear explanation of what they'll learn and accomplish (2-3 sentences)",
  "category": "${user.focusAreas?.[0] || 'motor'}",
  "difficulty": "Easy" | "Medium" | "Hard",
  "engagementPoints": 5 | 10 | 15,
  "estimatedDuration": 1 | 2 | 3,
  "steps": ["Specific actionable step 1", "Specific actionable step 2", "Specific actionable step 3"]
}`;

      const userPrompt = context || "Suggest a new mission based on my profile and current progress.";

      // Import AI client
      const { generateStructuredResponse } = await import("./ai/client");
      
      // Generate mission suggestion
      const suggestion = await generateStructuredResponse<{
        title: string;
        description: string;
        category: string;
        difficulty: string;
        engagementPoints: number;
        estimatedDuration: number;
        steps: string[];
      }>(
        systemPrompt,
        userPrompt,
        { temperature: 0.85, maxTokens: 400 }
      );

      if (!suggestion) {
        // Fallback mission
        res.json({ 
          suggestion: {
            title: "Review Your Insurance Coverage",
            description: "Take a comprehensive look at your current insurance policies and identify any gaps in coverage.",
            category: user.focusAreas?.[0] || "motor",
            difficulty: "beginner",
            engagementPoints: 75,
            estimatedDuration: 1,
            steps: [
              "Gather all your insurance policy documents",
              "Review coverage limits and exclusions",
              "Identify any coverage gaps or overlaps"
            ]
          }
        });
        return;
      }

      res.json({ suggestion });
    } catch (error: any) {
      console.error("Mission suggestion error:", error);
      res.status(500).json({ message: "Failed to generate mission", error: error.message });
    }
  });

  // Create Mission from AI Suggestion
  // Smart Advisor - Create Challenge (assigns to user)
  app.post("/api/smart-advisor/create-challenge", async (req, res) => {
    try {
      let { userId, challenge } = req.body;

      if (!userId || !challenge) {
        res.status(400).json({ message: "userId and challenge are required" });
        return;
      }

      // Resolve user ID if it's an email
      if (userId.includes('@')) {
        const user = await storage.getUserByEmail(userId);
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        userId = user.id;
      }

      // Validate challenge structure
      if (!challenge.title || !challenge.description || !challenge.category || !challenge.difficulty) {
        res.status(400).json({ message: "Invalid challenge structure" });
        return;
      }

      console.log('[Smart Advisor] Creating challenge:', challenge.title, 'for user:', userId);

      // Create challenge template
      const template = await storage.createChallenge({
        title: challenge.title,
        description: challenge.description,
        insuranceCategory: challenge.category,
        difficulty: challenge.difficulty,
        engagementPoints: challenge.engagementPoints || 5,
        estimatedDuration: challenge.estimatedDuration || 2,
        requirements: {
          steps: challenge.steps || [],
          conditions: {}
        },
        prerequisites: [],
        isActive: true,
      });

      console.log('[Smart Advisor] Template created:', template.id);

      // Create user challenge (assign it to the user)
      const userChallenge = await storage.createUserChallenge({
        userId,
        templateId: template.id,
        userData: {
          aiGenerated: true,
          createdAt: new Date().toISOString()
        } as any
      });

      console.log('[Smart Advisor] User challenge created:', userChallenge?.id);

      res.json({ 
        message: "Challenge created successfully!",
        template,
        userChallenge 
      });
    } catch (error: any) {
      console.error("[Smart Advisor] Challenge creation error:", error);
      res.status(500).json({ message: "Failed to create challenge", error: error.message });
    }
  });

  // Manual trigger for daily challenge generation (for testing)
  app.post("/api/admin/generate-daily-challenges", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      let generated = 0;
      
      for (const user of users) {
        if (!user.focusAreas || user.focusAreas.length === 0) continue;
        
        const focusArea = user.focusAreas[Math.floor(Math.random() * user.focusAreas.length)];
        const lifeProtectionScore = (user as any).lifeProtectionScore || 0;
        
        // Determine difficulty based on score
        let difficulty = 'Easy';
        let points = 5;
        if (lifeProtectionScore > 60) { difficulty = 'Hard'; points = 15; }
        else if (lifeProtectionScore > 30) { difficulty = 'Medium'; points = 10; }
        
        const systemPrompt = `Create a unique daily insurance challenge for a user interested in ${focusArea}.
Protection Score: ${lifeProtectionScore}/100, Tone: ${(user as any).advisor_tone || 'balanced'}

Return ONLY valid JSON:
{
  "title": "Challenge title (unique, engaging)",
  "description": "What they'll learn and accomplish",
  "category": "${focusArea}",
  "difficulty": "${difficulty}",
  "engagementPoints": ${points},
  "estimatedDuration": 2,
  "steps": ["step 1", "step 2", "step 3"]
}`;

        const challenge = await generateStructuredResponse<any>(
          systemPrompt,
          'Generate a unique challenge',
          { temperature: 0.9, maxTokens: 400 }
        );

        if (challenge?.title) {
          const template = await storage.createChallenge({
            title: challenge.title,
            description: challenge.description,
            insuranceCategory: challenge.category || focusArea,
            difficulty: challenge.difficulty || 'beginner',
            engagementPoints: challenge.engagementPoints || 100,
            estimatedDuration: challenge.estimatedDuration || 2,
            requirements: { steps: challenge.steps || [], conditions: {} },
            prerequisites: [],
            isActive: true,
          });

          await storage.createUserChallenge({
            userId: user.id,
            templateId: template.id,
            userData: { aiGenerated: true, dailyChallenge: true } as any
          });

          generated++;
        }
      }

      res.json({ message: `Generated ${generated} daily challenges`, count: generated });
    } catch (error: any) {
      console.error("Daily challenge generation error:", error);
      res.status(500).json({ message: "Failed to generate challenges", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

