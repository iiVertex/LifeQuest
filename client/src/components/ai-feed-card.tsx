import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIFeedCardProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AIFeedCard({
  title,
  message,
  actionLabel,
  onAction,
}: AIFeedCardProps) {
  return (
    <Card className="p-4" data-testid="card-ai-feed">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{message}</p>
          {actionLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAction}
              data-testid="button-ai-action"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
