import { RewardBadge } from "../reward-badge";

export default function RewardBadgeExample() {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <RewardBadge
        title="First Steps"
        description="Complete your first mission"
        earned={true}
        rarity="common"
      />
      <RewardBadge
        title="Week Warrior"
        description="7-day streak achieved"
        earned={true}
        rarity="rare"
      />
      <RewardBadge
        title="Legend"
        description="Reach Level 10"
        earned={false}
        rarity="legendary"
      />
    </div>
  );
}
