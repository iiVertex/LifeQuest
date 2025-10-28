import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { BottomNav } from "@/components/bottom-nav";
import { supabase } from "@/lib/supabase";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Challenges from "@/pages/missions";
import Social from "@/pages/social";
import Rewards from "@/pages/rewards";
import Profile from "@/pages/profile";
import AdvisorChat from "@/pages/ai-chat";
import NotFound from "@/pages/not-found";

function Router() {
  const [activeTab, setActiveTab] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      
      // Redirect to login if not authenticated and not on auth pages
      if (!session && location !== "/login" && location !== "/signup") {
        setLocation("/login");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      
      // Redirect to dashboard after login
      if (session && (location === "/login" || location === "/signup")) {
        setLocation("/");
      }
      // Redirect to login after logout
      if (!session && location !== "/login" && location !== "/signup") {
        setLocation("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [location, setLocation]);

  // Update activeTab based on current location
  useEffect(() => {
    if (location === "/" || location === "/dashboard") {
      setActiveTab("home");
    } else if (location === "/challenges") {
      setActiveTab("challenges");
    } else if (location === "/social") {
      setActiveTab("social");
    } else if (location === "/profile") {
      setActiveTab("profile");
    }
  }, [location]);

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/challenges" component={Challenges} />
        <Route path="/social" component={Social} />
        <Route path="/profile" component={Profile} />
        <Route path="/rewards" component={Rewards} />
        <Route path="/advisor-chat" component={AdvisorChat} />
        <Route component={NotFound} />
      </Switch>
      {isAuthenticated && location !== "/login" && location !== "/signup" && location !== "/advisor-chat" && (
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            const routes: Record<string, string> = {
              home: "/",
              challenges: "/challenges",
              social: "/social",
              profile: "/profile",
            };
            setLocation(routes[tab] || "/");
          }} 
        />
      )}
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
