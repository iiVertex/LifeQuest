import { cn } from "@/lib/utils";
import { Lock, Sparkles } from "lucide-react";

interface SkillTreeNodeProps {
  title: string;
  xp: number;
  status: "completed" | "available" | "locked";
  isRecommended?: boolean;
  onClick?: () => void;
}

export function SkillTreeNode({
  title,
  xp,
  status,
  isRecommended,
  onClick,
}: SkillTreeNodeProps) {
  return (
    <button
      onClick={status !== "locked" ? onClick : undefined}
      className={cn(
        "relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
        status === "locked" && "opacity-50 cursor-not-allowed",
        status !== "locked" && "hover-elevate cursor-pointer"
      )}
      data-testid={`node-skill-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div
        className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all",
          status === "completed" &&
            "bg-primary/20 border-primary",
          status === "available" && "bg-card border-border",
          status === "locked" && "bg-muted border-muted-foreground/30",
          isRecommended && status === "available" && "animate-pulse ring-2 ring-primary"
        )}
      >
        {status === "locked" ? (
          <Lock className="h-6 w-6 text-muted-foreground" />
        ) : (
          <span
            className={cn(
              "text-sm font-bold",
              status === "completed" ? "text-primary" : "text-foreground"
            )}
          >
            {xp}
          </span>
        )}
        {isRecommended && status === "available" && (
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary" />
        )}
      </div>
      <span className="text-xs text-center font-medium max-w-[80px] leading-tight">
        {title}
      </span>
    </button>
  );
}
