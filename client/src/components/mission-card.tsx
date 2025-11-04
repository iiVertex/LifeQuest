import { Card } from "@/components/ui/card";
import { ProgressRing } from "./progress-ring";
import { Clock, Shield } from "lucide-react";

interface MissionCardProps {
  title: string;
  category: "driving" | "health" | "financial";
  progress: number;
  xpReward: number; // Actually points now, but keeping prop name for compatibility
  timeLeft?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const categoryColors = {
  driving: "hsl(239 89% 68%)",
  health: "hsl(122 39% 49%)",
  financial: "hsl(45 100% 50%)",
};

export function MissionCard({
  title,
  category,
  progress,
  xpReward,
  timeLeft,
  icon,
  onClick,
}: MissionCardProps) {
  return (
    <Card
      className="p-4 min-w-[280px] hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`card-mission-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex gap-4">
        <ProgressRing
          progress={progress}
          size={80}
          strokeWidth={6}
          color={categoryColors[category]}
        >
          <div className="text-xs font-semibold">{progress}%</div>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <div className="text-muted-foreground">{icon}</div>
            <h3 className="font-semibold text-sm leading-tight">{title}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
            {timeLeft && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{timeLeft}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>+{xpReward} pts</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}