import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RewardBadge } from "@/components/reward-badge";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/progress-ring";
import { Shield, Flame, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUser, useCompletedChallenges } from "@/hooks/use-api";

export default function Rewards() {
  const { user: authUser } = useAuth();
  const userId = authUser?.email || "user-123";
  
  const { data: user, isLoading: userLoading } = useUser(userId);
  const { data: completedChallenges = [], isLoading: challengesLoading } = useCompletedChallenges(userId);

  // Calculate badge achievements based on real data
  const healthChallengesCount = completedChallenges.filter((c: any) => c.insuranceCategory === 'health').length;
  const hasCompletedFirstChallenge = completedChallenges.length > 0;
  const lifeProtectionScore = (user as any)?.life_protection_score ?? 0;
  
  const badges = [
    {
      title: "First Steps",
      description: "Complete your first challenge",
      earned: hasCompletedFirstChallenge,
      rarity: "common" as const,
    },
    {
      title: "Week Warrior",
      description: "7-day streak achieved",
      earned: (user?.streak || 0) >= 7,
      rarity: "rare" as const,
    },
    {
      title: "Health Master",
      description: "Complete 10 health challenges",
      earned: healthChallengesCount >= 10,
      rarity: "rare" as const,
    },
    {
      title: "Protection Legend",
      description: "Reach 50+ Life Protection Score",
      earned: lifeProtectionScore >= 50,
      rarity: "legendary" as const,
    },
    {
      title: "Perfect Month",
      description: "30-day streak",
      earned: (user?.streak || 0) >= 30,
      rarity: "legendary" as const,
    },
    {
      title: "Challenge Master",
      description: "Complete 50 challenges",
      earned: completedChallenges.length >= 50,
      rarity: "rare" as const,
    },
  ];

  if (userLoading || challengesLoading) {
    return (
      <div className="min-h-screen pb-24 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 p-4" data-testid="page-rewards">
      <h1 className="text-2xl font-bold mb-6">Rewards</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 text-center">
          <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{lifeProtectionScore}</div>
          <div className="text-xs text-muted-foreground">Life Protection</div>
        </Card>
        <Card className="p-4 text-center">
          <Flame className="h-8 w-8 mx-auto mb-2 text-feedback-warning" />
          <div className="text-2xl font-bold">{user?.streak || 0}</div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </Card>
      </div>

      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="badges" className="flex-1" data-testid="tab-badges">
            Badges
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1" data-testid="tab-stats">
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges">
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge) => (
              <RewardBadge key={badge.title} {...badge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Life Protection Score</span>
                  <span className="text-lg font-bold">{lifeProtectionScore}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Challenges Completed</span>
                  <span className="text-lg font-bold">{completedChallenges.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Streak</span>
                  <span className="text-lg font-bold">{user?.streak || 0} days</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Challenge Categories</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Health</span>
                  <span className="font-medium">{healthChallengesCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Driving</span>
                  <span className="font-medium">{completedChallenges.filter((c: any) => c.insuranceCategory === 'driving').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Financial</span>
                  <span className="font-medium">{completedChallenges.filter((c: any) => c.insuranceCategory === 'financial').length}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}