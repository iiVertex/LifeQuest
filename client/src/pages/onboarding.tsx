import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FocusAreaSelector } from "@/components/focus-area-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const steps = [
    {
      title: "Welcome",
      content: (
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="p-4 rounded-full bg-primary/10 w-20 h-20 mx-auto flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">AI Lifestyle Companion</h1>
          <p className="text-lg text-muted-foreground">
            Master your life, one mission at a time
          </p>
        </div>
      ),
    },
    {
      title: "Choose Your Focus",
      content: (
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">What do you want to master?</h2>
            <p className="text-muted-foreground">
              Select one or more areas to personalize your journey
            </p>
          </div>
          <FocusAreaSelector
            selected={selectedAreas}
            onToggle={(area) => {
              setSelectedAreas((prev) =>
                prev.includes(area)
                  ? prev.filter((a) => a !== area)
                  : [...prev, area]
              );
            }}
          />
        </div>
      ),
    },
    {
      title: "Customize",
      content: (
        <div className="max-w-md mx-auto space-y-6 text-center">
          <h2 className="text-2xl font-bold">Personalize Your Experience</h2>
          <p className="text-muted-foreground mb-6">
            Choose your preferred theme
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm">Light</span>
            <ThemeToggle />
            <span className="text-sm">Dark</span>
          </div>
        </div>
      ),
    },
    {
      title: "Ready",
      content: (
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="p-4 rounded-full bg-feedback-success/10 w-20 h-20 mx-auto flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-feedback-success" />
          </div>
          <h2 className="text-3xl font-bold">You're All Set!</h2>
          <p className="text-lg text-muted-foreground">
            Your AI mentor will adapt to your lifestyle
          </p>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex flex-col" data-testid="page-onboarding">
      <div className="p-4">
        <Progress value={progress} className="h-1" />
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        {currentStep.content}
      </div>
      <div className="p-8 flex justify-between items-center max-w-2xl mx-auto w-full">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            data-testid="button-back"
          >
            Back
          </Button>
        )}
        <div className="flex-1" />
        <Button
          onClick={() => {
            if (step < steps.length - 1) {
              setStep(step + 1);
            } else {
              onComplete();
            }
          }}
          disabled={step === 1 && selectedAreas.length === 0}
          data-testid="button-continue"
        >
          {step === steps.length - 1 ? "Enter Dashboard" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
