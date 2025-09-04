import { useState, useEffect, useCallback } from "react";

/**
 * Easter Eggs Manager
 * Hidden features and fun interactions for engaged users
 */

// Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

// Special phrases that trigger Easter eggs
const TRIGGER_PHRASES = {
  "hire me":
    "🎉 We love the confidence! This cover letter is going to be amazing!",
  "please work": "🤞 Don't worry, I've got your back. Let's make this perfect!",
  chatgpt:
    "🤖 Actually, I'm powered by OpenAI, making your cover letters shine!",
  "lorem ipsum":
    "📜 Ah, a classic! But let's use your real experience instead.",
  "copy paste": "✨ We're making it even better than copy-paste!",
  "dream job": "🌟 Let's make that dream a reality!",
  "42": "🌌 The answer to life, the universe, and your job search!",
};

// Achievement system
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_generation",
    title: "First Steps",
    description: "Generated your first cover letter",
    icon: "🎯",
    unlocked: false,
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Edited and regenerated 5 times",
    icon: "✨",
    unlocked: false,
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Generated a letter in under 30 seconds",
    icon: "⚡",
    unlocked: false,
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Used the app after midnight",
    icon: "🦉",
    unlocked: false,
  },
  {
    id: "export_master",
    title: "Export Master",
    description: "Exported in all three formats",
    icon: "📁",
    unlocked: false,
  },
  {
    id: "konami_master",
    title: "Konami Master",
    description: "Found the secret code",
    icon: "🎮",
    unlocked: false,
  },
];

export function useEasterEggs() {
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("achievements");
      return saved ? JSON.parse(saved) : ACHIEVEMENTS;
    }
    return ACHIEVEMENTS;
  });
  const [showEasterEgg, setShowEasterEgg] = useState<string | null>(null);
  const [particlesEnabled, setParticlesEnabled] = useState(false);

  // Check for trigger phrases in text
  const checkTriggerPhrases = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    for (const [phrase, message] of Object.entries(TRIGGER_PHRASES)) {
      if (lowerText.includes(phrase)) {
        setShowEasterEgg(message);
        setTimeout(() => setShowEasterEgg(null), 5000);
        return;
      }
    }
  }, []);

  // Unlock achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements((prev) => {
      const updated = prev.map((a) =>
        a.id === achievementId ? { ...a, unlocked: true } : a
      );

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("achievements", JSON.stringify(updated));
      }

      // Show notification
      const achievement = updated.find((a) => a.id === achievementId);
      if (achievement && !prev.find((a) => a.id === achievementId)?.unlocked) {
        setShowEasterEgg(
          `${achievement.icon} Achievement Unlocked: ${achievement.title}!`
        );
        setTimeout(() => setShowEasterEgg(null), 5000);
      }

      return updated;
    });
  }, []);

  // Konami code detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KONAMI_CODE[konamiIndex]) {
        const newIndex = konamiIndex + 1;
        setKonamiIndex(newIndex);

        if (newIndex === KONAMI_CODE.length) {
          // Konami code completed!
          unlockAchievement("konami_master");
          setParticlesEnabled(true);
          setShowEasterEgg(
            "🎮 Konami Code Activated! Enjoy the particle effects!"
          );
          setTimeout(() => setShowEasterEgg(null), 5000);
          setKonamiIndex(0);
        }
      } else if (e.key === KONAMI_CODE[0]) {
        setKonamiIndex(1);
      } else {
        setKonamiIndex(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiIndex, unlockAchievement]);

  // Check for night owl achievement
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour <= 5) {
      unlockAchievement("night_owl");
    }
  }, [unlockAchievement]);

  return {
    checkTriggerPhrases,
    unlockAchievement,
    achievements,
    showEasterEgg,
    particlesEnabled,
  };
}
