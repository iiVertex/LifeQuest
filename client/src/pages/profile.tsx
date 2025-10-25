import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Bell, Shield, Link as LinkIcon, Award } from "lucide-react";

export default function Profile() {
  return (
    <div className="min-h-screen pb-24 p-4" data-testid="page-profile">
      <div className="text-center mb-6">
        <Avatar className="h-24 w-24 mx-auto mb-3 ring-2 ring-primary">
          <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
            AC
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">Alex Chen</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground mt-1">
          <Award className="h-4 w-4" />
          <span>Level 5 • 1,250 XP</span>
        </div>
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

        <Card className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Linked Apps
          </h2>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" data-testid="button-link-fitness">
              Connect Fitness App
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-link-finance">
              Connect Finance App
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy & Data
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Your data is encrypted and never shared without permission
          </p>
          <Button variant="outline" className="w-full" data-testid="button-privacy-settings">
            Privacy Settings
          </Button>
        </Card>
      </div>
    </div>
  );
}
