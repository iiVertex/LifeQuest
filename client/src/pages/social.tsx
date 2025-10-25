import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/progress-ring";
import { Users, UserPlus } from "lucide-react";

export default function Social() {
  const friends = [
    { name: "Sarah Kim", level: 7, xp: 3200, progress: 65, initial: "SK" },
    { name: "Mike Johnson", level: 4, xp: 1800, progress: 45, initial: "MJ" },
    { name: "Emma Davis", level: 6, xp: 2500, progress: 80, initial: "ED" },
  ];

  return (
    <div className="min-h-screen pb-24 p-4" data-testid="page-social">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            My Circle
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect and compete with friends
          </p>
        </div>
        <Button size="sm" data-testid="button-invite-friend">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        {friends.map((friend) => (
          <Card key={friend.name} className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="font-semibold bg-primary/10 text-primary">
                    {friend.initial}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-0.5">
                  <ProgressRing progress={friend.progress} size={20} strokeWidth={2}>
                    <div />
                  </ProgressRing>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{friend.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>Level {friend.level}</span>
                  <span>•</span>
                  <span>{friend.xp} XP</span>
                </div>
              </div>
              <Button variant="outline" size="sm" data-testid={`button-nudge-${friend.name.toLowerCase().replace(/\s+/g, "-")}`}>
                Nudge
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 text-center">
        <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-semibold mb-2">Collaborative Quests</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Team up with friends to complete challenges together
        </p>
        <Button variant="outline" data-testid="button-find-quests">
          Find Quests
        </Button>
      </Card>
    </div>
  );
}
