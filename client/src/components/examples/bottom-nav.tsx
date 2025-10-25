import { BottomNav } from "../bottom-nav";
import { useState } from "react";

export default function BottomNavExample() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="h-32 relative">
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
