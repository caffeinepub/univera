import { useNavigate } from "@tanstack/react-router";
import { Heart, MessageCircle, Sparkles, Star, X, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";

export function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal, setUser, user, mode } =
    useApp();
  const navigate = useNavigate();

  if (!showUpgradeModal) return null;

  const handleUpgrade = () => {
    if (user) setUser({ ...user, isPro: true });
    setShowUpgradeModal(false);
  };

  const isBff = mode === "bff";
  const gradientBtn = isBff
    ? "linear-gradient(135deg, #F59E0B, #F97316)"
    : "linear-gradient(135deg, #7C3AED, #EC4899)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
      data-ocid="upgrade.modal"
    >
      <div className="w-full max-w-[430px] glass-card rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-400" size={24} />
            <h2 className="text-xl font-bold text-foreground">
              Upgrade to UNIVÈRA Pro
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowUpgradeModal(false)}
            className="text-muted-foreground hover:text-foreground"
            data-ocid="upgrade.close_button"
          >
            <X size={22} />
          </button>
        </div>

        <p className="text-muted-foreground text-sm mb-6">
          You've used all your daily likes. Go Pro for unlimited connections.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: Heart, label: "Unlimited Likes" },
            { icon: Star, label: "Unlimited Super Likes" },
            { icon: Sparkles, label: "AI Match Suggestions" },
            { icon: MessageCircle, label: "Priority in Chats" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white/5 rounded-xl p-3"
            >
              <Icon size={16} className="text-primary" />
              <span className="text-xs text-foreground font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="neon-border-violet rounded-2xl p-4 text-center cursor-pointer hover:bg-primary/10 transition-colors">
            <div className="text-2xl font-bold text-primary">₹199</div>
            <div className="text-xs text-muted-foreground mt-1">per month</div>
          </div>
          <div className="neon-border-pink rounded-2xl p-4 text-center cursor-pointer hover:bg-accent/10 transition-colors relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs px-3 py-0.5 rounded-full font-semibold">
              Best Value
            </div>
            <div className="text-2xl font-bold text-accent">₹499</div>
            <div className="text-xs text-muted-foreground mt-1">per year</div>
            <div className="text-xs text-green-400 mt-0.5 font-medium">
              Save ₹1,889
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowUpgradeModal(false);
            navigate({ to: "/subscription" });
          }}
          className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors mb-4 underline underline-offset-2"
          data-ocid="upgrade.secondary_button"
        >
          See full plans →
        </button>

        <button
          type="button"
          onClick={handleUpgrade}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: gradientBtn }}
          data-ocid="upgrade.confirm_button"
        >
          ✨ Get Pro Now
        </button>
      </div>
    </div>
  );
}
