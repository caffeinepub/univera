import { useNavigate } from "@tanstack/react-router";
import { Check, X, Zap } from "lucide-react";
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

function Cell({ val }: { val: string | boolean }) {
  if (val === true)
    return <Check size={14} className="mx-auto text-green-400" />;
  if (val === false) return <span className="text-white/30 text-xs">✗</span>;
  return <span className="text-xs font-medium text-white/80">{val}</span>;
}

export function UpgradeModal() {
  const {
    showUpgradeModal,
    setShowUpgradeModal,
    setUser,
    user,
    mode,
    upgradeReason,
    planType,
    setPlanType,
  } = useApp();
  const navigate = useNavigate();

  if (!showUpgradeModal) return null;

  const isBff = mode === "bff";

  const handleUpgrade = (plan: "monthly" | "yearly") => {
    setShowUpgradeModal(false);
    const amount = plan === "monthly" ? 19900 : 49900;
    const description =
      plan === "monthly" ? "UNIVÈRA Pro Monthly" : "UNIVÈRA Pro Yearly";

    const options = {
      key: "rzp_test_SXNtg8RRNlaboL",
      amount,
      currency: "INR",
      name: "UNIVÈRA",
      description,
      image: "/favicon.ico",
      handler: (_response: any) => {
        const expiryMs =
          plan === "monthly"
            ? Date.now() + 30 * 24 * 60 * 60 * 1000
            : Date.now() + 365 * 24 * 60 * 60 * 1000;
        setPlanType(plan, expiryMs);
        if (user) setUser({ ...user, isPro: true });
      },
      prefill: { name: user?.name || "", email: user?.email || "" },
      theme: { color: isBff ? "#F59E0B" : "#7C3AED" },
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const headline = upgradeReason ?? "Upgrade to UNIVÈRA Pro";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
      data-ocid="upgrade.modal"
    >
      <div className="w-full max-w-[430px] glass-card rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom overflow-y-auto max-h-[90dvh]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-400" size={20} />
            <h2 className="text-base font-bold text-foreground leading-tight">
              {headline}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowUpgradeModal(false)}
            className="text-muted-foreground hover:text-foreground"
            data-ocid="upgrade.close_button"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3-tier comparison table */}
        <div
          className="rounded-2xl overflow-hidden mb-5"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {/* Header row */}
          <div
            className="grid grid-cols-4 text-center"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="p-2 text-xs text-muted-foreground font-medium border-r border-white/10">
              Feature
            </div>
            <div className="p-2 text-xs text-white/60 font-medium border-r border-white/10">
              FREE
            </div>
            <div
              className="p-2 text-xs font-bold border-r border-white/10"
              style={{ color: "#a78bfa", background: "rgba(124,58,237,0.18)" }}
            >
              ₹199/mo
            </div>
            <div
              className="p-2 text-xs font-bold relative"
              style={{ color: "#f59e0b", background: "rgba(245,158,11,0.12)" }}
            >
              ₹499/yr
              <span
                className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #f97316)",
                  whiteSpace: "nowrap",
                }}
              >
                Best
              </span>
            </div>
          </div>
          {/* Data rows */}
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
                    planType === "monthly" ? "rgba(124,58,237,0.1)" : undefined,
                }}
              >
                <Cell val={row.monthly} />
              </div>
              <div
                className="p-2.5 flex items-center justify-center"
                style={{
                  background:
                    planType === "yearly" ? "rgba(245,158,11,0.08)" : undefined,
                }}
              >
                <Cell val={row.yearly} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => handleUpgrade("monthly")}
            className="rounded-2xl p-4 text-center hover:scale-105 transition-transform"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "2px solid rgba(124,58,237,0.5)",
            }}
            data-ocid="upgrade.primary_button"
          >
            <div className="text-xl font-bold" style={{ color: "#a78bfa" }}>
              ₹199
            </div>
            <div className="text-xs text-white/50 mt-0.5">per month</div>
          </button>
          <button
            type="button"
            onClick={() => handleUpgrade("yearly")}
            className="rounded-2xl p-4 text-center hover:scale-105 transition-transform relative"
            style={{
              background: "rgba(245,158,11,0.12)",
              border: "2px solid rgba(245,158,11,0.5)",
            }}
            data-ocid="upgrade.confirm_button"
          >
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}
            >
              Best Value
            </div>
            <div className="text-xl font-bold" style={{ color: "#f59e0b" }}>
              ₹499
            </div>
            <div className="text-xs text-white/50 mt-0.5">per year</div>
            <div className="text-xs text-green-400 mt-0.5 font-medium">
              Save ₹1,889
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowUpgradeModal(false);
            navigate({ to: "/subscription" });
          }}
          className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
          data-ocid="upgrade.secondary_button"
        >
          See full plans →
        </button>
        <p className="text-center text-muted-foreground/60 text-xs mt-2">
          Billed via Razorpay · Secure payment
        </p>
      </div>
    </div>
  );
}
