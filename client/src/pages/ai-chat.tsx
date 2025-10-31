import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-api";
import { useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  challengeSuggestion?: any; // For AI-suggested challenges
}

interface ChallengeSuggestion {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  engagementPoints: number;
  estimatedDuration: number;
  steps: string[];
}

export default function AIChat() {
  const [, setLocation] = useLocation();
  const { user: authUser } = useAuth();
  const { data: user } = useUser(authUser?.email || "");
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingChallenge, setConfirmingChallenge] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Send welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user?.name || "there"}! 👋 I'm your Smart Advisor. I'm here to help you build your Life Protection Score and achieve insurance success. How can I assist you today?`,
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
  }, [user?.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { id: "suggest-challenge", label: "Suggest a New Challenge", icon: "🎯" },
    { id: "rate-profile", label: "Rate My Profile", icon: "⭐" },
    { id: "show-stats", label: "Show My Stats", icon: "📊" },
  ];

  const handleQuickAction = async (actionId: string) => {
    const actionLabel = quickActions.find((a) => a.id === actionId)?.label || "";
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: actionLabel,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Special handling for challenge suggestion
      if (actionId === "suggest-challenge") {
        const res = await fetch("/api/smart-advisor/suggest-challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            context: "Suggest a new personalized challenge for me based on my profile and focus areas"
          }),
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to generate challenge");

        const data = await res.json();
        const suggestion = data.suggestion;

        // Format challenge as a nice message
        const challengeMessage = `🎯 I've created a personalized challenge for you!\n\n**${suggestion.title}**\n\n${suggestion.description}\n\n📋 Steps:\n${suggestion.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}\n\n⭐ Difficulty: ${suggestion.difficulty}\n🏆 Reward: ${suggestion.engagementPoints} points\n⏱️ Estimated time: ${suggestion.estimatedDuration}h\n\nWould you like me to add this to your active challenges?`;

        const aiMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: challengeMessage,
          timestamp: Date.now(),
          challengeSuggestion: suggestion,
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }

      // Regular chat for other actions
      const res = await fetch("/api/smart-advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: actionLabel,
          userId: user?.id,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await res.json();
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Quick action error:", error);
      
      // Fallback message
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm analyzing your request. This feature is being enhanced!",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user?.id) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the Smart Advisor chat API
      const res = await fetch("/api/smart-advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userId: user.id,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await res.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      
      // Fallback message on error
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmChallenge = async (challenge: ChallengeSuggestion, messageId: string) => {
    if (!user?.id) return;

    setConfirmingChallenge(true);
    try {
      const res = await fetch("/api/smart-advisor/create-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          challenge,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create challenge");

      const data = await res.json();

      // Invalidate challenges cache to trigger immediate refetch
      queryClient.invalidateQueries({ queryKey: ["/api/user", user.id, "challenges", "active"] });

      // Add confirmation message
      const confirmMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `✅ Perfect! I've added "${challenge.title}" to your active challenges. You can find it in the Challenges tab. Good luck! 🎯`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, confirmMessage]);

      // Remove the challenge suggestion from the original message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, challengeSuggestion: undefined } : msg
        )
      );
    } catch (error) {
      console.error("Challenge creation error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I couldn't create that challenge right now. Please try again!",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setConfirmingChallenge(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 bg-gradient-to-br from-primary to-primary/60">
            <AvatarFallback className="bg-transparent text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold">AI Life Companion</h1>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <Avatar className={`h-8 w-8 ${
              message.role === "assistant" 
                ? "bg-gradient-to-br from-primary to-primary/60" 
                : "bg-muted"
            }`}>
              <AvatarFallback className={
                message.role === "assistant"
                  ? "bg-transparent text-primary-foreground"
                  : "bg-transparent"
              }>
                {message.role === "assistant" ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  user?.name ? getInitials(user.name) : "U"
                )}
              </AvatarFallback>
            </Avatar>
            <Card
              className={`max-w-[75%] p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Show Confirm Challenge button if this message has challenge data */}
              {message.role === "assistant" && message.challengeSuggestion && (
                <Button
                  onClick={() => handleConfirmChallenge(message.challengeSuggestion!, message.id)}
                  disabled={confirmingChallenge}
                  className="mt-3 w-full"
                  variant={confirmingChallenge ? "outline" : "default"}
                >
                  {confirmingChallenge ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Challenge...
                    </>
                  ) : (
                    <>
                      ✅ Accept Challenge
                    </>
                  )}
                </Button>
              )}
              
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </Card>
          </div>
        ))}

        {/* Quick Actions (only show if first message) */}
        {messages.length === 1 && (
          <div className="space-y-2 max-w-md">
            <p className="text-sm text-muted-foreground px-2">Quick Actions:</p>
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleQuickAction(action.id)}
              >
                <span className="text-xl mr-3">{action.icon}</span>
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60">
              <AvatarFallback className="bg-transparent text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Card className="max-w-[75%] p-3 bg-muted">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
