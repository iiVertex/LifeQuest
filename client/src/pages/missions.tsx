import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChallengeDetailDialog } from "@/components/challenge-detail-dialog";
import { Trophy, Clock, Target, Loader2 } from "lucide-react";
import { useActiveChallenges, useCompletedChallenges } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";

export default function Challenges() {
  const { user: authUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);

  const userId = authUser?.email || "user-123";

  // API hooks
  const { data: activeChallenges = [], isLoading: activeLoading, refetch: refetchActive } = useActiveChallenges(userId);
  const { data: completedChallenges = [], isLoading: completedLoading, refetch: refetchCompleted } = useCompletedChallenges(userId);

  const categoryLabels: Record<string, string> = {
    motor: "Motor Insurance",
    health: "Health Insurance",
    travel: "Travel Insurance",
    home: "Home Insurance",
    life: "Life Insurance",
  };

  const difficultyColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  // Filter challenges by category
  const filteredActiveChallenges = selectedCategory === "all" 
    ? activeChallenges 
    : activeChallenges.filter((c: any) => c.insuranceCategory === selectedCategory);

  const filteredCompletedChallenges = selectedCategory === "all"
    ? completedChallenges
    : completedChallenges.filter((c: any) => c.insuranceCategory === selectedCategory);

  const handleChallengeClick = (challenge: any) => {
    setSelectedChallenge(challenge);
    setChallengeDialogOpen(true);
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/complete`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }

      await refetchActive();
      await refetchCompleted();
      setChallengeDialogOpen(false);
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  if (activeLoading || completedLoading) {
    return (
      <div className="min-h-screen pb-24 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 p-4" data-testid="page-challenges">
      <h1 className="text-2xl font-bold mb-6">Insurance Challenges</h1>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="motor" className="flex-1" data-testid="tab-motor">
            Motor
          </TabsTrigger>
          <TabsTrigger value="health" className="flex-1" data-testid="tab-health">
            Health
          </TabsTrigger>
          <TabsTrigger value="travel" className="flex-1" data-testid="tab-travel">
            Travel
          </TabsTrigger>
          <TabsTrigger value="home" className="flex-1" data-testid="tab-home">
            Home
          </TabsTrigger>
          <TabsTrigger value="life" className="flex-1" data-testid="tab-life">
            Life
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="space-y-6">
            {/* Active Challenges */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Active Challenges</h2>
              {filteredActiveChallenges.length > 0 ? (
                <div className="grid gap-4">
                  {filteredActiveChallenges.map((challenge: any) => (
                    <Card 
                      key={challenge.id} 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleChallengeClick(challenge)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[challenge.insuranceCategory] || challenge.insuranceCategory}
                        </Badge>
                        <Badge className={`text-xs capitalize ${difficultyColors[challenge.difficulty?.toLowerCase()] || ''}`}>
                          {challenge.difficulty}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          <span>{challenge.engagementPoints} Points</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{challenge.estimatedDuration}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{challenge.progress || 0}%</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active challenges for this category</p>
                    <p className="text-sm">Check back later for new challenges!</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Completed Challenges */}
            {filteredCompletedChallenges.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Completed Challenges</h2>
                <div className="grid gap-4">
                  {filteredCompletedChallenges.map((challenge: any) => (
                    <Card 
                      key={challenge.id} 
                      className="p-4 opacity-60 cursor-pointer"
                      onClick={() => handleChallengeClick(challenge)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[challenge.insuranceCategory] || challenge.insuranceCategory}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Trophy className="h-4 w-4" />
                          <span>{challenge.engagementPoints} Points Earned</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ChallengeDetailDialog
        open={challengeDialogOpen}
        onOpenChange={setChallengeDialogOpen}
        challenge={selectedChallenge}
        onComplete={handleCompleteChallenge}
      />
    </div>
  );
}
