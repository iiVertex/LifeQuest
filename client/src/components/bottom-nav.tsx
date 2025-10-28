import { Home, Target, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "challenges", icon: Target, label: "Challenges" },
  { id: "social", icon: Users, label: "Social" },
  { id: "profile", icon: User, label: "Profile" },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg"
      data-testid="nav-bottom"
    >
      <div className="flex items-center justify-around max-w-2xl mx-auto px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-md transition-colors min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover-elevate"
              )}
              data-testid={`button-nav-${item.id}`}
            >
              <Icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
