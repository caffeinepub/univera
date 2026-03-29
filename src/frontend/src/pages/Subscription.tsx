import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

const FEATURES = [
  {
    icon: "💚",
    label: "Unlimited Likes",
    desc: "Swipe freely with no daily limits",
  },
  {
    icon: "✨",
    label: "AI-Powered Matching",
    desc: "Smart compatibility scores & suggestions",
  },
  {
    icon: "⭐",
    label: "Unlimited Super Likes",
    desc: "Stand out and get noticed instantly",
  },
  {
    icon: "💬",
    label: "Priority in Chats",
    desc: "Your messages appear at the top",
  },
  { icon: "🚫", label: "No Ads", desc: "Clean, uninterrupted experience" },
  {
    icon: "🔍",
    label: "Advanced Filters",
    desc: "Filter by major, interests, and more",
  },
];

export function Subscription() {
  const navigate = useNavigate();
  const { user, setUser, mode } = useApp();
  const [selected, setSelected] = useState<"monthly" | "annual">("annual");
  const [success, setSuccess] = useState(false);

  const isBff = mode === "bff";
  const gradient = isBff
    ? "linear-gradient(135deg, #F59E0B, #F97316)"
    : "linear-gradient(135deg, #7C3AED, #EC4899)";
  const accentColor = isBff ? "#F59E0B" : "#8b5cf6";
  const accentBorder = isBff ? "rgba(245,158,11,0.4)" : "rgba(139,92,246,0.4)";
  const accentBg = isBff ? "rgba(245,158,11,0.12)" : "rgba(139,92,246,0.12)";

  const handleUpgrade = () => {
    if (user) setUser({ ...user, isPro: true });
    setSuccess(true);
    setTimeout(() => navigate({ to: "/app" }), 1500);
  };

  if (success) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center text-center px-6"
        style={{
          background:
            "linear-gradient(160deg, #0b0e14 0%, #241b45 50%, #3a1e5e 100%)",
        }}
        data-ocid="subscription.success_state"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="font-display text-3xl font-black text-white mb-2">
            Welcome to Pro!
          </h2>
          <p className="text-white/60">Redirecting you to the app...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col max-w-[430px] mx-auto"
      style={{
        background: isBff
          ? "linear-gradient(160deg, #1a0f00 0%, #3d2000 50%, #5c3000 100%)"
          : "linear-gradient(160deg, #0b0e14 0%, #241b45 50%, #3a1e5e 100%)",
      }}
      data-ocid="subscription.page"
    >
      {/* Header */}
      <header className="px-5 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          className="text-white/60 hover:text-white transition-colors"
          data-ocid="subscription.cancel_button"
        >
          <ArrowLeft size={22} />
        </button>
        <span
          className="font-display text-xl font-black"
          style={{
            background: gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          UNIVÈRA Pro
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Hero badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 mt-4"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
            style={{
              background: accentBg,
              border: `1px solid ${accentBorder}`,
              color: accentColor,
            }}
          >
            <Sparkles size={14} />
            Unlock the full UNIVÈRA experience
          </div>
          <h1 className="font-display text-3xl font-black text-white">
            Connect without limits
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Premium features designed for DGU students
          </p>
        </motion.div>

        {/* Features list */}
        <div className="space-y-3 mb-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-4 rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-2xl">{f.icon}</span>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm">
                  {f.label}
                </div>
                <div className="text-white/50 text-xs mt-0.5">{f.desc}</div>
              </div>
              <Check size={16} style={{ color: accentColor }} />
            </motion.div>
          ))}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Monthly */}
          <button
            type="button"
            onClick={() => setSelected("monthly")}
            className="rounded-2xl p-5 text-center transition-all relative"
            style={{
              background:
                selected === "monthly" ? accentBg : "rgba(255,255,255,0.04)",
              border:
                selected === "monthly"
                  ? `2px solid ${accentColor}`
                  : "2px solid rgba(255,255,255,0.1)",
            }}
            data-ocid="subscription.radio"
          >
            {selected === "monthly" && (
              <div
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: gradient }}
              >
                <Check size={10} className="text-white" />
              </div>
            )}
            <div className="font-display text-3xl font-black text-white">
              ₹199
            </div>
            <div className="text-white/50 text-xs mt-1">per month</div>
            <div className="text-white/30 text-xs mt-2">Billed monthly</div>
          </button>

          {/* Annual */}
          <button
            type="button"
            onClick={() => setSelected("annual")}
            className="rounded-2xl p-5 text-center transition-all relative"
            style={{
              background:
                selected === "annual" ? accentBg : "rgba(255,255,255,0.04)",
              border:
                selected === "annual"
                  ? `2px solid ${accentColor}`
                  : "2px solid rgba(255,255,255,0.1)",
            }}
            data-ocid="subscription.checkbox"
          >
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ background: gradient }}
            >
              Best Value
            </div>
            {selected === "annual" && (
              <div
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: gradient }}
              >
                <Check size={10} className="text-white" />
              </div>
            )}
            <div className="font-display text-3xl font-black text-white">
              ₹499
            </div>
            <div className="text-white/50 text-xs mt-1">per year</div>
            <div
              className="text-xs mt-2 font-semibold"
              style={{ color: "#4ade80" }}
            >
              Save ₹1,889
            </div>
          </button>
        </div>

        {/* CTA */}
        <motion.button
          type="button"
          onClick={handleUpgrade}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 shadow-lg"
          style={{ background: gradient }}
          data-ocid="subscription.confirm_button"
        >
          <Zap size={20} />
          Upgrade Now · {selected === "annual" ? "₹499/year" : "₹199/month"}
        </motion.button>

        <p className="text-center text-white/30 text-xs mt-4">
          Cancel anytime · Exclusive to DGU students
        </p>
      </div>
    </div>
  );
}
