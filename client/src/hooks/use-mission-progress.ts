import { useState, useCallback } from "react";
import { useUpdateChallengeProgress, useCompleteChallenge, useAddEngagementPoints } from "./use-api";
import { MissionCompletion, XPGainAnimation, LevelUpAnimation } from "@/components/mission-completion";
import React from "react";

interface MissionProgressState {
  showCompletion: boolean;
  showXPGain: boolean;
  showLevelUp: boolean;
  completionData: any;
  xpGain: number;
  newLevel: number;
}

export function useMissionProgress() {
  const [state, setState] = useState<MissionProgressState>({
    showCompletion: false,
    showXPGain: false,
    showLevelUp: false,
    completionData: null,
    xpGain: 0,
    newLevel: 0,
  });

  const updateProgress = useUpdateChallengeProgress();
  const completeChallenge = useCompleteChallenge();
  const addEngagementPoints = useAddEngagementPoints();

  const updateMissionProgress = useCallback(async (missionId: string, progress: number) => {
    try {
      await updateProgress.mutateAsync({ challengeId: missionId, progress });
      
      // Show XP gain animation for progress milestones
      if (progress > 0 && progress % 25 === 0) {
        const xpGain = Math.floor(progress / 25) * 10; // 10 engagement points per 25% progress
        setState(prev => ({
          ...prev,
          showXPGain: true,
          xpGain
        }));
      }
    } catch (error) {
      console.error("Failed to update challenge progress:", error);
    }
  }, [updateProgress]);

  const completeMissionWithRewards = useCallback(async (missionId: string, xpEarned: number) => {
    try {
      const result = await completeChallenge.mutateAsync({ challengeId: missionId, engagementPointsEarned: xpEarned });
      
      // Show completion animation
      setState(prev => ({
        ...prev,
        showCompletion: true,
        completionData: {
          title: "Challenge Complete!",
          xpEarned,
          levelUp: result.xpResult?.leveledUp || false,
          newLevel: result.xpResult?.newLevel || 0,
          achievements: [] // Would be populated from milestones system
        }
      }));

      // If user leveled up, show level up animation
      if (result.xpResult?.leveledUp) {
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            showLevelUp: true,
            newLevel: result.xpResult.newLevel
          }));
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to complete challenge:", error);
    }
  }, [completeChallenge]);

  const handleXPAnimationComplete = useCallback(() => {
    setState(prev => ({ ...prev, showXPGain: false }));
  }, []);

  const handleLevelUpAnimationComplete = useCallback(() => {
    setState(prev => ({ ...prev, showLevelUp: false }));
  }, []);

  const handleCompletionClose = useCallback(() => {
    setState(prev => ({ ...prev, showCompletion: false }));
  }, []);

  return {
    updateMissionProgress,
    completeMissionWithRewards,
    isUpdating: updateProgress.isPending,
    isCompleting: completeChallenge.isPending,
    // State for components to use
    showCompletion: state.showCompletion,
    showXPGain: state.showXPGain,
    showLevelUp: state.showLevelUp,
    completionData: state.completionData,
    xpGain: state.xpGain,
    newLevel: state.newLevel,
    // Handlers
    handleCompletionClose,
    handleXPAnimationComplete,
    handleLevelUpAnimationComplete,
  };
}
