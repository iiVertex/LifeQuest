import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Shield, Award, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-api";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user: authUser } = useAuth();
  const { data: user } = useUser(authUser?.email || "");

  // Get name from auth user metadata or profile data
  const userName = user?.name || authUser?.user_metadata?.name || "User";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate protection level from score
  const lifeProtectionScore = (user as any)?.life_protection_score ?? 0;
  const protectionLevel = 
    lifeProtectionScore > 80 ? { name: "Diamond", icon: "💎" } :
    lifeProtectionScore > 60 ? { name: "Gold", icon: "🥇" } :
    lifeProtectionScore > 40 ? { name: "Silver", icon: "🥈" } :
    lifeProtectionScore > 20 ? { name: "Bronze", icon: "🥉" } :
    { name: "Beginner", icon: "🛡️" };

  return (
    <div className="min-h-screen pb-24 p-4" data-testid="page-profile">
      <div className="text-center mb-6">
        <Avatar className="h-24 w-24 mx-auto mb-3 ring-2 ring-primary">
          <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">{userName}</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground mt-1">
          <Award className="h-4 w-4" />
          <span>{protectionLevel.icon} {protectionLevel.name} • {lifeProtectionScore}/100 Life Protection</span>
        </div>
        {user?.focusAreas && user.focusAreas.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {user.focusAreas.map((area: string) => (
              <Badge key={area} variant="secondary">
                {area}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle" className="text-sm">
                Dark Mode
              </Label>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm">
                Notifications
              </Label>
              <Switch id="notifications" defaultChecked data-testid="switch-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-insights" className="text-sm">
                AI Insights
              </Label>
              <Switch id="ai-insights" defaultChecked data-testid="switch-ai-insights" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Frequency</span>
              <span className="font-medium">Balanced</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Tone</span>
              <span className="font-medium">Motivational</span>
            </div>
          </div>
        </Card>

        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
