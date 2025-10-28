import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const [, setLocation] = useLocation();
  const { user: authUser } = useAuth();
  const { data: user } = useUser(authUser?.email || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Send welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user?.name || "there"}! 👋 I'm your AI Life Companion. I'm here to help you achieve your goals and improve your lifestyle. How can I assist you today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [user?.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { id: "suggest-mission", label: "Suggest a New Mission", icon: "🎯" },
    { id: "rate-profile", label: "Rate My Profile", icon: "⭐" },
    { id: "show-stats", label: "Display My Current Statistics", icon: "📊" },
  ];

  const handleQuickAction = (actionId: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: quickActions.find((a) => a.id === actionId)?.label || "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Placeholder responses
    setTimeout(() => {
      let response = "";
      switch (actionId) {
        case "suggest-mission":
          response = "I'm analyzing your profile and goals to suggest the perfect mission for you. This feature is coming soon!";
          break;
        case "rate-profile":
          response = "I'm reviewing your profile completeness and activity. Profile rating feature is coming soon!";
          break;
        case "show-stats":
          response = "I'm gathering your current statistics and progress. Detailed stats feature is coming soon!";
          break;
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Placeholder AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Thanks for your message! I'm currently learning how to better assist you. Full conversational AI is coming soon!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
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
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], {
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
