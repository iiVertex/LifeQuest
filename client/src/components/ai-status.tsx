import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, AlertCircle, CheckCircle } from "lucide-react";

export function AIStatus() {
  const [status, setStatus] = useState<{
    available: boolean;
    message: string;
    details?: any;
  } | null>(null);

  useEffect(() => {
    fetch("/api/test-ai")
      .then((res) => res.json())
      .then((data) => {
        setStatus({
          available: data.aiAvailable || false,
          message: data.message || data.error || "Unknown status",
          details: data,
        });
      })
      .catch((err) => {
        setStatus({
          available: false,
          message: "Failed to check AI status",
        });
      });
  }, []);

  if (!status) return null;

  return (
    <Card className="p-3 mb-4">
      <div className="flex items-center gap-2 text-sm">
        {status.available ? (
          <>
            <Sparkles className="h-4 w-4 text-green-500" />
            <span className="text-green-700 dark:text-green-400">
              AI Powered: {status.details?.model}
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-amber-700 dark:text-amber-400">
              AI Offline - {status.message}
            </span>
          </>
        )}
      </div>
    </Card>
  );
}
