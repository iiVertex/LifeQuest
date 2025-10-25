import { FocusAreaSelector } from "../focus-area-selector";
import { useState } from "react";

export default function FocusAreaSelectorExample() {
  const [selected, setSelected] = useState<string[]>(["health"]);

  const handleToggle = (area: string) => {
    setSelected((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    );
  };

  return (
    <div className="max-w-md p-4">
      <FocusAreaSelector selected={selected} onToggle={handleToggle} />
    </div>
  );
}
