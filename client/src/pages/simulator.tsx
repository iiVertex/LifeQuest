import { useState } from "react";
import { ScenarioSlider } from "@/components/scenario-slider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Moon, DollarSign, TrendingUp } from "lucide-react";

export default function Simulator() {
  const [driving, setDriving] = useState(30);
  const [sleep, setSleep] = useState(7);
  const [spending, setSpending] = useState(20);

  const calculateImpact = () => {
    const xpIncrease = Math.round(
      (driving * 0.5 + (sleep - 6) * 10 + spending * 0.3)
    );
    const riskDecrease = Math.round(driving * 0.3 + 5);
    return { xpIncrease, riskDecrease };
  };

  const { xpIncrease, riskDecrease } = calculateImpact();

  return (
    <div className="min-h-screen pb-24 p-4" data-testid="page-simulator">
      <h1 className="text-2xl font-bold mb-2">Scenario Simulator</h1>
      <p className="text-muted-foreground mb-6">
        What if you changed your habits?
      </p>

      <div className="space-y-4 mb-6">
        <ScenarioSlider
          label="Reduce Driving"
          value={driving}
          onChange={setDriving}
          icon={<Car className="h-4 w-4" />}
        />
        <ScenarioSlider
          label="Sleep Hours"
          value={sleep}
          onChange={setSleep}
          min={4}
          max={12}
          unit="h"
          icon={<Moon className="h-4 w-4" />}
        />
        <ScenarioSlider
          label="Budget Cut"
          value={spending}
          onChange={setSpending}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Projected Impact</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-feedback-success/10">
            <div className="text-3xl font-bold text-feedback-success">
              +{xpIncrease}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">XP Increase</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-primary/10">
            <div className="text-3xl font-bold text-primary">
              -{riskDecrease}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Risk Index</div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center pt-2">
          These changes could improve your lifestyle score significantly
        </p>

        <Button className="w-full" data-testid="button-convert-mission">
          Convert to Mission
        </Button>
      </Card>
    </div>
  );
}
