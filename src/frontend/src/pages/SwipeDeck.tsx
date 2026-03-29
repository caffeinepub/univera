import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Eye,
  Heart,
  MessageCircle,
  Moon,
  Play,
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
import { useRef, useState } from "react";
import { AdBanner } from "../components/AdBanner";
import { BottomNav } from "../components/BottomNav";
import { MatchModal } from "../components/MatchModal";
import { ModeToggle } from "../components/ModeToggle";
import { NotificationTray } from "../components/NotificationTray";
import { ProfileViewer } from "../components/ProfileViewer";
import { RewardedAdModal } from "../components/RewardedAdModal";
import { UpgradeModal } from "../components/UpgradeModal";
import { useApp } from "../context/AppContext";
import type { Profile } from "../data/mockData";
import type { PROFILES } from "../data/mockData";

function SwipeCard({
  profile,
  onSwipe,
  isTop,
  onView,
}: {
  profile: (typeof PROFILES)[0];
  onSwipe: (dir: "left" | "right" | "up") => void;
  isTop: boolean;
  onView: () => void;
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
        <img
          src={profile.photo}
          alt={profile.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 45%, transparent 70%)",
          }}
        />

        <div
          className="absolute top-4 right-4 rounded-full px-3 py-1.5 flex items-center gap-1.5"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.85), rgba(236,72,153,0.85))",
            backdropFilter: "blur(8px)",
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
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
              }}
              data-ocid="swipe.secondary_button"
            >
              <Eye size={12} /> View Profile
            </button>
          )}
          <div className="flex items-end justify-between mb-1">
            <h2 className="font-display text-3xl font-black text-white">
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
          <p className="text-white/80 text-sm mb-1">
            {profile.major} · {profile.year}
          </p>
          <p className="text-white/70 text-xs mb-3">{profile.bio}</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm"
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
    likesLeft,
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
  } = useApp();

  const [exitCard, setExitCard] = useState<{
    id: string;
    dir: "left" | "right" | "up";
  } | null>(null);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

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
      const ok = dir === "up" ? consumeSuperLike() : consumeLike();
      if (!ok) return;
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

  const exitX =
    exitCard?.dir === "right" ? 500 : exitCard?.dir === "left" ? -500 : 0;
  const exitY = exitCard?.dir === "up" ? -500 : 0;
  const exitRotate =
    exitCard?.dir === "right" ? 30 : exitCard?.dir === "left" ? -30 : 0;
  const outOfLikes = !user?.isPro && likesLeft === 0;

  return (
    <div className="app-shell bg-app flex flex-col h-[100dvh]">
      <header className="glass-dark px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <span className="font-display text-xl font-black text-gradient-violet">
          UNIVÈRA
        </span>
        <ModeToggle />
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="relative"
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
            className="relative"
            onClick={() => navigate({ to: "/matches" })}
            data-ocid="app.matches.link"
          >
            <MessageCircle
              size={22}
              className="text-muted-foreground hover:text-foreground transition-colors"
            />
          </button>

          {/* Bell with badge */}
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

      {outOfLikes && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center justify-between"
          style={{
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.15))",
            border: "1px solid rgba(245,158,11,0.35)",
          }}
          data-ocid="swipe.empty_state"
        >
          <div>
            <p className="text-xs font-bold" style={{ color: "#F59E0B" }}>
              Out of likes!
            </p>
            <p className="text-xs text-muted-foreground">
              Watch an ad to keep swiping
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowRewardedAd(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold text-white"
            style={{ background: "linear-gradient(135deg, #F59E0B, #F97316)" }}
            data-ocid="swipe.primary_button"
          >
            <Play size={12} fill="white" /> Watch Ad
          </button>
        </motion.div>
      )}

      <div className="flex-1 relative px-4 pt-3 pb-2">
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
                    />
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {visibleProfiles.length === 0 && (
            <div
              className="flex flex-col items-center justify-center h-full text-center"
              data-ocid="swipe.empty_state"
            >
              <div className="text-6xl mb-4">✨</div>
              <h3 className="font-display text-2xl font-black text-gradient-violet mb-2">
                You're all caught up!
              </h3>
              <p className="text-muted-foreground text-sm">
                Check back later for new profiles
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-2 flex-shrink-0">
        {!user?.isPro && (
          <div className="flex items-center justify-center gap-3 mb-2">
            <p className="text-xs text-muted-foreground">
              {likesLeft} likes remaining
            </p>
            <button
              type="button"
              onClick={() => setShowRewardedAd(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #F97316)",
              }}
              data-ocid="swipe.secondary_button"
            >
              <Play size={10} fill="white" /> +5 Likes
            </button>
          </div>
        )}
        <div className="flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => handleSwipe("left")}
            className="w-14 h-14 rounded-full glass-card flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
            data-ocid="swipe.secondary_button"
          >
            <X size={26} className="text-red-400" />
          </button>
          <button
            type="button"
            onClick={() => handleSwipe("up")}
            className="w-12 h-12 rounded-full glass-card flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
            data-ocid="swipe.toggle"
          >
            <Star size={20} className="text-blue-400" />
          </button>
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
    </div>
  );
}
