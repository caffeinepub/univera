import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

const TABLE_ROWS = [
  { label: "Swipes / day", free: "5", monthly: "10", yearly: "Unlimited" },
  {
    label: "Super Likes",
    free: "1/week",
    monthly: "1/day",
    yearly: "Unlimited",
  },
  { label: "Ads", free: "3/day", monthly: "None", yearly: "None" },
  { label: "AI Matches", free: false, monthly: true, yearly: true },
  { label: "Priority Chat", free: false, monthly: true, yearly: true },
  { label: "Boosts", free: "—", monthly: "1/week", yearly: "4/week" },
  { label: "Screenshot", free: false, monthly: true, yearly: true },
];

function Cell({ val, accent }: { val: string | boolean; accent?: string }) {
  if (val === true)
    return (
      <Check
        size={14}
        className="mx-auto"
        style={{ color: accent ?? "#22c55e" }}
      />
    );
  if (val === false) return <span className="text-white/30 text-xs">✗</span>;
  return <span className="text-xs font-medium text-white/80">{val}</span>;
}

export function Subscription() {
  const navigate = useNavigate();
  const { user, setUser, mode, setPlanType, planType } = useApp();
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
    const amount = selected === "annual" ? 49900 : 19900; // in paise
    const planName =
      selected === "annual" ? "UNIVÈRA Pro Annual" : "UNIVÈRA Pro Monthly";

    const options = {
      key: "rzp_test_SXNtg8RRNlaboL",
      amount: amount,
      currency: "INR",
      name: "UNIVÈRA",
      description: planName,
      image: "/favicon.ico",
      handler: (_response: any) => {
        // Payment successful
        const expiryMs =
          selected === "annual"
            ? Date.now() + 365 * 24 * 60 * 60 * 1000
            : Date.now() + 30 * 24 * 60 * 60 * 1000;
        const planKey = selected === "annual" ? "yearly" : "monthly";
        setPlanType(planKey, expiryMs);
        if (user) setUser({ ...user, isPro: true });
        setSuccess(true);
        setTimeout(() => navigate({ to: "/app" }), 1500);
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      notes: {
        plan: selected,
      },
      theme: {
        color: isBff ? "#F59E0B" : "#7C3AED",
      },
      modal: {
        ondismiss: () => {
          // User closed without paying — do nothing
        },
      },
    };

    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
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

        {/* 3-tier comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl overflow-hidden mb-8"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          data-ocid="subscription.table"
        >
          {/* Header */}
          <div
            className="grid grid-cols-4 text-center"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div className="p-2 text-[11px] text-white/50 font-medium border-r border-white/10">
              Feature
            </div>
            <div className="p-2 text-[11px] text-white/60 font-medium border-r border-white/10">
              FREE
              {planType === "free" && (
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 mx-auto mt-0.5" />
              )}
            </div>
            <div
              className="p-2 text-[11px] font-bold border-r border-white/10 relative"
              style={{
                color: accentColor,
                background: "rgba(139,92,246,0.18)",
              }}
            >
              ₹199/mo
              {planType === "monthly" && (
                <div
                  className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5"
                  style={{ background: accentColor }}
                />
              )}
            </div>
            <div
              className="p-2 text-[11px] font-bold relative"
              style={{ color: "#f59e0b", background: "rgba(245,158,11,0.12)" }}
            >
              ₹499/yr
              <span
                className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#f97316)",
                  whiteSpace: "nowrap",
                }}
              >
                Best
              </span>
              {planType === "yearly" && (
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mx-auto mt-0.5" />
              )}
            </div>
          </div>
          {TABLE_ROWS.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-4 text-center"
              style={{
                background:
                  i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="p-2.5 text-[11px] text-left text-white/70 border-r border-white/10 font-medium">
                {row.label}
              </div>
              <div className="p-2.5 flex items-center justify-center border-r border-white/10">
                <Cell val={row.free} />
              </div>
              <div
                className="p-2.5 flex items-center justify-center border-r border-white/10"
                style={{
                  background:
                    planType === "monthly" ? "rgba(139,92,246,0.1)" : undefined,
                }}
              >
                <Cell val={row.monthly} accent={accentColor} />
              </div>
              <div
                className="p-2.5 flex items-center justify-center"
                style={{
                  background:
                    planType === "yearly" ? "rgba(245,158,11,0.08)" : undefined,
                }}
              >
                <Cell val={row.yearly} accent="#f59e0b" />
              </div>
            </div>
          ))}
        </motion.div>

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
