import { MissionCard } from "../mission-card";
import { Car, Heart, DollarSign } from "lucide-react";

export default function MissionCardExample() {
  return (
    <div className="flex gap-4 p-8 overflow-x-auto">
      <MissionCard
        title="Drive Safely Challenge"
        category="driving"
        progress={75}
        xpReward={250}
        timeLeft="2 days"
        icon={<Car className="h-4 w-4" />}
        onClick={() => console.log("Driving mission clicked")}
      />
      <MissionCard
        title="Daily Steps Goal"
        category="health"
        progress={45}
        xpReward={150}
        timeLeft="8 hours"
        icon={<Heart className="h-4 w-4" />}
        onClick={() => console.log("Health mission clicked")}
      />
      <MissionCard
        title="Budget Tracker"
        category="financial"
        progress={90}
        xpReward={300}
        timeLeft="5 days"
        icon={<DollarSign className="h-4 w-4" />}
        onClick={() => console.log("Financial mission clicked")}
      />
    </div>
  );
}
