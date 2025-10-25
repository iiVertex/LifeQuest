import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Flame, Award } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
}

export function ProfileHeader({
  name,
  level,
  xp,
  xpToNextLevel,
  streak,
}: ProfileHeaderProps) {
  const xpProgress = (xp / xpToNextLevel) * 100;

  return (
    <div className="flex items-center gap-4 p-4" data-testid="section-profile-header">
      <Avatar className="h-16 w-16 ring-2 ring-primary">
        <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-semibold text-lg" data-testid="text-username">
            {name}
          </h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Award className="h-3 w-3" />
            <span data-testid="text-level">Level {level}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {xp} / {xpToNextLevel} XP
            </span>
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-feedback-warning" />
              <span data-testid="text-streak">{streak} day streak</span>
            </div>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>
      </div>
    </div>
  );
}
