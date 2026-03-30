import { Flame, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function BoostButton() {
  const {
    planType,
    boostActive,
    boostExpiresAt,
    activateBoost,
    boostsRemaining,
    setShowUpgradeModal,
    setUpgradeReason,
  } = useApp();

  const [countdown, setCountdown] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDay, setScheduleDay] = useState<number>(() => {
    const stored = localStorage.getItem("univera_boost_schedule");
    return stored ? JSON.parse(stored).day : new Date().getDay();
  });
  const [scheduleHour, setScheduleHour] = useState<number>(() => {
    const stored = localStorage.getItem("univera_boost_schedule");
    return stored ? JSON.parse(stored).hour : 9;
  });
  const scheduleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown tick
  useEffect(() => {
    if (!boostActive || !boostExpiresAt) return;
    const tick = () =>
      setCountdown(formatCountdown(boostExpiresAt - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [boostActive, boostExpiresAt]);

  // Auto-schedule check every minute
  useEffect(() => {
    if (planType === "free") return;
    scheduleRef.current = setInterval(() => {
      const stored = localStorage.getItem("univera_boost_schedule");
      if (!stored) return;
      const { day, hour } = JSON.parse(stored);
      const now = new Date();
      if (
        now.getDay() === day &&
        now.getHours() === hour &&
        now.getMinutes() === 0
      ) {
        if (!boostActive) activateBoost();
      }
    }, 60_000);
    return () => {
      if (scheduleRef.current) clearInterval(scheduleRef.current);
    };
  }, [planType, boostActive, activateBoost]);

  const saveSchedule = () => {
    localStorage.setItem(
      "univera_boost_schedule",
      JSON.stringify({ day: scheduleDay, hour: scheduleHour }),
    );
    setShowSchedule(false);
  };

  const handleBoostClick = () => {
    if (planType === "free") {
      setUpgradeReason("Boost your profile for 5 hours with Pro");
      setShowUpgradeModal(true);
      return;
    }
    if (boostActive) return;
    if (boostsRemaining <= 0) return;
    activateBoost();
  };

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      data-ocid="boost.card"
    >
      {/* Active boost state */}
      {boostActive && boostExpiresAt ? (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
          >
            <Flame size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                🔥 Profile Boosted!
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#f97316)",
                }}
              >
                ACTIVE
              </span>
            </div>
            <div className="text-xs text-white/60 mt-0.5">
              Expires in{" "}
              <span className="font-mono font-bold text-yellow-400">
                {countdown}
              </span>
            </div>
          </div>
        </div>
      ) : planType === "free" ? (
        /* Free plan: show upgrade prompt */
        <button
          type="button"
          onClick={handleBoostClick}
          className="w-full flex items-center gap-3"
          data-ocid="boost.button"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(124,58,237,0.2)",
              border: "1px solid rgba(124,58,237,0.4)",
            }}
          >
            <Zap size={18} className="text-purple-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-bold text-white">Boost Profile</div>
            <div className="text-xs text-white/50 mt-0.5">
              Upgrade to use boosts
            </div>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-full text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)" }}
          >
            PRO
          </span>
        </button>
      ) : (
        /* Paid plan: show boost button */
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleBoostClick}
            disabled={boostsRemaining <= 0}
            className="w-full flex items-center gap-3 disabled:opacity-50"
            data-ocid="boost.button"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  boostsRemaining > 0
                    ? "linear-gradient(135deg, #f59e0b, #f97316)"
                    : "rgba(255,255,255,0.08)",
              }}
            >
              <Flame size={20} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-white">
                🔥 Boost Profile
              </div>
              <div className="text-xs text-white/50 mt-0.5">
                {boostsRemaining > 0
                  ? `${boostsRemaining} boost${boostsRemaining > 1 ? "s" : ""} remaining this week`
                  : "No boosts remaining this week"}
              </div>
            </div>
            {boostsRemaining > 0 && (
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-xl text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#f97316)",
                }}
              >
                Boost
              </span>
            )}
          </button>

          {/* Schedule section */}
          <button
            type="button"
            onClick={() => setShowSchedule((v) => !v)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            data-ocid="boost.toggle"
          >
            ⏰ {showSchedule ? "Hide" : "Set auto-boost schedule"}
          </button>

          {showSchedule && (
            <div
              className="rounded-xl p-3 space-y-2"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div className="flex gap-2 items-center">
                <span className="text-xs text-white/60 w-10">Day</span>
                <select
                  value={scheduleDay}
                  onChange={(e) => setScheduleDay(Number(e.target.value))}
                  className="flex-1 bg-transparent text-white text-xs border border-white/20 rounded-lg px-2 py-1.5"
                  data-ocid="boost.select"
                >
                  {DAYS.map((d, i) => (
                    <option key={d} value={i} className="bg-gray-900">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-white/60 w-10">Hour</span>
                <select
                  value={scheduleHour}
                  onChange={(e) => setScheduleHour(Number(e.target.value))}
                  className="flex-1 bg-transparent text-white text-xs border border-white/20 rounded-lg px-2 py-1.5"
                  data-ocid="boost.select"
                >
                  {[
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                    17, 18, 19, 20, 21, 22, 23,
                  ].map((h) => (
                    <option key={`hour-${h}`} value={h} className="bg-gray-900">
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={saveSchedule}
                className="w-full py-2 rounded-lg text-xs font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                }}
                data-ocid="boost.save_button"
              >
                Save Schedule
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
