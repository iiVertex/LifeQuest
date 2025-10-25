import { Card } from "@/components/ui/card";
import { Car, Heart, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusAreaSelectorProps {
  selected: string[];
  onToggle: (area: string) => void;
}

const focusAreas = [
  {
    id: "driving",
    label: "Driving",
    icon: Car,
    color: "focus-driving",
    description: "Master safe driving habits",
  },
  {
    id: "health",
    label: "Health",
    icon: Heart,
    color: "focus-health",
    description: "Build healthy lifestyle routines",
  },
  {
    id: "financial",
    label: "Financial",
    icon: DollarSign,
    color: "focus-financial",
    description: "Improve money management",
  },
];

export function FocusAreaSelector({
  selected,
  onToggle,
}: FocusAreaSelectorProps) {
  return (
    <div className="grid gap-4">
      {focusAreas.map((area) => {
        const Icon = area.icon;
        const isSelected = selected.includes(area.id);
        return (
          <Card
            key={area.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover-elevate",
              isSelected && "ring-2 ring-primary"
            )}
            onClick={() => onToggle(area.id)}
            data-testid={`card-focus-${area.id}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-full",
                  isSelected ? `bg-${area.color}/20` : "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6",
                    isSelected ? `text-${area.color}` : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{area.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {area.description}
                </p>
              </div>
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                )}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
