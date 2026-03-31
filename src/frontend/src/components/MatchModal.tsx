import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { PROFILES } from "../data/mockData";
import { ImgWithFallback } from "./ImgWithFallback";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
  size: number;
  shape: "circle" | "rect" | "star";
}

const COLORS = [
  "#7C3AED",
  "#EC4899",
  "#8B5CF6",
  "#F59E0B",
  "#22C55E",
  "#3B82F6",
  "#F97316",
  "#E879F9",
];

export function MatchModal() {
  const { showMatchModal, matchedProfile, setMatchModal, addMatch, user } =
    useApp();
  const navigate = useNavigate();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (showMatchModal) {
      const pieces: Particle[] = Array.from({ length: 64 }, (_, i) => ({
        id: i,
        x: 40 + Math.random() * 20, // start near center
        y: 45 + Math.random() * 10,
        angle: (i / 64) * 360 + Math.random() * 20,
        speed: 0.3 + Math.random() * 0.7,
        color: COLORS[i % COLORS.length],
        size: Math.random() * 10 + 5,
        shape: ["circle", "rect", "star"][i % 3] as Particle["shape"],
      }));
      setParticles(pieces);
    } else {
      setParticles([]);
    }
  }, [showMatchModal]);

  if (!showMatchModal || !matchedProfile) return null;

  const myPhoto = user?.photoUrl ?? user?.photos?.[0]?.url ?? PROFILES[0].photo;

  const handleMessage = () => {
    addMatch(matchedProfile.id);
    setMatchModal(null);
    navigate({ to: "/matches" });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "rgba(0,0,0,0.95)" }}
      data-ocid="match.modal"
    >
      {/* Burst particles */}
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const dist = 180 + p.speed * 160;
        const endX = Math.cos(rad) * dist;
        const endY = Math.sin(rad) * dist + 120; // gravity
        return (
          <motion.div
            key={p.id}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            animate={{
              x: endX,
              y: endY,
              opacity: 0,
              scale: 0.2,
              rotate: Math.random() * 720 - 360,
            }}
            transition={{
              duration: 1.4 + p.speed * 0.8,
              delay: Math.random() * 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: "absolute",
              left: "50%",
              top: "45%",
              width: p.size,
              height: p.shape === "rect" ? p.size * 0.5 : p.size,
              backgroundColor: p.color,
              borderRadius:
                p.shape === "circle" ? "50%" : p.shape === "rect" ? 2 : 0,
              clipPath:
                p.shape === "star"
                  ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                  : undefined,
              marginLeft: -(p.size / 2),
              marginTop: -(p.size / 2),
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        );
      })}

      <div className="relative text-center px-8 z-10">
        {/* Pulsing rings behind photos */}
        <div className="relative flex justify-center items-center mb-10">
          {/* Ring animations */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 220,
              height: 220,
              border: "2px solid rgba(124,58,237,0.4)",
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{
              duration: 2.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 260,
              height: 260,
              border: "2px solid rgba(236,72,153,0.3)",
            }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
            transition={{
              duration: 2.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              border: "1px solid rgba(139,92,246,0.2)",
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{
              duration: 2.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.8,
            }}
          />

          {/* Photos */}
          <motion.div
            initial={{ x: -40, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{
              delay: 0.15,
              type: "spring",
              stiffness: 280,
              damping: 22,
            }}
            className="w-28 h-28 rounded-full overflow-hidden"
            style={{
              border: "3px solid #EC4899",
              boxShadow: "0 0 20px rgba(236,72,153,0.5)",
            }}
          >
            <ImgWithFallback
              src={myPhoto}
              alt="You"
              className="w-full h-full object-cover"
              fallbackAvatar="🧑"
            />
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
            className="text-4xl mx-3 z-10"
          >
            💜
          </motion.div>

          <motion.div
            initial={{ x: 40, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{
              delay: 0.15,
              type: "spring",
              stiffness: 280,
              damping: 22,
            }}
            className="w-28 h-28 rounded-full overflow-hidden"
            style={{
              border: "3px solid #7C3AED",
              boxShadow: "0 0 20px rgba(124,58,237,0.5)",
            }}
          >
            <ImgWithFallback
              src={
                matchedProfile.photos?.[
                  Number(matchedProfile.coverPhotoIndex ?? 0)
                ]?.url ?? matchedProfile.photo
              }
              alt={matchedProfile.name}
              className="w-full h-full object-cover"
              fallbackAvatar="🧑"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="text-5xl font-display font-black mb-2"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            It's a Match! 🎉
          </div>
          <p className="text-white/70 mb-8">
            You and {matchedProfile.name} liked each other
          </p>

          <button
            type="button"
            onClick={handleMessage}
            className="w-full py-4 rounded-2xl font-bold text-lg text-white mb-3"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              boxShadow: "0 4px 24px rgba(124,58,237,0.5)",
            }}
            data-ocid="match.confirm_button"
          >
            💬 Send Message
          </button>
          <button
            type="button"
            onClick={() => setMatchModal(null)}
            className="w-full py-3 rounded-2xl font-semibold text-white/60"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            data-ocid="match.cancel_button"
          >
            Keep Swiping
          </button>
        </motion.div>
      </div>

      {/* AnimatePresence wrapper for mount */}
      <AnimatePresence />
    </div>
  );
}
