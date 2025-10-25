import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RewardBadge } from "@/components/reward-badge";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/progress-ring";
import { Coins, Flame } from "lucide-react";

export default function Rewards() {
  const badges = [
    {
      title: "First Steps",
      description: "Complete your first mission",
      earned: true,
      rarity: "common" as const,
    },
    {
      title: "Week Warrior",
      description: "7-day streak achieved",
      earned: true,
      rarity: "rare" as const,
    },
    {
      title: "Health Master",
      description: "Complete 10 health missions",
      earned: true,
      rarity: "rare" as const,
    },
    {
      title: "Legend",
      description: "Reach Level 10",
      earned: false,
      rarity: "legendary" as const,
    },
    {
      title: "Perfect Month",
      description: "30-day streak",
      earned: false,
      rarity: "legendary" as const,
    },
    {
      title: "Mentor",
      description: "Help 5 friends",
      earned: false,
      rarity: "rare" as const,
    },
  ];

  return (
    <div className="min-h-screen pb-24 p-4" data-testid="page-rewards">
      <h1 className="text-2xl font-bold mb-6">Rewards</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 text-center">
          <Coins className="h-8 w-8 mx-auto mb-2 text-focus-financial" />
          <div className="text-2xl font-bold">3,450</div>
          <div className="text-xs text-muted-foreground">Total Coins</div>
        </Card>
        <Card className="p-4 text-center">
          <Flame className="h-8 w-8 mx-auto mb-2 text-feedback-warning" />
          <div className="text-2xl font-bold">12</div>
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
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <ProgressRing progress={75} size={100} strokeWidth={6} color="hsl(210 75% 52%)">
                <span className="text-xs font-semibold">75%</span>
              </ProgressRing>
              <p className="text-xs text-muted-foreground mt-2">Driving</p>
            </div>
            <div className="text-center">
              <ProgressRing progress={60} size={100} strokeWidth={6} color="hsl(122 39% 49%)">
                <span className="text-xs font-semibold">60%</span>
              </ProgressRing>
              <p className="text-xs text-muted-foreground mt-2">Health</p>
            </div>
            <div className="text-center">
              <ProgressRing progress={85} size={100} strokeWidth={6} color="hsl(45 100% 50%)">
                <span className="text-xs font-semibold">85%</span>
              </ProgressRing>
              <p className="text-xs text-muted-foreground mt-2">Financial</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
