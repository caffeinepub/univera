import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (type: "likes" | "superlike", amount: number) => void;
  rewardType?: "likes" | "superlike";
  adsExhausted?: boolean;
  onUpgrade?: () => void;
}

const ADS = [
  {
    brand: "Swiggy Campus",
    tagline: "Late night cravings? We got you. 🍕",
    subline: "Order food on campus — delivered in 20 mins!",
    accent: "#FF6B35",
    bg: "linear-gradient(135deg, #FF6B35 0%, #FF3D00 50%, #7C1500 100%)",
    logo: "🛵",
  },
  {
    brand: "Spotify Students",
    tagline: "Study. Vibe. Repeat. 🎧",
    subline: "Premium for ₹59/month. Only for students.",
    accent: "#1DB954",
    bg: "linear-gradient(135deg, #1DB954 0%, #158a3e 50%, #0a3d1f 100%)",
    logo: "🎵",
  },
  {
    brand: "boAt Audio",
    tagline: "Hear the difference. Feel the bass. 🔊",
    subline: "Campus exclusive: 20% off all headphones.",
    accent: "#E63946",
    bg: "linear-gradient(135deg, #E63946 0%, #a0262f 50%, #3d0d11 100%)",
    logo: "🎧",
  },
];

const CONFETTI_COLORS = ["#F59E0B", "#EC4899", "#7C3AED", "#1DB954", "#FF6B35"];
const CONFETTI_ITEMS = [
  { id: "c0", left: "8%" },
  { id: "c1", left: "15.5%" },
  { id: "c2", left: "23%" },
  { id: "c3", left: "30.5%" },
  { id: "c4", left: "38%" },
  { id: "c5", left: "45.5%" },
  { id: "c6", left: "53%" },
  { id: "c7", left: "60.5%" },
  { id: "c8", left: "68%" },
  { id: "c9", left: "75.5%" },
  { id: "c10", left: "83%" },
  { id: "c11", left: "90.5%" },
];

const COUNTDOWN = 5;
const SKIP_AFTER = 3;

export function RewardedAdModal({
  isOpen,
  onClose,
  onReward,
  rewardType = "likes",
  adsExhausted = false,
  onUpgrade,
}: RewardedAdModalProps) {
  const [phase, setPhase] = useState<"ad" | "reward">("ad");
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN);
  const [canSkip, setCanSkip] = useState(false);
  const [adIndex] = useState(() => Math.floor(Math.random() * ADS.length));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen || adsExhausted) {
      setPhase("ad");
      setTimeLeft(COUNTDOWN);
      setCanSkip(false);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("reward");
          return 0;
        }
        const next = prev - 1;
        if (next <= COUNTDOWN - SKIP_AFTER) setCanSkip(true);
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, adsExhausted]);

  const handleClaim = () => {
    const amount = rewardType === "likes" ? 2 : 1;
    onReward(rewardType, amount);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  const ad = ADS[adIndex];
  const progress = ((COUNTDOWN - timeLeft) / COUNTDOWN) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(8px)",
          }}
          data-ocid="rewarded_ad.modal"
        >
          {/* Ads exhausted state */}
          {adsExhausted ? (
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-sm mx-4 rounded-3xl overflow-hidden shadow-2xl text-center p-8"
              style={{
                background:
                  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                border: "2px solid rgba(124,58,237,0.3)",
              }}
              data-ocid="rewarded_ad.error_state"
            >
              <div className="text-6xl mb-4">🎥</div>
              <h2 className="text-xl font-black text-white mb-2">
                Ad Limit Reached
              </h2>
              <p className="text-white/60 text-sm mb-6">
                You've reached today's ad limit. Come back tomorrow 🎥
              </p>
              <button
                type="button"
                onClick={onUpgrade}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm mb-3"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                }}
                data-ocid="rewarded_ad.confirm_button"
              >
                ✨ Upgrade to Pro for Unlimited
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl font-medium text-white/60 text-sm hover:text-white transition-colors"
                data-ocid="rewarded_ad.close_button"
              >
                Maybe Later
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {phase === "ad" ? (
                <motion.div
                  key="ad"
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full max-w-sm mx-4 rounded-3xl overflow-hidden shadow-2xl"
                  style={{ background: ad.bg }}
                >
                  {/* Ad label */}
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(0,0,0,0.4)", color: "#fff" }}
                    >
                      AD
                    </span>
                  </div>

                  {/* Skip button */}
                  {canSkip && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleSkip}
                      className="absolute top-4 right-4 z-10 text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: "rgba(0,0,0,0.4)", color: "#fff" }}
                      data-ocid="rewarded_ad.close_button"
                    >
                      Skip ›
                    </motion.button>
                  )}

                  {/* Ad creative */}
                  <div className="px-8 py-12 flex flex-col items-center text-center">
                    <div className="text-7xl mb-6">{ad.logo}</div>
                    <div className="text-xs font-extrabold tracking-widest uppercase mb-3 opacity-80 text-white">
                      {ad.brand}
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3 leading-snug">
                      {ad.tagline}
                    </h2>
                    <p className="text-sm text-white/80 mb-8">{ad.subline}</p>
                    <button
                      type="button"
                      className="px-8 py-3 rounded-full font-extrabold text-sm text-white shadow-lg"
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "2px solid rgba(255,255,255,0.5)",
                      }}
                    >
                      Learn More
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="px-8 pb-6">
                    <div
                      className="relative h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    >
                      <motion.div
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{ background: "rgba(255,255,255,0.9)" }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "linear" }}
                      />
                    </div>
                    <p className="text-center text-xs text-white/60 mt-2 font-medium">
                      {timeLeft > 0
                        ? `Reward in ${timeLeft}s`
                        : "Almost there!"}
                    </p>
                  </div>

                  <style>{`
                    @keyframes confetti-fall {
                      0% { transform: translateY(-20px) rotate(0deg); opacity:1; }
                      100% { transform: translateY(400px) rotate(720deg); opacity:0; }
                    }
                    .confetti-dot {
                      position:absolute; width:8px; height:8px; border-radius:50%;
                      animation: confetti-fall linear infinite;
                    }
                  `}</style>
                </motion.div>
              ) : (
                <motion.div
                  key="reward"
                  initial={{ scale: 0.7, opacity: 0, y: 40 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="relative w-full max-w-sm mx-4 rounded-3xl overflow-hidden shadow-2xl text-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    border: "2px solid rgba(245,158,11,0.3)",
                  }}
                  data-ocid="rewarded_ad.success_state"
                >
                  {/* Confetti rain */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {CONFETTI_ITEMS.map((item, i) => (
                      <div
                        key={item.id}
                        className="confetti-dot"
                        style={{
                          left: item.left,
                          top: "-10px",
                          background:
                            CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                          animationDuration: `${1.2 + (i % 4) * 0.3}s`,
                          animationDelay: `${(i % 5) * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="px-8 py-10">
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.1,
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                      className="text-7xl mb-5"
                    >
                      {rewardType === "likes" ? "🎉" : "⭐"}
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-black text-white mb-2"
                    >
                      Reward Earned!
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-base font-semibold mb-6"
                      style={{ color: "#F59E0B" }}
                    >
                      {rewardType === "likes"
                        ? "You earned +2 bonus likes! ❤️"
                        : "You earned 1 Super Like! ⭐"}
                    </motion.p>

                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      onClick={handleClaim}
                      className="w-full py-4 rounded-2xl font-extrabold text-base text-white shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        boxShadow: "0 0 24px rgba(22,163,74,0.4)",
                      }}
                      data-ocid="rewarded_ad.confirm_button"
                    >
                      Claim Reward 🎁
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
