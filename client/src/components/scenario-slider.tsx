import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface ScenarioSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  icon?: React.ReactNode;
}

export function ScenarioSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  icon,
}: ScenarioSliderProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="flex-1">
          <h4 className="font-medium text-sm">{label}</h4>
        </div>
        <span className="text-sm font-semibold text-primary">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
        data-testid={`slider-${label.toLowerCase().replace(/\s+/g, "-")}`}
      />
    </Card>
  );
}
