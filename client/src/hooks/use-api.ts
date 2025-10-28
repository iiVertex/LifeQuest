import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";

// User hooks
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const response = await fetch(`${API_BASE}/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
};

// Challenge hooks
export const useActiveChallenges = (userId: string) => {
  return useQuery({
    queryKey: ["challenges", "active", userId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/user/${userId}/challenges/active`);
      if (!response.ok) throw new Error("Failed to fetch active challenges");
      return response.json();
    },
  });
};

export const useCompletedChallenges = (userId: string) => {
  return useQuery({
    queryKey: ["challenges", "completed", userId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/user/${userId}/challenges/completed`);
      if (!response.ok) throw new Error("Failed to fetch completed challenges");
      return response.json();
    },
  });
};

export const useCreateChallenge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, templateId, userData }: { userId: string; templateId: string; userData?: any }) => {
      const response = await fetch(`${API_BASE}/user/${userId}/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, userData }),
      });
      if (!response.ok) throw new Error("Failed to create challenge");
      return response.json();
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["challenges", "active", userId] });
    },
  });
};

export const useUpdateChallengeProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      const response = await fetch(`${API_BASE}/challenges/${challengeId}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress }),
      });
      if (!response.ok) throw new Error("Failed to update challenge progress");
      return response.json();
    },
    onSuccess: (_, { challengeId }) => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
};

export const useCompleteChallenge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ challengeId, engagementPointsEarned }: { challengeId: string; engagementPointsEarned: number }) => {
      const response = await fetch(`${API_BASE}/challenges/${challengeId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engagementPointsEarned }),
      });
      if (!response.ok) throw new Error("Failed to complete challenge");
      return response.json();
    },
    onSuccess: (_, { challengeId }) => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// Challenge templates
export const useChallengeTemplates = (insuranceCategory?: string) => {
  return useQuery({
    queryKey: ["challenge-templates", insuranceCategory],
    queryFn: async () => {
      const url = insuranceCategory 
        ? `${API_BASE}/challenge-templates?insuranceCategory=${insuranceCategory}`
        : `${API_BASE}/challenge-templates`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch challenge templates");
      return response.json();
    },
  });
};

export const useRecommendedChallenges = (userId: string) => {
  return useQuery({
    queryKey: ["challenges", "recommended", userId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/user/${userId}/challenges/recommended`);
      if (!response.ok) throw new Error("Failed to fetch recommended challenges");
      return response.json();
    },
  });
};

// Skill tree hooks
export const useSkillTreeNodes = (category: string) => {
  return useQuery({
    queryKey: ["skill-tree", category],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/skill-tree/${category}`);
      if (!response.ok) throw new Error("Failed to fetch skill tree nodes");
      return response.json();
    },
  });
};

export const useUserSkillProgress = (userId: string, category: string) => {
  return useQuery({
    queryKey: ["skill-tree", "progress", userId, category],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/user/${userId}/skill-tree/${category}`);
      if (!response.ok) throw new Error("Failed to fetch skill progress");
      return response.json();
    },
  });
};

export const useUnlockSkillNode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, nodeId }: { userId: string; nodeId: string }) => {
      const response = await fetch(`${API_BASE}/user/${userId}/skill-tree/${nodeId}/unlock`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to unlock skill node");
      return response.json();
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["skill-tree", "progress", userId] });
    },
  });
};

// Smart Advisor hooks
export const useSmartAdvisorInteractions = (userId: string) => {
  return useQuery({
    queryKey: ["smart-advisor-interactions", userId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/user/${userId}/smart-advisor/interactions`);
      if (!response.ok) throw new Error("Failed to fetch Smart Advisor interactions");
      return response.json();
    },
  });
};

export const useCreateSmartAdvisorInteraction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, type, message, context }: { 
      userId: string; 
      type: string; 
      message: string; 
      context?: any 
    }) => {
      const response = await fetch(`${API_BASE}/user/${userId}/smart-advisor/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, context }),
      });
      if (!response.ok) throw new Error("Failed to create Smart Advisor interaction");
      return response.json();
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["smart-advisor-interactions", userId] });
    },
  });
};

// Protection Score hooks
export const useProtectionScores = (userId: string) => {
  return useQuery({
    queryKey: ["protection-scores", userId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/user/${userId}/protection-scores`);
      if (!response.ok) throw new Error("Failed to fetch protection scores");
      return response.json();
    },
  });
};

export const useUpdateProtectionScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      insuranceCategory, 
      score, 
      factors 
    }: { 
      userId: string; 
      insuranceCategory: string; 
      score: number; 
      factors: { activePolicies: number; engagement: number; productDiversity: number } 
    }) => {
      const response = await fetch(`${API_BASE}/user/${userId}/protection-scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insuranceCategory, score, factors }),
      });
      if (!response.ok) throw new Error("Failed to update protection score");
      return response.json();
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["protection-scores", userId] });
    },
  });
};

// Engagement Points and leveling
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch(`${API_BASE}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useAddEngagementPoints = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, engagementPoints }: { userId: string; engagementPoints: number }) => {
      const response = await fetch(`${API_BASE}/user/${userId}/engagement-points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engagementPoints }),
      });
      if (!response.ok) throw new Error("Failed to add engagement points");
      return response.json();
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
};

// Smart Advisor AI Hooks
export const useGenerateAIChallenge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const response = await fetch(`${API_BASE}/smart-advisor/generate-challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to generate AI challenge");
      return response.json();
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["challenges", "active", userId] });
    },
  });
};

export const useGenerateAINudge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, stage }: { userId: string; stage: 'week1' | 'week2-3' | 'month1+' | 'inactive' }) => {
      const response = await fetch(`${API_BASE}/smart-advisor/generate-nudge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, stage }),
      });
      if (!response.ok) throw new Error("Failed to generate AI nudge");
      return response.json();
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["smart-advisor-interactions", userId] });
    },
  });
};

export const useGenerateAutoMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const response = await fetch(`${API_BASE}/smart-advisor/auto-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to generate auto message");
      return response.json();
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["smart-advisor-interactions", userId] });
    },
  });
};
