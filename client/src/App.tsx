import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { BottomNav } from "@/components/bottom-nav";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Missions from "@/pages/missions";
import Simulator from "@/pages/simulator";
import Social from "@/pages/social";
import Rewards from "@/pages/rewards";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  if (!hasCompletedOnboarding) {
    return (
      <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />
    );
  }

  return (
    <>
      <Switch>
        <Route path="/">
          {activeTab === "home" && <Dashboard />}
          {activeTab === "missions" && <Missions />}
          {activeTab === "simulator" && <Simulator />}
          {activeTab === "social" && <Social />}
          {activeTab === "profile" && <Profile />}
        </Route>
        <Route path="/rewards" component={Rewards} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
