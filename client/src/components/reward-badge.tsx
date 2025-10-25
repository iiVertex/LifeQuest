import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardBadgeProps {
  title: string;
  description: string;
  earned: boolean;
  rarity?: "common" | "rare" | "legendary";
}

const rarityColors = {
  common: "text-muted-foreground",
  rare: "text-focus-driving",
  legendary: "text-focus-financial",
};

export function RewardBadge({
  title,
  description,
  earned,
  rarity = "common",
}: RewardBadgeProps) {
  return (
    <Card
      className={cn(
        "p-4 text-center",
        !earned && "opacity-50 grayscale"
      )}
      data-testid={`badge-reward-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            "p-3 rounded-full",
            earned ? "bg-primary/20" : "bg-muted"
          )}
        >
          <Trophy
            className={cn(
              "h-8 w-8",
              earned ? rarityColors[rarity] : "text-muted-foreground"
            )}
          />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
        {earned && (
          <Badge variant="secondary" className="text-xs">
            Earned
          </Badge>
        )}
      </div>
    </Card>
  );
}
