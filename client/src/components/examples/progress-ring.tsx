import { ProgressRing } from "../progress-ring";

export default function ProgressRingExample() {
  return (
    <div className="flex gap-8 items-center justify-center p-8">
      <ProgressRing progress={75} color="hsl(210 75% 52%)">
        <span className="text-sm font-semibold">75%</span>
      </ProgressRing>
      <ProgressRing progress={45} size={80} strokeWidth={6} color="hsl(122 39% 49%)">
        <span className="text-xs font-semibold">45%</span>
      </ProgressRing>
    </div>
  );
}
