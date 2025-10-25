import { ProfileHeader } from "../profile-header";

export default function ProfileHeaderExample() {
  return (
    <div className="max-w-md">
      <ProfileHeader
        name="Alex Chen"
        level={5}
        xp={1250}
        xpToNextLevel={2000}
        streak={12}
      />
    </div>
  );
}
