import { SkillTreeNode } from "../skill-tree-node";

export default function SkillTreeNodeExample() {
  return (
    <div className="flex gap-8 items-center p-8">
      <SkillTreeNode
        title="Safe Driving"
        xp={100}
        status="completed"
        onClick={() => console.log("Completed node clicked")}
      />
      <SkillTreeNode
        title="Eco Mode"
        xp={150}
        status="available"
        isRecommended={true}
        onClick={() => console.log("Recommended node clicked")}
      />
      <SkillTreeNode
        title="Advanced"
        xp={200}
        status="locked"
      />
    </div>
  );
}
