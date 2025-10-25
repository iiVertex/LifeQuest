import { ScenarioSlider } from "../scenario-slider";
import { useState } from "react";
import { Car, Moon, DollarSign } from "lucide-react";

export default function ScenarioSliderExample() {
  const [driving, setDriving] = useState(30);
  const [sleep, setSleep] = useState(7);
  const [spending, setSpending] = useState(20);

  return (
    <div className="max-w-md space-y-4 p-4">
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
  );
}
