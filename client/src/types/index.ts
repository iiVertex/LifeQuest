// Type definitions for the AI Lifestyle Companion app

export interface Mission {
  id: string;
  title: string;
  category: string;
  progress: number;
  xpReward: number;
  timeLeft?: string;
  icon?: React.ReactNode;
}

export interface User {
  id: string;
  name?: string;
  level?: number;
  xp?: number;
  xpToNextLevel?: number;
  streak?: number;
  focusAreas?: string[];
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

export interface AIInteraction {
  id: string;
  type: "nudge" | "celebration" | "guidance" | "insight";
  message: string;
  context?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export interface SkillNode {
  id: string;
  title: string;
  xp: number;
  status: "locked" | "available" | "unlocked" | "completed";
  isRecommended?: boolean;
}

export interface MissionCompletionData {
  title: string;
  xpEarned: number;
  levelUp?: boolean;
  newLevel?: number;
  achievements?: string[];
}
