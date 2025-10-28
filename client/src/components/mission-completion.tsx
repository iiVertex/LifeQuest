import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Zap, Sparkles } from "lucide-react";

interface MissionCompletionProps {
  isOpen: boolean;
  onClose: () => void;
  mission: {
    title: string;
    xpEarned: number;
    levelUp?: boolean;
    newLevel?: number;
    achievements?: string[];
  };
}

export function MissionCompletion({ isOpen, onClose, mission }: MissionCompletionProps) {
  const [showRewards, setShowRewards] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Show rewards after a short delay
      const timer1 = setTimeout(() => setShowRewards(true), 500);
      // Show level up animation if applicable
      if (mission.levelUp) {
        const timer2 = setTimeout(() => setShowLevelUp(true), 1500);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
      return () => clearTimeout(timer1);
    } else {
      setShowRewards(false);
      setShowLevelUp(false);
    }
  }, [isOpen, mission.levelUp]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="p-8 text-center relative overflow-hidden">
            {/* Background particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{ 
                    x: Math.random() * 400, 
                    y: Math.random() * 400,
                    scale: 0 
                  }}
                  animate={{ 
                    x: Math.random() * 400, 
                    y: Math.random() * 400,
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 2,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 3
                  }}
                />
              ))}
            </div>

            {/* Mission completion content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="h-10 w-10 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold mb-2">Mission Complete!</h2>
              <p className="text-lg text-muted-foreground mb-6">{mission.title}</p>

              {/* XP Reward */}
              <AnimatePresence>
                {showRewards && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="h-5 w-5" />
                      <span className="text-xl font-bold">+{mission.xpEarned} XP</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Level Up Animation */}
              <AnimatePresence>
                {showLevelUp && mission.levelUp && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Star className="h-5 w-5" />
                      <span className="text-xl font-bold">Level {mission.newLevel}!</span>
                    </div>
                    <p className="text-sm opacity-90">You've leveled up!</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Achievements */}
              {mission.achievements && mission.achievements.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="space-y-2 mb-6"
                >
                  <h3 className="font-semibold text-sm text-muted-foreground">Achievements Unlocked</h3>
                  {mission.achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span>{achievement}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <Button
                onClick={onClose}
                className="w-full"
                size="lg"
              >
                Continue
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// XP Gain Animation Component
export function XPGainAnimation({ xp, onComplete }: { xp: number; onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 0 }}
          animate={{ scale: 1, opacity: 1, y: -50 }}
          exit={{ scale: 0, opacity: 0, y: -100 }}
          transition={{ duration: 0.5 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="font-bold">+{xp} XP</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Level Up Animation Component
export function LevelUpAnimation({ newLevel, onComplete }: { newLevel: number; onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-2xl text-center max-w-sm mx-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Star className="h-8 w-8" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">Level Up!</h2>
            <p className="text-xl mb-4">You're now level {newLevel}</p>
            <p className="text-sm opacity-90">Keep up the great work!</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
