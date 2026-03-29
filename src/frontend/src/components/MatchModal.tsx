import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { PROFILES } from "../data/mockData";

interface Confetti {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

export function MatchModal() {
  const { showMatchModal, matchedProfile, setMatchModal, addMatch } = useApp();
  const navigate = useNavigate();
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    if (showMatchModal) {
      const pieces = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ["#7C3AED", "#EC4899", "#8B5CF6", "#F59E0B", "#22C55E"][i % 5],
        delay: Math.random() * 1.5,
        size: Math.random() * 8 + 6,
      }));
      setConfetti(pieces);
    }
  }, [showMatchModal]);

  if (!showMatchModal || !matchedProfile) return null;

  const myPhoto = PROFILES[0].photo;

  const handleMessage = () => {
    addMatch(matchedProfile.id);
    setMatchModal(null);
    navigate({ to: "/matches" });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      data-ocid="match.modal"
    >
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute top-0 animate-confetti_fall pointer-events-none rounded-sm"
          style={{
            left: `${c.x}%`,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      <div className="text-center px-8">
        <div className="text-5xl font-display font-black text-gradient-violet mb-2">
          It's a Match! 🎉
        </div>
        <p className="text-muted-foreground mb-8">
          You and {matchedProfile.name} liked each other
        </p>

        <div className="flex justify-center items-center gap-4 mb-10">
          <div className="w-28 h-28 rounded-full overflow-hidden neon-border-pink">
            <img
              src={myPhoto}
              alt="You"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-4xl animate-pulse_glow">💜</div>
          <div className="w-28 h-28 rounded-full overflow-hidden neon-border-violet">
            <img
              src={matchedProfile.photo}
              alt={matchedProfile.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleMessage}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white mb-3 shadow-btn-violet"
          style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
          data-ocid="match.confirm_button"
        >
          💬 Send Message
        </button>
        <button
          type="button"
          onClick={() => setMatchModal(null)}
          className="w-full py-3 rounded-2xl font-semibold text-muted-foreground glass-dark"
          data-ocid="match.cancel_button"
        >
          Keep Swiping
        </button>
      </div>
    </div>
  );
}
