import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, Shield, Car, Heart, Plane, Home, Users, Trophy, Target } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { ProgressRing } from "@/components/progress-ring";

interface OnboardingProps {
  onComplete: () => void;
}

const insuranceCategories = [
  { id: "motor", label: "Motor", icon: Car, color: "text-blue-500" },
  { id: "health", label: "Health", icon: Heart, color: "text-red-500" },
  { id: "travel", label: "Travel", icon: Plane, color: "text-green-500" },
  { id: "home", label: "Home", icon: Home, color: "text-orange-500" },
  { id: "life", label: "Life", icon: Users, color: "text-purple-500" },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Setup failed');
      return res.json();
    },
    onSuccess: () => onComplete(),
  });

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-8 max-w-2xl mx-auto animate-in fade-in duration-500">
            <div className="p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 w-32 h-32 mx-auto flex items-center justify-center">
              <Shield className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Welcome to QIC LifeQuest!
              </h1>
              <p className="text-xl text-muted-foreground">Turn your insurance into a rewarding journey.</p>
            </div>
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
              <p className="text-lg mb-6 text-center">
                Earn points, unlock badges, and level up your Protection Score.
              </p>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Earn Points</h3>
                    <p className="text-sm text-muted-foreground">Complete challenges and earn engagement points</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Unlock Badges</h3>
                    <p className="text-sm text-muted-foreground">Achieve milestones and collect rewards</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Level Up Protection</h3>
                    <p className="text-sm text-muted-foreground">Boost your Protection Score and unlock tiers</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Select Your Insurance Categories</h2>
              <p className="text-muted-foreground">Choose the categories you want to focus on (select at least one)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insuranceCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <Card
                    key={category.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategories(selectedCategories.filter(c => c !== category.id));
                      } else {
                        setSelectedCategories([...selectedCategories, category.id]);
                      }
                    }}
                    className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                      isSelected ? "border-primary bg-primary/5 shadow-lg" : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full bg-background ${category.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{category.label}</h3>
                      </div>
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {selectedCategories.length} selected
            </p>
          </div>
        );

      case 2:
        return (
          <div className="max-w-xl mx-auto space-y-8 text-center">
            <div className="p-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 w-40 h-40 mx-auto flex items-center justify-center animate-pulse">
              <Sparkles className="h-20 w-20 text-primary" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Meet Your QIC Smart Advisor</h2>
              <Card className="p-6 bg-primary/5 border-primary/20">
                <p className="text-lg">
                  "Hey {name || "there"}, I'll be your QIC Smart Advisor. 
                  Let's get started with your first challenge!"
                </p>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-xl mx-auto space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-3">Your First Challenge Unlocked! 🎯</h2>
              <p className="text-muted-foreground">Complete this to start earning points</p>
            </div>
            <Card className="p-6 border-2 border-primary shadow-lg">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Renew Your Motor Policy Early</h3>
                      <p className="text-sm text-muted-foreground">Complete before expiry</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-primary">+50</div>
                    <div className="text-xs text-muted-foreground">Points</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Trophy className="h-4 w-4" />
                    <span>Unlock: Car Wash Voucher</span>
                  </div>
                  <Button className="w-full" size="lg">
                    Start Challenge
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="max-w-xl mx-auto space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold mb-3">Your Protection Score</h2>
              <p className="text-muted-foreground">Track how well-protected you are</p>
            </div>
            <div className="flex justify-center my-8">
              <ProgressRing progress={42} size={200} strokeWidth={20} />
            </div>
            <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-background border-orange-500/20">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-6 w-6 text-orange-500" />
                  <h3 className="text-2xl font-bold">You're 42% covered</h3>
                </div>
                <p className="text-muted-foreground">
                  Complete challenges to boost your score!
                </p>
                <div className="grid grid-cols-4 gap-2 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Bronze</div>
                    <div className="h-2 bg-orange-500 rounded" />
                    <div className="text-xs font-semibold mt-1">0-49</div>
                  </div>
                  <div className="text-center opacity-50">
                    <div className="text-xs text-muted-foreground mb-1">Silver</div>
                    <div className="h-2 bg-gray-400 rounded" />
                    <div className="text-xs font-semibold mt-1">50-69</div>
                  </div>
                  <div className="text-center opacity-50">
                    <div className="text-xs text-muted-foreground mb-1">Gold</div>
                    <div className="h-2 bg-yellow-500 rounded" />
                    <div className="text-xs font-semibold mt-1">70-89</div>
                  </div>
                  <div className="text-center opacity-50">
                    <div className="text-xs text-muted-foreground mb-1">Platinum</div>
                    <div className="h-2 bg-purple-500 rounded" />
                    <div className="text-xs font-semibold mt-1">90-100</div>
                  </div>
                </div>
              </div>
            </Card>
            <p className="text-sm text-muted-foreground pt-4">
              Ready to start your journey to Platinum protection? Let's go! 🚀
            </p>
          </div>
        );
    }
  };

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleContinue = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      registerMutation.mutate({
        name: name || "User",
        focusAreas: selectedCategories,
        advisorTone: "balanced",
        protectionScore: 42,
        tier: "bronze",
      });
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 0: return true;
      case 1: return selectedCategories.length > 0;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-4">
        <Progress value={progress} className="h-1" />
      </div>
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        {renderStep()}
      </div>
      <div className="p-6 md:p-8 flex justify-between items-center max-w-4xl mx-auto w-full border-t bg-card/50 backdrop-blur-sm">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={registerMutation.isPending}
            size="lg"
          >
            Back
          </Button>
        )}
        <div className="flex-1" />
        <Button
          onClick={handleContinue}
          disabled={!isStepValid() || registerMutation.isPending}
          size="lg"
          className="min-w-[140px]"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Setting up...
            </>
          ) : step === totalSteps - 1 ? (
            "Let's Go! 🚀"
          ) : (
            "Continue"
          )}
        </Button>
      </div>
      {registerMutation.isError && (
        <div className="px-8 pb-4 text-center">
          <p className="text-sm text-red-500">
            {registerMutation.error instanceof Error ? registerMutation.error.message : 'Setup failed. Please try again.'}
          </p>
        </div>
      )}
    </div>
  );
}
