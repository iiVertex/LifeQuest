import { ProfileHeader } from "@/components/profile-header";
import { MissionCard } from "@/components/mission-card";
import { AIFeedCard } from "@/components/ai-feed-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Car, Heart, DollarSign } from "lucide-react";

export default function Dashboard() {
  const missions = [
    {
      title: "Drive Safely Challenge",
      category: "driving" as const,
      progress: 75,
      xpReward: 250,
      timeLeft: "2 days",
      icon: <Car className="h-4 w-4" />,
    },
    {
      title: "Daily Steps Goal",
      category: "health" as const,
      progress: 45,
      xpReward: 150,
      timeLeft: "8 hours",
      icon: <Heart className="h-4 w-4" />,
    },
    {
      title: "Budget Tracker",
      category: "financial" as const,
      progress: 90,
      xpReward: 300,
      timeLeft: "5 days",
      icon: <DollarSign className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen pb-24" data-testid="page-dashboard">
      <div className="bg-gradient-to-b from-primary/5 to-background pb-4">
        <ProfileHeader
          name="Alex Chen"
          level={5}
          xp={1250}
          xpToNextLevel={2000}
          streak={12}
        />
      </div>

      <div className="p-4 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Missions</h2>
            <Button size="sm" variant="outline" data-testid="button-view-all">
              View All
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {missions.map((mission) => (
              <MissionCard
                key={mission.title}
                {...mission}
                onClick={() => console.log(`${mission.title} clicked`)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">AI Insights</h2>
          <AIFeedCard
            title="Next Best Action"
            message="You're close to completing your Daily Steps Goal! Just 2,000 more steps to earn 150 XP."
            actionLabel="Start Mission"
            onAction={() => console.log("Start mission")}
          />
        </div>

        <Button
          className="w-full"
          size="lg"
          data-testid="button-new-mission"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Mission
        </Button>
      </div>
    </div>
  );
}
