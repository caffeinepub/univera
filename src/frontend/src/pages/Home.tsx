import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle,
  Heart,
  Lock,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { MatchModal } from "../components/MatchModal";
import { NotificationTray } from "../components/NotificationTray";
import { ProfileViewer } from "../components/ProfileViewer";
import { UpgradeModal } from "../components/UpgradeModal";
import { useApp } from "../context/AppContext";
import { PROFILES, type Profile } from "../data/mockData";

const HERO_PROFILES = PROFILES.slice(0, 4);

function ProfileCard({
  profile,
  onView,
  showProLock = false,
  badge,
}: {
  profile: Profile;
  onView: () => void;
  showProLock?: boolean;
  badge?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={showProLock ? undefined : onView}
      className="relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer"
      style={{ width: 140, height: 190 }}
      data-ocid="home.item.1"
    >
      <img
        src={profile.photo}
        alt={profile.name}
        className="w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)",
        }}
      />

      {showProLock && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <Lock size={20} className="text-yellow-400 mb-1" />
          <span className="text-yellow-400 text-[10px] font-bold">
            Pro Only
          </span>
        </div>
      )}

      {profile.isVerified && !showProLock && (
        <div className="absolute top-2 right-2">
          <CheckCircle size={16} fill="#3b82f6" color="white" />
        </div>
      )}

      {badge && !showProLock && (
        <div
          className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
          style={{ background: "rgba(124,58,237,0.85)" }}
        >
          {badge}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-white text-xs font-bold leading-tight">
          {profile.name}, {profile.age}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
          >
            ✨ {profile.compatibility}%
          </span>
        </div>
        <div className="flex gap-1 mt-1 flex-wrap">
          {profile.interests.slice(0, 2).map((interest) => (
            <span
              key={interest}
              className="text-[8px] px-1.5 py-0.5 rounded-full text-white/80"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function HorizontalRow({
  title,
  profiles,
  onView,
  isProLocked = false,
  currentUserIsPro = false,
  badgeMap,
}: {
  title: string;
  profiles: Profile[];
  onView: (p: Profile) => void;
  isProLocked?: boolean;
  currentUserIsPro?: boolean;
  badgeMap?: Record<string, string>;
}) {
  if (profiles.length === 0) return null;
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2
          className="text-[15px] font-bold text-foreground"
          data-ocid="home.section.panel"
        >
          {title}
        </h2>
        <button
          type="button"
          className="text-xs text-purple-400 hover:text-purple-300 font-medium"
          data-ocid="home.section.link"
        >
          See All
        </button>
      </div>
      <div
        className="flex gap-3 px-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {profiles.map((p) => (
          <ProfileCard
            key={p.id}
            profile={p}
            onView={() => onView(p)}
            showProLock={isProLocked && !currentUserIsPro}
            badge={badgeMap?.[p.id]}
          />
        ))}
      </div>
    </section>
  );
}

function HeroCard({
  profile,
  onLike,
  onSwipeComplete,
}: {
  profile: Profile;
  onLike: (p: Profile) => void;
  onSwipeComplete: (direction: "right" | "left") => void;
}) {
  const x = useMotionValue(0);
  const isDragging = useRef(false);

  // Overlays: opacity based on drag position
  const likeOpacity = useTransform(x, [0, 60, 120], [0, 0.7, 1]);
  const passOpacity = useTransform(x, [-120, -60, 0], [1, 0.7, 0]);
  const rotate = useTransform(x, [-150, 0, 150], [-8, 0, 8]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      isDragging.current = false;
      if (info.offset.x > 80) {
        onLike(profile);
        onSwipeComplete("right");
      } else if (info.offset.x < -80) {
        onSwipeComplete("left");
      } else {
        // snap back
        x.set(0);
      }
    },
    [profile, onLike, onSwipeComplete, x],
  );

  return (
    <motion.div
      key={profile.id}
      drag="x"
      dragConstraints={{ left: -150, right: 150 }}
      dragElastic={0.2}
      style={{ x, rotate, position: "absolute", inset: 0 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45 }}
      className="cursor-grab active:cursor-grabbing"
    >
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
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
        }}
      />

      {/* Like overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <div
          className="rounded-2xl px-6 py-3 border-4 border-green-400 rotate-[-15deg]"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <span className="text-green-400 text-3xl font-black tracking-widest">
            LIKE ❤️
          </span>
        </div>
      </motion.div>

      {/* Pass overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: passOpacity }}
      >
        <div
          className="rounded-2xl px-6 py-3 border-4 border-red-400 rotate-[15deg]"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <span className="text-red-400 text-3xl font-black tracking-widest">
            PASS ✕
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const {
    user,
    theme,
    toggleTheme,
    unreadCount,
    notifications,
    markAllRead,
    consumeLike,
    addMatch,
    setMatchModal,
    likePost,
  } = useApp();

  const [heroIndex, setHeroIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setHeroIndex((idx) => (idx + 1) % HERO_PROFILES.length);
    }, 4000);
  }, []);

  useEffect(() => {
    if (!isDragging) {
      startInterval();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isDragging, startInterval]);

  const heroProfile = HERO_PROFILES[heroIndex];

  const handleLike = useCallback(
    (profile: Profile) => {
      const ok = consumeLike();
      if (!ok) return;
      // Wire to backend (fire-and-forget)
      likePost(profile.id);
      const isMatch = Math.random() > 0.4;
      if (isMatch) {
        addMatch(profile.id);
        setMatchModal(profile);
      }
    },
    [consumeLike, likePost, addMatch, setMatchModal],
  );

  const handleSwipeComplete = useCallback((direction: "right" | "left") => {
    setIsDragging(false);
    setHeroIndex((idx) => (idx + 1) % HERO_PROFILES.length);
    if (direction === "right") {
      // like action already called in HeroCard onDragEnd via onLike
    }
  }, []);

  const popularProfiles = [...PROFILES]
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 5);
  const aiMatchProfiles = [...PROFILES]
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 5);
  const sameMajorProfiles = user?.major
    ? PROFILES.filter((p) => p.major.toLowerCase() === user.major.toLowerCase())
    : PROFILES.slice(0, 4);
  const activeProfiles = PROFILES.filter((p) => p.online);
  const bffProfiles = PROFILES.filter((p) => p.mode === "bff");

  const sameMajorBadgeMap: Record<string, string> = {};
  for (const p of sameMajorProfiles) {
    sameMajorBadgeMap[p.id] = "Your Major";
  }

  const searchResults = searchText
    ? PROFILES.filter(
        (p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          p.major.toLowerCase().includes(searchText.toLowerCase()) ||
          p.interests.some((interest) =>
            interest.toLowerCase().includes(searchText.toLowerCase()),
          ),
      )
    : [];

  if (!user?.isVerified) {
    return (
      <div className="app-shell bg-app flex flex-col h-[100dvh]">
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 text-center"
          data-ocid="home.empty_state"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(135deg, #7C3AED22, #EC489922)",
              border: "2px solid rgba(124,58,237,0.3)",
            }}
          >
            <Lock size={32} className="text-purple-400" />
          </div>
          <h2 className="font-display text-2xl font-black text-foreground mb-3">
            Verify to Browse
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-xs">
            Verify your profile to unlock the full UNIVÈRA experience and browse
            campus profiles.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/profile" })}
            className="px-8 py-4 rounded-2xl font-bold text-white text-base"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
            data-ocid="home.primary_button"
          >
            Verify Now ✓
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-shell bg-app flex flex-col h-[100dvh] overflow-hidden">
      {/* Top Bar */}
      <header
        className="flex-shrink-0 px-4 pt-4 pb-3 z-20"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(to bottom, rgba(10,5,30,0.98), rgba(10,5,30,0.85))"
              : "rgba(250,248,255,0.97)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-black text-gradient-violet flex-shrink-0">
            UNIVÈRA
          </span>

          <div
            className="flex-1 flex items-center gap-2 rounded-full px-3 py-2"
            style={{
              background:
                theme === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              border:
                theme === "dark"
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <Search size={14} className="text-muted-foreground flex-shrink-0" />
            <input
              ref={searchRef}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search by name, major..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none min-w-0"
              data-ocid="home.search_input"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => {
                  setSearchText("");
                  setSearchOpen(false);
                }}
              >
                <X size={13} className="text-muted-foreground" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex-shrink-0"
            data-ocid="home.theme.toggle"
          >
            {theme === "dark" ? (
              <Sun
                size={20}
                className="text-muted-foreground hover:text-foreground transition-colors"
              />
            ) : (
              <Moon
                size={20}
                className="text-muted-foreground hover:text-foreground transition-colors"
              />
            )}
          </button>

          <button
            type="button"
            className="relative flex-shrink-0"
            onClick={() => setShowNotifications(true)}
            data-ocid="home.notifications.button"
          >
            <Bell
              size={20}
              className="text-muted-foreground hover:text-foreground transition-colors"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && searchText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-[72px] z-30 px-4 pb-4"
            style={{
              background:
                theme === "dark"
                  ? "rgba(10,5,30,0.98)"
                  : "rgba(250,248,255,0.98)",
              backdropFilter: "blur(16px)",
              borderBottom: "1px solid rgba(139,92,246,0.15)",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
            data-ocid="home.search.panel"
          >
            <div className="flex items-center justify-between py-3">
              <p className="text-xs text-muted-foreground font-medium">
                {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchText("");
                }}
                className="text-xs text-purple-400"
              >
                Close
              </button>
            </div>
            {searchResults.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-6">
                No profiles found for "{searchText}"
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {searchResults.map((p) => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    onView={() => {
                      setViewingProfile(p);
                      setSearchOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto pb-20"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Hero Carousel */}
        <div
          className="relative overflow-hidden"
          style={{ height: 300 }}
          data-ocid="home.card"
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
        >
          <AnimatePresence mode="wait">
            <HeroCard
              key={heroProfile.id}
              profile={heroProfile}
              onLike={handleLike}
              onSwipeComplete={handleSwipeComplete}
            />
          </AnimatePresence>

          {/* Hero content overlay (non-draggable, pointer-events-none on image area) */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pointer-events-none">
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-display text-2xl font-black text-white">
                    {heroProfile.name}, {heroProfile.age}
                  </h1>
                  {heroProfile.isVerified && (
                    <CheckCircle size={18} fill="#3b82f6" color="white" />
                  )}
                </div>
                <p className="text-white/70 text-xs mb-1">
                  {heroProfile.major} · {heroProfile.year}
                </p>
                <p className="text-white/60 text-xs line-clamp-1">
                  {heroProfile.bio}
                </p>
              </div>
              <div
                className="px-2.5 py-1 rounded-full text-xs font-bold text-white flex-shrink-0 ml-3"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                }}
              >
                ✨ {heroProfile.compatibility}%
              </div>
            </div>

            <div className="flex gap-2 pointer-events-auto">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => handleLike(heroProfile)}
                className="flex-1 py-2.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-1.5"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                }}
                data-ocid="home.primary_button"
              >
                <Heart size={15} fill="white" /> Like
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setViewingProfile(heroProfile)}
                className="flex-1 py-2.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                }}
                data-ocid="home.secondary_button"
              >
                👁 View Profile
              </motion.button>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="absolute top-3 right-4 flex gap-1 z-10">
            {HERO_PROFILES.map((heroItem, dotIdx) => (
              <button
                type="button"
                key={heroItem.id}
                onClick={() => setHeroIndex(dotIdx)}
                className="rounded-full transition-all"
                style={{
                  width: dotIdx === heroIndex ? 16 : 6,
                  height: 6,
                  background:
                    dotIdx === heroIndex
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.35)",
                }}
                data-ocid="home.tab"
              />
            ))}
          </div>
        </div>

        {/* Rows */}
        <HorizontalRow
          title="Popular on Campus 🔥"
          profiles={popularProfiles}
          onView={setViewingProfile}
        />

        <HorizontalRow
          title="AI Matches 🤖"
          profiles={aiMatchProfiles}
          onView={setViewingProfile}
          isProLocked={true}
          currentUserIsPro={user?.isPro ?? false}
        />

        <HorizontalRow
          title="Same Major 🎓"
          profiles={
            sameMajorProfiles.length > 0
              ? sameMajorProfiles
              : PROFILES.slice(0, 4)
          }
          onView={setViewingProfile}
          badgeMap={sameMajorBadgeMap}
        />

        <HorizontalRow
          title="Active Now ⚡"
          profiles={activeProfiles}
          onView={setViewingProfile}
        />

        <HorizontalRow
          title="BFF Vibes 🤝"
          profiles={bffProfiles}
          onView={setViewingProfile}
        />

        <p className="text-center text-muted-foreground text-[10px] py-6 px-4">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      <BottomNav />
      <UpgradeModal />
      <MatchModal />

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
