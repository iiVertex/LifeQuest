import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProgressRing } from "@/components/progress-ring";
import { MissionCard } from "@/components/mission-card";
import { ChallengeDetailDialog } from "@/components/challenge-detail-dialog";
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
  RefreshCw,
  Flame,
  AlertCircle,
  Languages as LanguagesIcon
} from "lucide-react";
import { useUser, useActiveChallenges, useSmartAdvisorInteractions, useGenerateAutoMessage, useGenerateAIChallenge } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useTranslation } from "@/lib/translation-provider";

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
    nameAr: "برونزي",
    color: "from-orange-600 to-orange-400",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-600",
    borderColor: "border-orange-500/20",
    icon: Shield,
    range: "0-249",
    perks: ["Basic rewards", "Weekly challenges", "Standard support"]
  },
  silver: {
    name: "Silver",
    nameAr: "فضي",
    color: "from-gray-400 to-gray-300",
    bgColor: "bg-gray-400/10",
    textColor: "text-gray-600",
    borderColor: "border-gray-400/20",
    icon: Award,
    range: "250-499",
    perks: ["Enhanced rewards", "Daily challenges", "Priority support", "Exclusive offers"]
  },
  gold: {
    name: "Gold",
    nameAr: "ذهبي",
    color: "from-yellow-500 to-yellow-300",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-500/20",
    icon: Trophy,
    range: "500-749",
    perks: ["Premium rewards", "VIP challenges", "24/7 support", "Early access", "Partner discounts"]
  },
  platinum: {
    name: "Platinum",
    nameAr: "بلاتيني",
    color: "from-purple-600 to-purple-400",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600",
    borderColor: "border-purple-500/20",
    icon: Crown,
    range: "750-1000",
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
  const { t, dir, language, setLanguage } = useTranslation();
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  
  // API hooks
  const userId = authUser?.email || "user-123";
  const { data: user, isLoading: userLoading } = useUser(userId);
  const { data: activeChallenges = [], isLoading: challengesLoading, refetch: refetchChallenges } = useActiveChallenges(userId);
  const { data: advisorInteractions = [] } = useSmartAdvisorInteractions(userId);
  
  // AI hooks
  const { mutate: generateAutoMessage, isPending: generatingMessage } = useGenerateAutoMessage();
  const { mutate: generateAIChallenge, isPending: generatingChallenge } = useGenerateAIChallenge();
  
  // Calculate overall protection score from user's Life Protection Score (0-100)
  const protectionScore = (user as any)?.life_protection_score ?? 0;
  
  // Calculate protection level badge based on score (NEW 0-1000 SCALE)
  const protectionLevel = 
    protectionScore >= 750 ? { name: "Platinum", icon: "💎", desc: "Elite Protection" } :
    protectionScore >= 500 ? { name: "Gold", icon: "🥇", desc: "Highly Protected" } :
    protectionScore >= 250 ? { name: "Silver", icon: "🥈", desc: "Well Protected" } :
    { name: "Bronze", icon: "🥉", desc: "Building Protection" };
  
  const currentTier = protectionScore >= 750 ? "platinum" : 
                     protectionScore >= 500 ? "gold" : 
                     protectionScore >= 250 ? "silver" : "bronze";
  const tier = tierConfig[currentTier as keyof typeof tierConfig];
  const nextTierThreshold = protectionScore >= 750 ? 1000 : 
                           protectionScore >= 500 ? 750 : 
                           protectionScore >= 250 ? 500 : 250;
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

  // Convert challenges for display
  const challengeCards = activeChallenges.map((challenge: any) => ({
    id: challenge.id,
    title: challenge.title || "Insurance Challenge",
    category: challenge.insuranceCategory || "motor",
    progress: challenge.progress || 0,
    xpReward: challenge.engagementPoints || 50,
    timeLeft: "Active",
    icon: categoryIcons[challenge.insuranceCategory as keyof typeof categoryIcons] || <Car className="h-4 w-4" />,
  }));

  const handleChallengeClick = (challenge: any) => {
    // Find the full challenge data from activeChallenges
    const fullChallenge = activeChallenges.find((c: any) => c.id === challenge.id);
    setSelectedChallenge(fullChallenge);
    setChallengeDialogOpen(true);
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      // Complete the challenge
      const response = await fetch(`/api/challenges/${challengeId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to complete challenge');

      const data = await response.json();
      
      // Refetch challenges to update UI
      await refetchChallenges();
      
      // Close dialog and show success
      setChallengeDialogOpen(false);
      
      // You could add a toast notification here
      console.log(`Challenge completed! +${data.scoreIncrease} points`, data);
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  if (userLoading || challengesLoading) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center bg-gradient-to-b from-background to-muted/20" dir={dir}>
        <div className="text-center space-y-6 max-w-md px-4">
          {/* Animated Logo/Icon */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-primary/20 rounded-full animate-ping"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <Shield className="h-24 w-24 text-primary animate-pulse" />
            </div>
          </div>
          
          {/* Loading Text */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('Setting up your dashboard...', 'جاري إعداد لوحة التحكم...')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {userLoading && t('Loading your profile', 'تحميل ملفك الشخصي')}
              {challengesLoading && !userLoading && t('Loading your challenges', 'تحميل التحديات الخاصة بك')}
            </p>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const TierIcon = tier.icon;

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-muted/20" data-testid="page-dashboard" dir={dir}>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-primary-foreground text-lg">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">
                  {t('Welcome back', 'مرحباً بعودتك')}
                </p>
                <h1 className="text-2xl font-bold">
                  {user?.name || t("User", "المستخدم")}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Streak Badge */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {user?.streak || 0}
                </span>
              </div>
              
              {/* Tier Badge */}
              <Badge className={`${tier.bgColor} ${tier.textColor} border ${tier.borderColor} px-4 py-2`}>
                <TierIcon className="h-4 w-4 mr-2" />
                {language === 'ar' ? (tier.nameAr || tier.name) : tier.name}
              </Badge>
            </div>
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
                <span className="text-2xl text-muted-foreground">/1000</span>
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
                      {protectionScore >= 750 ? "perfect score" : 
                       protectionScore >= 500 ? "Platinum" : 
                       protectionScore >= 250 ? "Gold" : "Silver"} Tier!
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
              <ProgressRing progress={protectionScore} size={220} strokeWidth={16}>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-1">{protectionScore}</div>
                  <div className="text-sm text-muted-foreground mb-2">Life Protection</div>
                  <div className="text-lg font-semibold flex items-center gap-1">
                    <span>{protectionLevel.icon}</span>
                    <span>{protectionLevel.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{protectionLevel.desc}</div>
                </div>
              </ProgressRing>
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
      
      {/* Challenge Detail Dialog */}
      <ChallengeDetailDialog
        open={challengeDialogOpen}
        onOpenChange={setChallengeDialogOpen}
        challenge={selectedChallenge}
        onComplete={handleCompleteChallenge}
      />
    </div>
  );
}
