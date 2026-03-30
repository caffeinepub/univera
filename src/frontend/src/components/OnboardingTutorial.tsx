import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

interface TutorialStep {
  title: string;
  description: string;
  emoji: string;
  spotlightY: string;
  tooltipSide: "bottom" | "top";
}

const STEPS: TutorialStep[] = [
  {
    title: "Swipe to Connect",
    description:
      "Drag right to like, left to pass. Or tap the ❤️ and ✕ buttons below!",
    emoji: "👈 👉",
    spotlightY: "42%",
    tooltipSide: "bottom",
  },
  {
    title: "Super Like to Stand Out ⭐",
    description:
      "Tap the star to Super Like someone — they'll get a special notification!",
    emoji: "⭐",
    spotlightY: "84%",
    tooltipSide: "top",
  },
  {
    title: "Explore Likes & Chats",
    description:
      "Head to Likes to see who liked you. Open Chat to talk to your matches!",
    emoji: "💬",
    spotlightY: "94%",
    tooltipSide: "top",
  },
];

interface OnboardingTutorialProps {
  onDone: () => void;
}

export function OnboardingTutorial({ onDone }: OnboardingTutorialProps) {
  const { setTutorialDone } = useApp();
  const [stepIdx, setStepIdx] = useState(0);

  const current = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setTutorialDone(true);
      onDone();
    } else {
      setStepIdx((p) => p + 1);
    }
  };

  const handleSkip = () => {
    setTutorialDone(true);
    onDone();
  };

  // Compute tooltip top position based on spotlightY
  const spotlightYNum = Number.parseFloat(current.spotlightY);
  const tooltipTop =
    current.tooltipSide === "bottom"
      ? `${spotlightYNum + 12}%`
      : `${spotlightYNum - 32}%`;

  return (
    <AnimatePresence>
      <motion.div
        key="tutorial-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 160px 160px at 50% ${current.spotlightY}, transparent 55%, rgba(0,0,0,0.86) 56%)`,
        }}
      >
        {/* Spotlight pulse ring */}
        <motion.div
          key={`ring-${stepIdx}`}
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: current.spotlightY,
            transform: "translate(-50%, -50%)",
            width: 170,
            height: 170,
            borderRadius: "50%",
            border: "2px solid rgba(124,58,237,0.8)",
            boxShadow: "0 0 28px rgba(124,58,237,0.5)",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.9, 0.4, 0.9] }}
          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
        />

        {/* Tooltip card */}
        <motion.div
          key={`card-${stepIdx}`}
          initial={{
            opacity: 0,
            y: current.tooltipSide === "bottom" ? -14 : 14,
            scale: 0.96,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="absolute left-4 right-4 pointer-events-auto"
          style={{ top: tooltipTop }}
        >
          <div
            className="rounded-2xl p-5 shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #1a1035 0%, #1e0a30 100%)",
              border: "1.5px solid rgba(124,58,237,0.45)",
              boxShadow: "0 8px 40px rgba(124,58,237,0.3)",
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl flex-shrink-0">{current.emoji}</span>
              <div>
                <h3 className="font-display text-base font-black text-white mb-1">
                  {current.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {current.description}
                </p>
              </div>
            </div>

            {/* Step dots + buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: tutorial steps are static
                    key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === stepIdx ? 20 : 6,
                      height: 6,
                      background:
                        i === stepIdx
                          ? "linear-gradient(90deg, #7C3AED, #EC4899)"
                          : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-white/50 hover:text-white transition-colors"
                  data-ocid="tutorial.cancel_button"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  }}
                  data-ocid="tutorial.confirm_button"
                >
                  {isLast ? "Got it! 🎉" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
