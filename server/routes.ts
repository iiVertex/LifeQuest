import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserChallengeSchema, insertSmartAdvisorInteractionSchema } from "@shared/schema";
import authRoutes from "./auth/routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.use("/api/auth", authRoutes);

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      // Try to get by email first (from Supabase auth), then by ID
      let user = await storage.getUserByEmail(req.params.id);
      if (!user) {
        user = await storage.getUser(req.params.id);
      }
      
      // If user doesn't exist, create a new one with default values
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

  app.post("/api/user", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
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
      const challenges = await storage.getActiveChallenges(req.params.userId);
      res.json(challenges);
    } catch (error: any) {
      console.error("Error fetching active challenges:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

  app.get("/api/user/:userId/challenges/completed", async (req, res) => {
    try {
      const challenges = await storage.getCompletedChallenges(req.params.userId);
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/:userId/challenges", async (req, res) => {
    try {
      const challengeData = insertUserChallengeSchema.parse({
        ...req.body,
        userId: req.params.userId
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
      const { engagementPointsEarned } = req.body;
      const challenge = await storage.completeChallenge(req.params.challengeId, engagementPointsEarned);
      
      // Award XP to user
      const xpResult = await storage.addXP(challenge.userId, engagementPointsEarned);
      
      res.json({ challenge, xpResult });
    } catch (error) {
      res.status(400).json({ message: "Invalid completion data" });
    }
  });

  // Challenge templates (formerly mission templates)
  app.get("/api/challenge-templates", async (req, res) => {
    try {
      const category = req.query.category as string;
      const templates = await storage.getChallengeTemplates(category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:userId/challenges/recommended", async (req, res) => {
    try {
      const templates = await storage.getRecommendedChallenges(req.params.userId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Skill tree routes
  app.get("/api/skill-tree/:category", async (req, res) => {
    try {
      const nodes = await storage.getSkillTreeNodes(req.params.category);
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:userId/skill-tree/:category", async (req, res) => {
    try {
      const progress = await storage.getUserSkillProgress(req.params.userId, req.params.category);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/:userId/skill-tree/:nodeId/unlock", async (req, res) => {
    try {
      const skillNode = await storage.unlockSkillNode(req.params.userId, req.params.nodeId);
      res.json(skillNode);
    } catch (error) {
      res.status(400).json({ message: "Invalid unlock data" });
    }
  });

  // Milestone routes (formerly achievement routes)
  app.get("/api/milestones", async (req, res) => {
    try {
      const category = req.query.category as string;
      const milestones = await storage.getMilestones(category);
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:userId/milestones", async (req, res) => {
    try {
      const milestones = await storage.getUserMilestones(req.params.userId);
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Smart Advisor routes (formerly AI Companion routes)
  app.get("/api/user/:userId/smart-advisor/interactions", async (req, res) => {
    try {
      const interactions = await storage.getSmartAdvisorInteractions(req.params.userId);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/:userId/smart-advisor/interactions", async (req, res) => {
    try {
      const interactionData = insertSmartAdvisorInteractionSchema.parse({
        ...req.body,
        userId: req.params.userId
      });
      const interaction = await storage.createSmartAdvisorInteraction(interactionData);
      res.status(201).json(interaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid interaction data" });
    }
  });

  app.put("/api/smart-advisor/interactions/:interactionId/read", async (req, res) => {
    try {
      await storage.markInteractionAsRead(req.params.interactionId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Invalid interaction ID" });
    }
  });

  // Protection Score routes (formerly LifeScore routes)
  app.get("/api/user/:userId/protection-scores", async (req, res) => {
    try {
      const scores = await storage.getProtectionScores(req.params.userId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

    // AI Test endpoint
  app.get("/api/test-ai", async (req, res) => {
    try {
      const { isAIAvailable } = await import("./ai/client");
      
      if (!isAIAvailable()) {
        return res.status(503).json({ 
          error: "AI not configured",
          message: "AI_API_KEY not found in environment variables",
          aiAvailable: false
        });
      }

      res.json({
        aiAvailable: true,
        message: "Smart Advisor AI is configured and ready",
        apiKey: process.env.AI_API_KEY ? "✓ Set" : "✗ Missing",
        baseUrl: process.env.AI_BASE_URL || "https://api.deepseek.com",
        model: process.env.AI_MODEL || "deepseek-chat"
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "AI test failed", 
        message: error.message,
        stack: error.stack 
      });
    }
  });

  app.post("/api/user/:userId/protection-scores", async (req, res) => {
    try {
      const { category, score, factors } = req.body;
      const protectionScore = await storage.updateProtectionScore(req.params.userId, category, score, factors);
      res.status(201).json(protectionScore);
    } catch (error) {
      res.status(400).json({ message: "Invalid protection score data" });
    }
  });

  // XP and leveling
  app.post("/api/user/:userId/xp", async (req, res) => {
    try {
      const { xp } = req.body;
      const result = await storage.addXP(req.params.userId, xp);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid XP data" });
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
      const recentChallenges = await storage.getCompletedChallenges(user.id);

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
      const recentChallenges = await storage.getCompletedChallenges(user.id);

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
      const recentChallenges = await storage.getCompletedChallenges(user.id);
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

  const httpServer = createServer(app);
  return httpServer;
}
