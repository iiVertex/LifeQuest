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
import { Trophy } from "lucide-react";

export default function Missions() {
  const [selectedCategory, setSelectedCategory] = useState("driving");
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  const missionTrees = {
    driving: [
      { title: "Safe Start", xp: 100, status: "completed" as const },
      { title: "Eco Mode", xp: 150, status: "available" as const, isRecommended: true },
      { title: "Advanced", xp: 200, status: "locked" as const },
      { title: "Master", xp: 300, status: "locked" as const },
    ],
    health: [
      { title: "First Steps", xp: 100, status: "completed" as const },
      { title: "Daily Walk", xp: 150, status: "completed" as const },
      { title: "Marathon", xp: 250, status: "available" as const, isRecommended: true },
      { title: "Athlete", xp: 400, status: "locked" as const },
    ],
    financial: [
      { title: "Budget Basics", xp: 100, status: "completed" as const },
      { title: "Savings Goal", xp: 200, status: "available" as const },
      { title: "Investment", xp: 300, status: "locked" as const },
      { title: "Wealth", xp: 500, status: "locked" as const },
    ],
  };

  return (
    <div className="min-h-screen pb-24 p-4" data-testid="page-missions">
      <h1 className="text-2xl font-bold mb-6">Mission Trees</h1>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="driving" className="flex-1" data-testid="tab-driving">
            Driving
          </TabsTrigger>
          <TabsTrigger value="health" className="flex-1" data-testid="tab-health">
            Health
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex-1" data-testid="tab-financial">
            Financial
          </TabsTrigger>
        </TabsList>

        {Object.entries(missionTrees).map(([category, nodes]) => (
          <TabsContent key={category} value={category}>
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {nodes.map((node) => (
                  <SkillTreeNode
                    key={node.title}
                    {...node}
                    onClick={() =>
                      node.status !== "locked" &&
                      setSelectedMission(node.title)
                    }
                  />
                ))}
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog
        open={!!selectedMission}
        onOpenChange={() => setSelectedMission(null)}
      >
        <DialogContent data-testid="dialog-mission-details">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {selectedMission}
            </DialogTitle>
            <DialogDescription>
              Complete this mission to earn XP and unlock new challenges
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Mission Steps</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Complete the required activities</li>
                <li>Track your progress daily</li>
                <li>Achieve the target goal</li>
              </ul>
            </div>
            <Button className="w-full" data-testid="button-start-mission">
              Start Mission
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
