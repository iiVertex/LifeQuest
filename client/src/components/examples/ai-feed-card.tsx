import { AIFeedCard } from "../ai-feed-card";

export default function AIFeedCardExample() {
  return (
    <div className="max-w-md space-y-4 p-4">
      <AIFeedCard
        title="Next Best Action"
        message="You're close to completing your Daily Steps Goal! Just 2,000 more steps to earn 150 XP."
        actionLabel="Start Mission"
        onAction={() => console.log("AI action triggered")}
      />
      <AIFeedCard
        title="Weekly Insight"
        message="Your driving score improved by 15% this week. Keep up the safe habits!"
      />
    </div>
  );
}
