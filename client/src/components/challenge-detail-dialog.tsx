import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Target, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

interface ChallengeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: any;
  onComplete: (challengeId: string) => Promise<void>;
}

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

const categoryLabels: Record<string, string> = {
  motor: "Motor Insurance",
  health: "Health Insurance",
  travel: "Travel Insurance",
  home: "Home Insurance",
  life: "Life Insurance",
};

export function ChallengeDetailDialog({ 
  open, 
  onOpenChange, 
  challenge,
  onComplete 
}: ChallengeDetailDialogProps) {
  const [completing, setCompleting] = useState(false);

  if (!challenge) return null;

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onComplete(challenge.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to complete challenge:", error);
    } finally {
      setCompleting(false);
    }
  };

  const isCompleted = challenge.status === 'completed';
  const steps = challenge.requirements?.steps || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{challenge.title}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[challenge.insuranceCategory] || challenge.insuranceCategory}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors] || ''}`}
                >
                  {challenge.difficulty}
                </Badge>
                {isCompleted && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DialogDescription className="text-base mt-4">
            {challenge.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Challenge Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{challenge.engagementPoints}</div>
                <div className="text-xs text-muted-foreground">Points</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{challenge.estimatedDuration}h</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{challenge.progress || 0}%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
            </div>
          </div>

          {/* Steps */}
          {steps.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Steps to Complete
              </h3>
              <div className="space-y-2">
                {steps.map((step: string, index: number) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm flex-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {!isCompleted ? (
              <>
                <Button 
                  onClick={handleComplete}
                  disabled={completing}
                  className="flex-1"
                  size="lg"
                >
                  {completing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  size="lg"
                >
                  Close
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
                size="lg"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
