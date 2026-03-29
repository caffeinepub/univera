import { motion } from "motion/react";
import { useEffect, useState } from "react";

const ADS = [
  {
    brand: "Swiggy Campus",
    text: "Free delivery for students! Use code UNIV50",
    color: "#FF6B35",
    emoji: "🍔",
  },
  {
    brand: "Notion",
    text: "Students get Notion Plus free. Study smarter.",
    color: "#6B7280",
    emoji: "📓",
  },
  {
    brand: "Spotify",
    text: "3 months free with student email. Tune in.",
    color: "#1DB954",
    emoji: "🎵",
  },
  {
    brand: "boAt Audio",
    text: "Campus beats. 30% off for DGU students.",
    color: "#E63946",
    emoji: "🎧",
  },
];

export function AdBanner({ className = "" }: { className?: string }) {
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % ADS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const ad = ADS[adIndex];

  return (
    <motion.div
      key={adIndex}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 glass-card overflow-hidden ${className}`}
      style={{ minHeight: 64 }}
    >
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: ad.color }}
      />

      {/* Ad label */}
      <span
        className="absolute top-1.5 right-2 text-[9px] font-bold uppercase tracking-widest rounded px-1 py-0.5"
        style={{
          background: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        Ad
      </span>

      <span className="text-2xl flex-shrink-0">{ad.emoji}</span>

      <div className="flex-1 min-w-0 pr-4">
        <div
          className="text-xs font-black uppercase tracking-wide mb-0.5"
          style={{ color: ad.color }}
        >
          {ad.brand}
        </div>
        <div className="text-xs text-foreground/80 leading-tight truncate">
          {ad.text}
        </div>
      </div>
    </motion.div>
  );
}
