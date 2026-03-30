import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Eye,
  Heart,
  MessageCircle,
  Moon,
  Play,
  Sparkles,
  Star,
  Sun,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AdBanner } from "../components/AdBanner";
import { BottomNav } from "../components/BottomNav";
import { ImgWithFallback } from "../components/ImgWithFallback";
import { MatchModal } from "../components/MatchModal";
import { ModeToggle } from "../components/ModeToggle";
import { NotificationTray } from "../components/NotificationTray";
import { OnboardingTutorial } from "../components/OnboardingTutorial";
import { ProfileViewer } from "../components/ProfileViewer";
import { RewardedAdModal } from "../components/RewardedAdModal";
import { UpgradeModal } from "../components/UpgradeModal";
import { useApp } from "../context/AppContext";
import type { Profile } from "../data/mockData";
import type { PROFILES } from "../data/mockData";

// ─── Daily Like Counter ────────────────────────────────────────────────────────
function DailyLikeCounter({
  dailySwipesUsed,
  swipesLimit,
  nextSwipeResetIn,
  canWatchAd,
  onWatchAd,
  onUpgrade,
}: {
  dailySwipesUsed: number;
  swipesLimit: number;
  nextSwipeResetIn: number;
  canWatchAd: boolean;
  onWatchAd: () => void;
  onUpgrade: () => void;
}) {
  const [resetLabel, setResetLabel] = useState("");

  useEffect(() => {
    const calc = () => {
      const ms = nextSwipeResetIn;
      if (ms <= 0) {
        setResetLabel("Resets soon");
        return;
      }
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1_000);
      setResetLabel(`Resets in ${h}h ${m}m ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1_000);
    return () => clearInterval(t);
  }, [nextSwipeResetIn]);

  const pct =
    swipesLimit > 0 ? Math.min((dailySwipesUsed / swipesLimit) * 100, 100) : 0;
  const atLimit = dailySwipesUsed >= swipesLimit;

  const color = atLimit
    ? "#ef4444"
    : dailySwipesUsed >= swipesLimit - 2
      ? "#f59e0b"
      : "#7C3AED";

  return (
    <div className="mx-4 mb-2">
      <div
        className="rounded-2xl px-4 py-2.5 flex items-center gap-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${color}33`,
        }}
      >
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold" style={{ color }}>
              {dailySwipesUsed} / {swipesLimit} swipes used today
            </span>
            <span className="text-[10px] text-muted-foreground">
              {resetLabel}
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <motion.div
              className="h-1.5 rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {atLimit && canWatchAd && (
          <button
            type="button"
            onClick={onWatchAd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
            data-ocid="swipe.primary_button"
          >
            <Play size={10} fill="white" /> Watch ad
          </button>
        )}
        {atLimit && !canWatchAd && (
          <button
            type="button"
            onClick={onUpgrade}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
            data-ocid="swipe.secondary_button"
          >
            Upgrade ✨
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────
function FiltersModal({ onClose }: { onClose: () => void }) {
  const [ageRange, setAgeRange] = useState<[number, number]>(() => {
    const stored = localStorage.getItem("univera_filter_age");
    return stored ? JSON.parse(stored) : [18, 30];
  });
  const [verifiedOnly, setVerifiedOnly] = useState(() => {
    return localStorage.getItem("univera_filter_verified") === "true";
  });

  const handleSave = () => {
    localStorage.setItem("univera_filter_age", JSON.stringify(ageRange));
    localStorage.setItem("univera_filter_verified", String(verifiedOnly));
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      data-ocid="filters.modal"
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] rounded-t-3xl p-6 pb-8"
        style={{
          background: "#12101a",
          border: "1px solid rgba(124,58,237,0.2)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-black text-white">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60"
            style={{ background: "rgba(255,255,255,0.08)" }}
            data-ocid="filters.close_button"
          >
            <X size={16} />
          </button>
        </div>

        {/* Age range */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-white">Age Range</span>
            <span
              className="text-sm font-bold px-3 py-1 rounded-full text-white"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              }}
            >
              {ageRange[0]} – {ageRange[1]}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50 w-12">
                Min: {ageRange[0]}
              </span>
              <input
                type="range"
                min={18}
                max={ageRange[1] - 1}
                value={ageRange[0]}
                onChange={(e) =>
                  setAgeRange([Number(e.target.value), ageRange[1]])
                }
                className="flex-1 accent-purple-500"
                data-ocid="filters.input"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50 w-12">
                Max: {ageRange[1]}
              </span>
              <input
                type="range"
                min={ageRange[0] + 1}
                max={30}
                value={ageRange[1]}
                onChange={(e) =>
                  setAgeRange([ageRange[0], Number(e.target.value)])
                }
                className="flex-1 accent-purple-500"
                data-ocid="filters.input"
              />
            </div>
          </div>
        </div>

        {/* Verified only toggle */}
        <div
          className="flex items-center justify-between py-3 px-4 rounded-xl mb-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div>
            <p className="text-sm font-semibold text-white">Verified Only</p>
            <p className="text-xs text-white/40 mt-0.5">
              Show only blue-checkmark verified profiles
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVerifiedOnly((v) => !v)}
            className="w-11 h-6 rounded-full transition-all flex-shrink-0 flex items-center px-1"
            style={{
              background: verifiedOnly
                ? "linear-gradient(135deg, #7C3AED, #EC4899)"
                : "rgba(255,255,255,0.15)",
            }}
            data-ocid="filters.switch"
          >
            <motion.div
              animate={{ x: verifiedOnly ? 18 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className="w-4 h-4 rounded-full bg-white shadow"
            />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full py-4 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
          data-ocid="filters.confirm_button"
        >
          Apply Filters
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Swipe Card ───────────────────────────────────────────────────────────────
function SwipeCard({
  profile,
  onSwipe,
  isTop,
  onView,
  superLikeStamp,
}: {
  profile: (typeof PROFILES)[0];
  onSwipe: (dir: "left" | "right" | "up") => void;
  isTop: boolean;
  onView: () => void;
  superLikeStamp?: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);
  const superOpacity = useTransform(y, [-100, -20], [1, 0]);
  const dragRef = useRef(false);

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number; y: number } },
  ) => {
    const { offset } = info;
    if (offset.y < -80 && Math.abs(offset.x) < 80) onSwipe("up");
    else if (offset.x > 80) onSwipe("right");
    else if (offset.x < -80) onSwipe("left");
    dragRef.current = false;
  };

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        position: "absolute",
        width: "100%",
        height: "100%",
        cursor: isTop ? "grab" : "default",
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      className="select-none touch-none"
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-card-dark">
        {/* Cover photo from photos array using coverPhotoIndex, fallback to legacy photo field */}
        <ImgWithFallback
          src={
            profile.photos?.[Number(profile.coverPhotoIndex ?? 0)]?.url ??
            profile.photo
          }
          alt={profile.name}
          className="w-full h-full object-cover"
          fallbackAvatar="🧑"
          draggable={false}
          style={{ opacity: 1 }}
        />
        {/* FIX: Soft gradient overlay instead of heavy black */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.2), transparent)",
          }}
        />

        {/* FIX: Removed backdropFilter blur from AI Match badge */}
        <div
          className="absolute top-4 right-4 rounded-full px-3 py-1.5 flex items-center gap-1.5"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.85), rgba(236,72,153,0.85))",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <span className="text-xs font-bold text-white">
            ✨ AI Match {profile.compatibility}%
          </span>
        </div>

        {profile.isPro && (
          <div
            className="absolute top-4 left-4 rounded-full px-3 py-1.5 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
          >
            ⭐ Best Match
          </div>
        )}

        {/* Swipe stamps */}
        <motion.div
          className="swipe-stamp-like"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>
        <motion.div
          className="swipe-stamp-nope"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </motion.div>
        <motion.div
          className="swipe-stamp-super"
          style={{ opacity: superOpacity }}
        >
          SUPER
        </motion.div>

        {/* Super Like stamp overlay */}
        {superLikeStamp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              border: "4px solid #3B82F6",
              borderRadius: 8,
              padding: "6px 16px",
              color: "#3B82F6",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: 3,
              fontFamily: "var(--font-display, serif)",
              textShadow: "0 0 20px rgba(59,130,246,0.8)",
              boxShadow: "0 0 20px rgba(59,130,246,0.4)",
              background: "rgba(0,0,0,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            ⭐ SUPER LIKE!
          </motion.div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5">
          {isTop && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="mb-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
              }}
              data-ocid="swipe.secondary_button"
            >
              <Eye size={12} /> View Profile
            </button>
          )}
          <div className="flex items-end justify-between mb-1">
            {/* FIX: font-black (900) + text shadow for name */}
            <h2
              className="font-display text-3xl font-black text-white"
              style={{ textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}
            >
              {profile.name}, {profile.age}
            </h2>
            {profile.online && (
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">
                  Online
                </span>
              </div>
            )}
          </div>
          {/* FIX: text shadow on major/year */}
          <p
            className="text-white/80 text-sm mb-1"
            style={{ textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}
          >
            {profile.major} · {profile.year}
          </p>
          {/* FIX: text shadow on bio */}
          <p
            className="text-white/70 text-xs mb-3"
            style={{ textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}
          >
            {profile.bio}
          </p>
          {/* FIX: Removed backdrop-blur-sm from interest tags */}
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 text-white"
              >
                {tag}
              </span>
            ))}
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/70">
              📍 {profile.distance}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main SwipeDeck ───────────────────────────────────────────────────────────
export function SwipeDeck() {
  const navigate = useNavigate();
  const {
    profiles,
    currentProfileIndex,
    advanceProfile,
    consumeLike,
    consumeSuperLike,
    addMatch,
    setMatchModal,
    superLikesLeft,
    dailySwipesUsed,
    swipesLimit,
    nextSwipeResetIn,
    canWatchAd,
    user,
    mode,
    rewardLikes,
    incrementAdsWatched,
    adsWatched,
    theme,
    toggleTheme,
    notifications,
    unreadCount,
    markAllRead,
    setShowUpgradeModal,
    setUpgradeReason,
    tutorialDone,
  } = useApp();

  const [exitCard, setExitCard] = useState<{
    id: string;
    dir: "left" | "right" | "up";
  } | null>(null);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTutorial, setShowTutorial] = useState(!tutorialDone);
  const [showFilters, setShowFilters] = useState(false);
  const [superLikeStampId, setSuperLikeStampId] = useState<string | null>(null);
  const [showSuperTooltip, setShowSuperTooltip] = useState(false);

  const rewardType: "likes" | "superlike" =
    adsWatched % 2 === 1 ? "superlike" : "likes";
  const visibleProfiles = profiles.slice(
    currentProfileIndex,
    currentProfileIndex + 3,
  );

  const handleSwipe = (dir: "left" | "right" | "up") => {
    const current = visibleProfiles[0];
    if (!current) return;

    if (dir === "right" || dir === "up") {
      if (dir === "up") {
        const ok = consumeSuperLike();
        if (!ok) {
          // Out of super likes
          if (!user?.isPro) {
            setUpgradeReason("Get Unlimited Super Likes");
            setShowUpgradeModal(true);
          }
          return;
        }
        // Show super like stamp
        setSuperLikeStampId(current.id);
        setTimeout(() => setSuperLikeStampId(null), 800);
      } else {
        const ok = consumeLike();
        if (!ok) {
          // Out of likes — show rewarded ad first if under cap
          if (canWatchAd) {
            setShowRewardedAd(true);
          } else {
            setUpgradeReason("Get Unlimited Likes");
            setShowUpgradeModal(true);
          }
          return;
        }
      }

      const isMatch = Math.random() > 0.4;
      if (isMatch) {
        addMatch(current.id);
        setMatchModal(current);
      }
    }

    setExitCard({ id: current.id, dir });
    setTimeout(() => {
      advanceProfile();
      setExitCard(null);
    }, 350);
  };

  const handleReward = (type: "likes" | "superlike", amount: number) => {
    rewardLikes(type, amount);
    incrementAdsWatched();
  };

  const handleSuperLikeClick = () => {
    if (superLikesLeft === 0 && !user?.isPro) {
      setShowSuperTooltip(true);
      setTimeout(() => setShowSuperTooltip(false), 2500);
      return;
    }
    handleSwipe("up");
  };

  const exitX =
    exitCard?.dir === "right" ? 500 : exitCard?.dir === "left" ? -500 : 0;
  const exitY = exitCard?.dir === "up" ? -500 : 0;
  const exitRotate =
    exitCard?.dir === "right" ? 30 : exitCard?.dir === "left" ? -30 : 0;

  return (
    <div className="app-shell bg-app flex flex-col h-[100dvh]">
      {/* Header */}
      <header className="glass-dark px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <span className="font-display text-xl font-black text-gradient-violet">
          UNIVÈRA
        </span>
        <ModeToggle />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            data-ocid="app.theme.toggle"
          >
            {theme === "dark" ? (
              <Sun
                size={22}
                className="text-muted-foreground hover:text-foreground transition-colors"
              />
            ) : (
              <Moon
                size={22}
                className="text-muted-foreground hover:text-foreground transition-colors"
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/matches" })}
            data-ocid="app.matches.link"
          >
            <MessageCircle
              size={22}
              className="text-muted-foreground hover:text-foreground transition-colors"
            />
          </button>
          <button
            type="button"
            className="relative"
            onClick={() => setShowNotifications(true)}
            data-ocid="app.notifications.button"
          >
            <Bell
              size={22}
              className="text-muted-foreground hover:text-foreground transition-colors"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* BFF mode banner */}
      {mode === "bff" && (
        <div
          className="mx-4 mt-3 rounded-2xl px-4 py-2 text-center text-sm font-semibold"
          style={{
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.2))",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "#F59E0B",
          }}
        >
          🤝 BFF Mode — Finding your campus besties!
        </div>
      )}

      {/* AI Matches banner */}
      {!user?.isPro && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setUpgradeReason("Unlock AI Matches");
            setShowUpgradeModal(true);
          }}
          className="mx-4 mt-3 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-left"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
          data-ocid="swipe.secondary_button"
        >
          <Sparkles size={16} className="text-purple-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-purple-300">AI Matches 🤖</p>
            <p className="text-[10px] text-white/40 truncate">
              See your top 5 AI-curated matches — unlock with Pro
            </p>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: "rgba(124,58,237,0.3)", color: "#c4b5fd" }}
          >
            PRO
          </span>
        </motion.button>
      )}

      {/* Daily Like Counter */}
      {!user?.isPro && (
        <div className="mt-2">
          <DailyLikeCounter
            dailySwipesUsed={dailySwipesUsed}
            swipesLimit={swipesLimit}
            nextSwipeResetIn={nextSwipeResetIn}
            canWatchAd={canWatchAd}
            onWatchAd={() => setShowRewardedAd(true)}
            onUpgrade={() => {
              setUpgradeReason("Get Unlimited Likes");
              setShowUpgradeModal(true);
            }}
          />
        </div>
      )}

      {/* Swipe deck area */}
      <div className="flex-1 relative px-4 pt-2 pb-2 min-h-0">
        <div className="relative w-full h-full">
          <AnimatePresence>
            {visibleProfiles
              .slice()
              .reverse()
              .map((profile, revIdx) => {
                const idx = visibleProfiles.length - 1 - revIdx;
                const isTop = idx === 0;
                const isExit = exitCard?.id === profile.id;
                return (
                  <motion.div
                    key={profile.id}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      scale: 1 - idx * 0.04,
                      y: idx * 12,
                      zIndex: visibleProfiles.length - idx,
                    }}
                    animate={
                      isExit
                        ? { x: exitX, y: exitY, rotate: exitRotate, opacity: 0 }
                        : {}
                    }
                    transition={{ duration: 0.35 }}
                    data-ocid={`swipe.item.${idx + 1}`}
                  >
                    <SwipeCard
                      profile={profile}
                      onSwipe={handleSwipe}
                      isTop={isTop}
                      onView={() => setViewingProfile(profile)}
                      superLikeStamp={superLikeStampId === profile.id}
                    />
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {/* Empty state */}
          {visibleProfiles.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center px-6"
              data-ocid="swipe.empty_state"
            >
              {/* Animated heart */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  duration: 1.8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="text-7xl mb-5"
              >
                💗
              </motion.div>
              <h3 className="font-display text-2xl font-black text-white mb-2">
                You've seen everyone nearby! 💫
              </h3>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">
                New profiles are added daily. Come back soon or adjust your
                filters.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                  data-ocid="swipe.secondary_button"
                >
                  🎛 Adjust Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUpgradeReason("Go Pro for More Profiles");
                    setShowUpgradeModal(true);
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  }}
                  data-ocid="swipe.primary_button"
                >
                  ✨ Go Pro for More
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Action buttons row */}
      <div className="px-4 pb-2 flex-shrink-0">
        {!user?.isPro && (
          <div className="flex items-center justify-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => setShowRewardedAd(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #F97316)",
              }}
              data-ocid="swipe.secondary_button"
            >
              <Play size={10} fill="white" /> +5 Free Likes via Ads
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-5">
          {/* Pass */}
          <button
            type="button"
            onClick={() => handleSwipe("left")}
            className="w-14 h-14 rounded-full glass-card flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
            data-ocid="swipe.secondary_button"
          >
            <X size={26} className="text-red-400" />
          </button>

          {/* Super Like */}
          <div className="relative flex flex-col items-center">
            <button
              type="button"
              onClick={handleSuperLikeClick}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
              data-ocid="swipe.toggle"
            >
              <Star
                size={20}
                className="text-blue-400"
                fill={superLikesLeft > 0 ? "#60a5fa" : "none"}
              />
            </button>
            {/* Badge */}
            <span
              className="text-[10px] font-bold mt-0.5"
              style={{
                color: superLikesLeft > 0 ? "#60a5fa" : "rgba(255,255,255,0.3)",
              }}
            >
              ⭐ {superLikesLeft} left
            </span>
            {/* Tooltip */}
            <AnimatePresence>
              {showSuperTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold text-white pointer-events-none z-20"
                  style={{
                    background: "linear-gradient(135deg, #1e1033, #2a1245)",
                    border: "1px solid rgba(124,58,237,0.4)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  }}
                  data-ocid="swipe.tooltip"
                >
                  Get more with Pro ✨
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Like */}
          <button
            type="button"
            onClick={() => handleSwipe("right")}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
            }}
            data-ocid="swipe.primary_button"
          >
            <Heart size={26} className="text-white" fill="white" />
          </button>
        </div>
      </div>

      <BottomNav />
      <UpgradeModal />
      <MatchModal />
      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onReward={handleReward}
        rewardType={rewardType}
        adsExhausted={!canWatchAd}
        onUpgrade={() => {
          setShowRewardedAd(false);
          setUpgradeReason("Get Unlimited Likes");
          setShowUpgradeModal(true);
        }}
      />

      <AnimatePresence>
        {viewingProfile && (
          <ProfileViewer
            profile={viewingProfile}
            isOpen={!!viewingProfile}
            onClose={() => setViewingProfile(null)}
            onSwipe={() => setViewingProfile(null)}
            isMatched={false}
          />
        )}
      </AnimatePresence>

      <NotificationTray
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          markAllRead();
          setShowNotifications(false);
        }}
      />

      {/* Filters modal */}
      <AnimatePresence>
        {showFilters && <FiltersModal onClose={() => setShowFilters(false)} />}
      </AnimatePresence>

      {/* Onboarding tutorial */}
      {showTutorial && (
        <OnboardingTutorial onDone={() => setShowTutorial(false)} />
      )}
    </div>
  );
}
