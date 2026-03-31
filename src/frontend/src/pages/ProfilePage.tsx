import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Heart,
  MapPin,
  MessageCircle,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ImgWithFallback } from "../components/ImgWithFallback";
import { useApp } from "../context/AppContext";
import { PROFILES } from "../data/mockData";

export function ProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/profile/$id" });
  const {
    matches,
    consumeLike,
    consumeSuperLike,
    addMatch,
    setMatchModal,
    superLikesLeft,
    canWatchAd,
    avatarString,
    planType,
    setShowUpgradeModal,
    setUpgradeReason,
  } = useApp();

  const profile = PROFILES.find((p) => p.id === id);
  const isAlreadyMatched = matches.some((m) => m.profileId === id);
  const [promptLikes, setPromptLikes] = useState<Record<number, boolean>>({});

  if (!profile) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[100dvh] gap-4"
        style={{ background: "#0f0d18", color: "#fff" }}
      >
        <p className="text-lg text-muted-foreground">Profile not found</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/app" })}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
          data-ocid="profile.back_button"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    );
  }

  const coverIdx = profile.coverPhotoIndex ?? 0;
  const allPhotos = profile.photos ?? [
    { url: profile.photoUrl ?? profile.photo, caption: profile.bio ?? "" },
  ];
  const coverPhoto = allPhotos[coverIdx] ?? allPhotos[0];
  const otherPhotos = allPhotos.filter((_, i) => i !== coverIdx);
  const prompts = profile.promptCards ?? [];

  const handlePass = () => {
    navigate({ to: "/app" });
  };

  const handleSuperLike = () => {
    const ok = consumeSuperLike();
    if (!ok) {
      setUpgradeReason("Get more Super Likes");
      setShowUpgradeModal(true);
      return;
    }
    navigate({ to: "/app" });
  };

  const handleLike = () => {
    const ok = consumeLike();
    if (!ok) {
      if (canWatchAd) return; // handled elsewhere
      setUpgradeReason("Get Unlimited Likes");
      setShowUpgradeModal(true);
      return;
    }
    // ~30% match chance for demo
    if (Math.random() > 0.7) {
      addMatch(profile.id);
      setMatchModal(profile);
    }
    navigate({ to: "/app" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="flex flex-col h-[100dvh] relative"
      style={{ background: "#0f0d18" }}
    >
      {/* ── Fixed Header ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 pt-safe pb-3 pt-4 z-30 relative"
        style={{
          background: "rgba(15,13,24,0.97)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/app" })}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-white/10 active:scale-95"
          style={{ color: "#a78bfa" }}
          data-ocid="profile.back_button"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span
              className="font-bold text-lg"
              style={{
                color: "#fff",
                fontFamily: "'Playfair Display', serif",
                textShadow: "0 2px 6px rgba(0,0,0,0.6)",
              }}
            >
              {profile.name}, {profile.age}
            </span>
            {profile.isVerified && (
              <BadgeCheck
                size={17}
                className="text-blue-400"
                fill="#60a5fa"
                color="white"
              />
            )}
          </div>
          {profile.major && (
            <span
              className="text-xs"
              style={{ color: "rgba(167,139,250,0.7)" }}
            >
              {profile.major} · {profile.year}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {profile.onlineStatus === "online" && (
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "#4ade80" }}
              />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ background: "#22c55e" }}
              />
            </span>
          )}
          {profile.onlineStatus === "away" && (
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ background: "#f59e0b" }}
            />
          )}
          {profile.onlineStatus === "offline" && (
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ background: "#6b7280" }}
            />
          )}
          <span
            className="text-xs font-medium"
            style={{
              color:
                profile.onlineStatus === "online"
                  ? "#4ade80"
                  : profile.onlineStatus === "away"
                    ? "#f59e0b"
                    : "#6b7280",
            }}
          >
            {profile.onlineStatus === "online"
              ? "Online"
              : profile.onlineStatus === "away"
                ? "Away"
                : "Offline"}
          </span>
        </div>
      </header>

      {/* ── Scrollable Content ── */}
      <div
        className="flex-1 overflow-y-auto pb-28"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="px-4 py-5 flex flex-col gap-5">
          {/* Cover Photo */}
          <PhotoBlock
            url={coverPhoto.url}
            caption={coverPhoto.caption}
            alt={`${profile.name} cover`}
            avatarString={avatarString}
          />

          {/* Bio Card */}
          {profile.bio && (
            <div
              className="rounded-2xl px-5 py-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(167,139,250,0.55)" }}
              >
                About
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {profile.bio}
              </p>
            </div>
          )}

          {/* Remaining photos + prompt cards interspersed */}
          {otherPhotos.map((photo, i) => (
            <AnimatePresence key={photo.url}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col gap-5"
              >
                <PhotoBlock
                  url={photo.url}
                  caption={photo.caption}
                  alt={`${profile.name} photo ${i + 2}`}
                  avatarString={avatarString}
                />
                {/* Insert a prompt card after every 2nd photo */}
                {(i + 1) % 2 === 0 && prompts[Math.floor((i + 1) / 2) - 1] && (
                  <PromptCardBlock
                    prompt={prompts[Math.floor((i + 1) / 2) - 1]}
                    liked={!!promptLikes[Math.floor((i + 1) / 2) - 1]}
                    onLike={() =>
                      setPromptLikes((prev) => ({
                        ...prev,
                        [Math.floor((i + 1) / 2) - 1]:
                          !prev[Math.floor((i + 1) / 2) - 1],
                      }))
                    }
                  />
                )}
              </motion.div>
            </AnimatePresence>
          ))}

          {/* Any remaining prompts */}
          {prompts
            .slice(Math.floor(otherPhotos.length / 2))
            .map((prompt, i) => (
              <PromptCardBlock
                key={prompt.prompt}
                prompt={prompt}
                liked={!!promptLikes[Math.floor(otherPhotos.length / 2) + i]}
                onLike={() =>
                  setPromptLikes((prev) => ({
                    ...prev,
                    [Math.floor(otherPhotos.length / 2) + i]:
                      !prev[Math.floor(otherPhotos.length / 2) + i],
                  }))
                }
              />
            ))}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div
              className="rounded-2xl px-5 py-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "rgba(167,139,250,0.55)" }}
              >
                Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(124,58,237,0.12)",
                      border: "1px solid rgba(124,58,237,0.25)",
                      color: "#c4b5fd",
                    }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Distance + Major info row */}
          <div
            className="flex items-center gap-4 px-2"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {profile.distance && (
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin size={13} style={{ color: "#a78bfa" }} />
                <span>{profile.distance} away</span>
              </div>
            )}
            {profile.year && (
              <div className="flex items-center gap-1 text-xs">
                <span>{profile.year}</span>
              </div>
            )}
          </div>

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </div>

      {/* ── Fixed Bottom Action Bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-6 py-4 pb-safe"
        style={{
          background: "rgba(15,13,24,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        {isAlreadyMatched ? (
          /* Matched → Send Message */
          <button
            type="button"
            onClick={() => navigate({ to: "/chat/$id", params: { id } })}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-base transition-all active:scale-95 hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              color: "white",
              boxShadow: "0 4px 20px rgba(124,58,237,0.45)",
            }}
            data-ocid="profile.send_message_button"
          >
            <MessageCircle size={22} />
            Send Message 💬
          </button>
        ) : (
          <>
            {/* Pass */}
            <button
              type="button"
              onClick={handlePass}
              className="flex flex-col items-center gap-1 group"
              data-ocid="profile.pass_button"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                }}
              >
                <X size={24} style={{ color: "#f87171" }} />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Pass
              </span>
            </button>

            {/* Super Like */}
            <button
              type="button"
              onClick={handleSuperLike}
              className="flex flex-col items-center gap-1 group"
              data-ocid="profile.super_like_button"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                }}
              >
                <Star size={26} fill="white" style={{ color: "white" }} />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {planType === "yearly" ? "∞" : superLikesLeft} left
              </span>
            </button>

            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              className="flex flex-col items-center gap-1 group"
              data-ocid="profile.like_button"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  boxShadow: "0 4px 20px rgba(236,72,153,0.35)",
                }}
              >
                <Heart size={24} fill="white" style={{ color: "white" }} />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Like
              </span>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PhotoBlock({
  url,
  caption,
  alt,
  avatarString,
}: {
  url: string;
  caption: string;
  alt: string;
  avatarString: string;
}) {
  return (
    <div className="flex flex-col gap-2 mx-4">
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: "3/4", boxShadow: "0 8px 32px rgba(0,0,0,0.45)" }}
      >
        <ImgWithFallback
          src={url}
          alt={alt}
          className="w-full h-full object-cover"
          fallbackAvatar={avatarString}
        />
        {/* Soft bottom gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none rounded-b-2xl"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.1), transparent)",
          }}
        />
      </div>
      {caption && (
        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.18)",
          }}
        >
          <p
            className="text-sm italic leading-relaxed"
            style={{
              color: "#c4b5fd",
              textShadow: "0 1px 3px rgba(0,0,0,0.4)",
            }}
          >
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}

function PromptCardBlock({
  prompt,
  liked,
  onLike,
}: {
  prompt: { prompt: string; answer: string; likes: number };
  liked: boolean;
  onLike: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-2xl px-5 py-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))",
        border: "1px solid rgba(139,92,246,0.2)",
      }}
    >
      {/* Decorative background glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
        style={{
          background: "rgba(124,58,237,0.12)",
          filter: "blur(20px)",
        }}
      />
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: "rgba(167,139,250,0.55)" }}
      >
        {prompt.prompt}
      </p>
      <p
        className="text-base font-bold leading-snug"
        style={{ color: "#f0e6ff", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
      >
        {prompt.answer}
      </p>
      <button
        type="button"
        onClick={onLike}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium transition-all active:scale-95"
        style={{ color: liked ? "#f472b6" : "rgba(255,255,255,0.35)" }}
        data-ocid="profile.prompt_like_button"
      >
        <Heart
          size={14}
          fill={liked ? "#f472b6" : "none"}
          style={{ color: liked ? "#f472b6" : "rgba(255,255,255,0.35)" }}
        />
        {prompt.likes + (liked ? 1 : 0)}
      </button>
    </motion.div>
  );
}
