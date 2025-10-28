import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillTreeNode } from "@/components/skill-tree-node";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Loader2 } from "lucide-react";
import { useSkillTreeNodes, useUserSkillProgress, useUnlockSkillNode, useCreateChallenge } from "@/hooks/use-api";

// Mock user ID for development
const MOCK_USER_ID = "user-123";

export default function Challenges() {
  const [selectedCategory, setSelectedCategory] = useState("motor");
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  // API hooks
  const { data: skillNodes = [], isLoading: nodesLoading } = useSkillTreeNodes(selectedCategory);
  const { data: userProgress = [], isLoading: progressLoading } = useUserSkillProgress(MOCK_USER_ID, selectedCategory);
  const unlockSkillNode = useUnlockSkillNode();
  const createChallenge = useCreateChallenge();

  // Create a map of user progress for quick lookup
  const progressMap = new Map(userProgress.map((p: any) => [p.nodeId, p]));

  // Combine skill nodes with user progress
  const nodesWithProgress = skillNodes.map((node: any) => {
    const userNode = progressMap.get(node.id);
    return {
      ...node,
      status: (userNode as any)?.status || "locked",
      isRecommended: !userNode && node.prerequisites.length === 0,
    };
  });

  const handleNodeClick = async (node: any) => {
    if (node.status === "locked") return;
    
    if (node.status === "available") {
      try {
        await unlockSkillNode.mutateAsync({ userId: MOCK_USER_ID, nodeId: node.id });
        setSelectedChallenge(node.title);
      } catch (error) {
        console.error("Failed to unlock skill node:", error);
      }
    } else {
      setSelectedChallenge(node.title);
    }
  };

  const handleStartChallenge = async () => {
    if (!selectedChallenge) return;
    
    try {
      // Find the skill node for the selected challenge
      const node = nodesWithProgress.find((n: any) => n.title === selectedChallenge);
      if (node) {
        await createChallenge.mutateAsync({
          userId: MOCK_USER_ID,
          templateId: node.id, // Using node ID as template ID for now
          userData: { skillNodeId: node.id }
        });
        setSelectedChallenge(null);
      }
    } catch (error) {
      console.error("Failed to start challenge:", error);
    }
  };

  if (nodesLoading || progressLoading) {
    return (
      <div className="min-h-screen pb-24 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading skill tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 p-4" data-testid="page-challenges">
      <h1 className="text-2xl font-bold mb-6">Insurance Challenges</h1>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full mb-6">
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
          <Card className="p-6">
            {nodesWithProgress.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {nodesWithProgress.map((node: any) => (
                  <SkillTreeNode
                    key={node.id}
                    title={node.title}
                    xp={node.xpCost}
                    status={node.status}
                    isRecommended={node.isRecommended}
                    onClick={() => handleNodeClick(node)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No skill nodes available for this category</p>
                <p className="text-sm">Check back later for new challenges!</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedChallenge}
        onOpenChange={() => setSelectedChallenge(null)}
      >
        <DialogContent data-testid="dialog-challenge-details">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {selectedChallenge}
            </DialogTitle>
            <DialogDescription>
              Complete this challenge to earn engagement points and unlock new opportunities
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Challenge Steps</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Complete the required activities</li>
                <li>Track your progress daily</li>
                <li>Achieve the target goal</li>
              </ul>
            </div>
            <Button 
              className="w-full" 
              data-testid="button-start-challenge"
              onClick={handleStartChallenge}
              disabled={createChallenge.isPending}
            >
              {createChallenge.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting Challenge...
                </>
              ) : (
                "Start Challenge"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
