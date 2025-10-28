import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/progress-ring";
import { MissionCard } from "@/components/mission-card";
import { 
  Shield, 
  TrendingUp, 
  Trophy, 
  Star, 
  Sparkles,
  ChevronRight,
  Award,
  Target,
  Zap,
  Crown,
  Car,
  Heart,
  Plane,
  Home,
  Users,
  RefreshCw
} from "lucide-react";
import { useUser, useActiveChallenges, useSmartAdvisorInteractions, useProtectionScores, useGenerateAutoMessage, useGenerateAIChallenge } from "@/hooks/use-api";
import { useMissionProgress } from "@/hooks/use-mission-progress";
import { MissionCompletion, XPGainAnimation, LevelUpAnimation } from "@/components/mission-completion";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const categoryIcons = {
  motor: <Car className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
  travel: <Plane className="h-4 w-4" />,
  home: <Home className="h-4 w-4" />,
  life: <Users className="h-4 w-4" />,
};

const tierConfig = {
  bronze: {
    name: "Bronze",
    color: "from-orange-600 to-orange-400",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-600",
    borderColor: "border-orange-500/20",
    icon: Shield,
    range: "0-49",
    perks: ["Basic rewards", "Weekly challenges", "Standard support"]
  },
  silver: {
    name: "Silver",
    color: "from-gray-400 to-gray-300",
    bgColor: "bg-gray-400/10",
    textColor: "text-gray-600",
    borderColor: "border-gray-400/20",
    icon: Award,
    range: "50-69",
    perks: ["Enhanced rewards", "Daily challenges", "Priority support", "Exclusive offers"]
  },
  gold: {
    name: "Gold",
    color: "from-yellow-500 to-yellow-300",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-500/20",
    icon: Trophy,
    range: "70-89",
    perks: ["Premium rewards", "VIP challenges", "24/7 support", "Early access", "Partner discounts"]
  },
  platinum: {
    name: "Platinum",
    color: "from-purple-600 to-purple-400",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600",
    borderColor: "border-purple-500/20",
    icon: Crown,
    range: "90-100",
    perks: ["Elite rewards", "Custom challenges", "Dedicated advisor", "Maximum benefits", "VIP events"]
  }
};

const mockMilestones = [
  { id: 1, name: "First Steps", icon: Target, unlocked: true, description: "Complete your first challenge" },
  { id: 2, name: "Motor Pro", icon: Car, unlocked: true, description: "Complete 5 motor challenges" },
  { id: 3, name: "Health Guardian", icon: Heart, unlocked: false, description: "Maintain health coverage for 6 months" },
  { id: 4, name: "Loyalty Star", icon: Star, unlocked: false, description: "3 consecutive policy renewals" },
];

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  
  // API hooks
  const userId = authUser?.email || "user-123";
  const { data: user, isLoading: userLoading } = useUser(userId);
  const { data: activeChallenges = [], isLoading: challengesLoading } = useActiveChallenges(userId);
  const { data: advisorInteractions = [] } = useSmartAdvisorInteractions(userId);
  const { data: protectionScores = [] } = useProtectionScores(userId);
  
  // AI hooks
  const { mutate: generateAutoMessage, isPending: generatingMessage } = useGenerateAutoMessage();
  const { mutate: generateAIChallenge, isPending: generatingChallenge } = useGenerateAIChallenge();

  // Challenge progress tracking
  const { 
    updateMissionProgress, 
    completeMissionWithRewards,
    showCompletion,
    showXPGain,
    showLevelUp,
    completionData,
    xpGain,
    newLevel,
    handleCompletionClose,
    handleXPAnimationComplete,
    handleLevelUpAnimationComplete
  } = useMissionProgress();

  // Calculate overall protection score (mock for now)
  const protectionScore = user?.protectionScore || 76;
  const currentTier = protectionScore >= 90 ? "platinum" : 
                     protectionScore >= 70 ? "gold" : 
                     protectionScore >= 50 ? "silver" : "bronze";
  const tier = tierConfig[currentTier as keyof typeof tierConfig];
  const nextTierThreshold = protectionScore >= 90 ? 100 : 
                           protectionScore >= 70 ? 90 : 
                           protectionScore >= 50 ? 70 : 50;
  const pointsToNextTier = nextTierThreshold - protectionScore;

  // Smart Advisor messages - use real AI interactions or fallbacks
  const advisorMessages = advisorInteractions.length > 0 ? advisorInteractions.slice(0, 3).map((interaction: any) => ({
    id: interaction.id,
    type: interaction.type || "nudge",
    message: interaction.message,
    timestamp: interaction.createdAt || new Date().toISOString(),
  })) : [
    {
      id: 1,
      type: "celebration",
      message: "🎉 Welcome to QIC LifeQuest! Generate your first AI-powered challenge below.",
      timestamp: new Date().toISOString(),
    },
  ];
  
  // Handle AI message generation
  const handleGenerateMessage = () => {
    generateAutoMessage({ userId }, {
      onSuccess: (data) => {
        console.log("Generated AI message:", data);
      },
      onError: (error) => {
        console.error("Failed to generate message:", error);
      }
    });
  };
  
  // Handle AI challenge generation
  const handleGenerateChallenge = () => {
    generateAIChallenge({ userId }, {
      onSuccess: (data) => {
        console.log("Generated AI challenge:", data);
      },
      onError: (error) => {
        console.error("Failed to generate challenge:", error);
      }
    });
  };

  // Convert challenges
  const challengeCards = activeChallenges.map((challenge: any) => ({
    id: challenge.id,
    title: challenge.title || "Challenge",
    category: challenge.insuranceCategory || "motor",
    progress: challenge.progress || 0,
    xpReward: challenge.engagementPointsEarned || 50,
    timeLeft: challenge.timeLeft || "Active",
    icon: categoryIcons[challenge.insuranceCategory as keyof typeof categoryIcons] || <Car className="h-4 w-4" />,
  }));

  const handleChallengeClick = (challenge: any) => {
    setSelectedChallenge(challenge.id);
    if (challenge.progress < 100) {
      const newProgress = Math.min(challenge.progress + 25, 100);
      updateMissionProgress(challenge.id, newProgress);
      if (newProgress >= 100) {
        setTimeout(() => completeMissionWithRewards(challenge.id, challenge.xpReward || 100), 1000);
      }
    }
  };

  if (userLoading || challengesLoading) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Engagement Hub...</p>
        </div>
      </div>
    );
  }

  const TierIcon = tier.icon;

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-muted/20" data-testid="page-dashboard">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Engagement Hub</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name || "User"}!</p>
            </div>
            <Badge className={`${tier.bgColor} ${tier.textColor} border ${tier.borderColor} px-4 py-2`}>
              <TierIcon className="h-4 w-4 mr-2" />
              {tier.name} Tier
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Protection Score Overview */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Your Protection Score</h2>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {protectionScore}
                </span>
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Tier: {tier.name}</span>
                  <span className="font-semibold">{tier.range} points</span>
                </div>
                
                {pointsToNextTier > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">
                      Just <strong className="text-foreground">{pointsToNextTier} points</strong> away from{" "}
                      {protectionScore >= 90 ? "perfect score" : 
                       protectionScore >= 70 ? "Platinum" : 
                       protectionScore >= 50 ? "Gold" : "Silver"} Tier!
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Your Perks:</p>
                <div className="flex flex-wrap gap-2">
                  {tier.perks.map((perk, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {perk}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <ProgressRing progress={protectionScore} size={220} strokeWidth={16} />
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => setLocation("/challenges")}
              >
                <Target className="h-4 w-4 mr-2" />
                Boost Your Score
              </Button>
            </div>
          </div>
        </Card>

        {/* Active Challenges */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Active Challenges
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation("/challenges")}
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {challengeCards.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
              {challengeCards.map((challenge: any) => (
                <div key={challenge.id} className="min-w-[300px]">
                  <MissionCard
                    {...challenge}
                    onClick={() => handleChallengeClick(challenge)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-muted/20">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No active challenges</p>
              <Button onClick={() => setLocation("/challenges")}>
                Start Your First Challenge
              </Button>
            </Card>
          )}
        </div>

        {/* Smart Advisor Feed */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Smart Advisor Insights</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateMessage}
                disabled={generatingMessage}
                className="flex-1 sm:flex-none"
              >
                {generatingMessage ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    New AI Insight
                  </>
                )}
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleGenerateChallenge}
                disabled={generatingChallenge}
                className="flex-1 sm:flex-none"
              >
                {generatingChallenge ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-2" />
                    AI Challenge
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {advisorMessages.map((msg: any) => (
              <Card key={msg.id} className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-l-primary">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    msg.type === "celebration" ? "bg-green-500/10" :
                    msg.type === "reminder" ? "bg-orange-500/10" :
                    "bg-blue-500/10"
                  }`}>
                    {msg.type === "celebration" ? (
                      <Trophy className="h-4 w-4 text-green-600" />
                    ) : msg.type === "reminder" ? (
                      <Zap className="h-4 w-4 text-orange-600" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setLocation("/advisor-chat")}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Chat with Smart Advisor
          </Button>
        </Card>

        {/* Rewards & Milestones */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Milestones Unlocked
            </h3>
            <div className="space-y-3">
              {mockMilestones.map((milestone) => {
                const MilestoneIcon = milestone.icon;
                return (
                  <div 
                    key={milestone.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      milestone.unlocked 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-muted/20 border-muted opacity-60"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      milestone.unlocked ? "bg-primary/20" : "bg-muted"
                    }`}>
                      <MilestoneIcon className={`h-4 w-4 ${
                        milestone.unlocked ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{milestone.name}</p>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    </div>
                    {milestone.unlocked && (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setLocation("/rewards")}>
              View All Milestones
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Next Milestone
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-full bg-yellow-500/20">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-bold">Loyalty Star</p>
                    <p className="text-sm text-muted-foreground">3 consecutive policy renewals</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-semibold">2/3</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400" style={{ width: '66%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reward: <span className="font-semibold text-yellow-600">200 bonus points + exclusive badge</span>
                  </p>
                </div>
              </div>

              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Keep up the momentum! One more renewal to unlock.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Progress Animations */}
      {showCompletion && completionData && (
        <MissionCompletion
          isOpen={showCompletion}
          onClose={handleCompletionClose}
          mission={completionData}
        />
      )}
      
      {showXPGain && (
        <XPGainAnimation
          xp={xpGain}
          onComplete={handleXPAnimationComplete}
        />
      )}
      
      {showLevelUp && (
        <LevelUpAnimation
          newLevel={newLevel}
          onComplete={handleLevelUpAnimationComplete}
        />
      )}
    </div>
  );
}
