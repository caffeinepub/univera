import {
  CheckCircle,
  ChevronDown,
  Heart,
  MessageCircle,
  MessageSquare,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
} from "motion/react";
import { useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import type { Profile } from "../data/mockData";
import { ImgWithFallback } from "./ImgWithFallback";

interface ProfileViewerProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onSwipe: (dir: "left" | "right") => void;
  isMatched?: boolean;
  onMessage?: () => void;
}

interface LikeCommentModalProps {
  cardLabel: string;
  onConfirm: (comment: string) => void;
  onCancel: () => void;
}

function LikeCommentModal({
  cardLabel,
  onConfirm,
  onCancel,
}: LikeCommentModalProps) {
  const [comment, setComment] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] rounded-t-3xl p-6"
        style={{
          background: "#faf8ff",
          boxShadow: "0 -8px 32px rgba(109,40,217,0.15)",
        }}
      >
        <p className="text-xs text-purple-400 font-semibold mb-1 uppercase tracking-wider">
          Liking
        </p>
        <p className="font-bold text-gray-800 mb-4 text-sm">{cardLabel}</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment... (optional)"
          maxLength={120}
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm border resize-none focus:outline-none focus:ring-2"
          style={{
            background: "#f3f0ff",
            border: "1px solid rgba(139,92,246,0.25)",
            color: "#1a1a2e",
          }}
          // biome-ignore lint/a11y/noAutofocus: intentional UX focus
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: "rgba(0,0,0,0.06)", color: "#666" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(comment)}
            className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
          >
            Send Like ❤️
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProfileViewer({
  profile,
  isOpen,
  onClose,
  onSwipe,
  isMatched = false,
  onMessage,
}: ProfileViewerProps) {
  const [likedCards, setLikedCards] = useState<Record<string, boolean>>({});
  const [pendingLike, setPendingLike] = useState<{
    key: string;
    label: string;
  } | null>(null);

  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const { avatarString } = useApp();

  if (!profile) return null;

  const coverIdx = Number((profile as any).coverPhotoIndex ?? 0);
  const mainPhoto =
    profile.photos?.[coverIdx]?.url ??
    profile.photos?.[0]?.url ??
    profile.photo;
  const avatarOrDefault = avatarString || "🧑";

  const photos = profile.photos?.length
    ? profile.photos
    : [{ url: profile.photo, caption: profile.bio }];

  type FeedItem =
    | { type: "photo"; url: string; caption: string; idx: number }
    | {
        type: "prompt";
        prompt: string;
        answer: string;
        likes: number;
        promptIdx: number;
      };

  const feed: FeedItem[] = [];
  const prompts = profile.promptCards ?? [];
  let promptPointer = 0;
  photos.forEach((photo, i) => {
    feed.push({
      type: "photo",
      url: photo.url,
      caption: photo.caption,
      idx: i,
    });
    if ((i + 1) % 2 === 0 && promptPointer < prompts.length) {
      const p = prompts[promptPointer];
      feed.push({
        type: "prompt",
        prompt: p.prompt,
        answer: p.answer,
        likes: p.likes,
        promptIdx: promptPointer,
      });
      promptPointer++;
    }
  });
  while (promptPointer < prompts.length) {
    const p = prompts[promptPointer];
    feed.push({
      type: "prompt",
      prompt: p.prompt,
      answer: p.answer,
      likes: p.likes,
      promptIdx: promptPointer,
    });
    promptPointer++;
  }

  const handleLike = (key: string, label: string) => {
    setPendingLike({ key, label });
  };

  const confirmLike = (_comment: string) => {
    if (pendingLike) {
      setLikedCards((prev) => ({ ...prev, [pendingLike.key]: true }));
    }
    setPendingLike(null);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 80) {
      onSwipe("right");
    } else if (info.offset.x < -80) {
      onSwipe("left");
    }
    x.set(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{
            background: "rgba(91,33,182,0.35)",
            backdropFilter: "blur(6px)",
          }}
          onClick={onClose}
          data-ocid="profile.modal"
        >
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="x"
            dragControls={dragControls}
            dragConstraints={{ left: -120, right: 120 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] rounded-t-3xl overflow-y-auto cursor-grab active:cursor-grabbing select-none"
            style={{
              maxHeight: "90dvh",
              background: "#faf8ff",
              boxShadow: "0 -8px 40px rgba(109,40,217,0.15)",
              x,
            }}
          >
            {/* Swipe hint bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-purple-200" />
            </div>

            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
              style={{
                background: "rgba(250,248,255,0.95)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(139,92,246,0.12)",
              }}
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-display text-xl font-black text-gray-900">
                      {profile.name}, {profile.age}
                    </h2>
                    {profile.isVerified && (
                      <CheckCircle
                        size={18}
                        className="text-blue-500 flex-shrink-0"
                        fill="#3b82f6"
                        color="white"
                      />
                    )}
                  </div>
                  <p className="text-purple-500 text-xs font-medium">
                    {isMatched
                      ? `${profile.major} · ${profile.year}`
                      : profile.major}
                  </p>
                </div>
                {profile.online && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-500 text-xs">Online</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  }}
                >
                  ✨ {profile.compatibility}% Match
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.1)" }}
                  data-ocid="profile.close_button"
                >
                  <X size={16} className="text-purple-600" />
                </button>
              </div>
            </div>

            {/* Main profile photo — clean card style */}
            <div className="px-4 pt-4">
              <div
                className="rounded-2xl overflow-hidden relative"
                style={{
                  aspectRatio: "3/4",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                }}
              >
                <ImgWithFallback
                  src={mainPhoto}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  style={{ opacity: 1 }}
                  fallbackAvatar={avatarOrDefault}
                />
                {/* Soft gradient overlay — bottom only, no fog */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 40%, transparent 65%)",
                  }}
                />
                {photos[0]?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-6">
                    <p
                      className="text-white text-sm font-medium leading-snug"
                      style={{ textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}
                    >
                      {photos[0].caption}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Feed (photos 2+ and prompts interspersed) */}
            <div className="px-4 pt-4 pb-4 space-y-4">
              {feed.slice(1).map((item, feedIdx) => {
                if (item.type === "photo") {
                  const key = `photo-${item.idx}`;
                  const isLocked = !isMatched && item.idx > 0;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: feedIdx * 0.06 }}
                      data-ocid={`profile.item.${item.idx + 1}`}
                    >
                      {/* Photo with soft gradient overlay + caption */}
                      <div
                        className="rounded-2xl overflow-hidden relative"
                        style={{
                          aspectRatio: "3/4",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                      >
                        <ImgWithFallback
                          src={item.url}
                          alt={`${profile.name} ${item.idx + 1}`}
                          className="w-full h-full object-cover"
                          style={{
                            opacity: 1,
                            ...(isLocked
                              ? {
                                  filter: "blur(18px)",
                                  transform: "scale(1.05)",
                                }
                              : {}),
                          }}
                          fallbackAvatar={avatarOrDefault}
                        />
                        {!isLocked && (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 40%, transparent 65%)",
                            }}
                          />
                        )}
                        {isLocked ? (
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                            style={{ background: "rgba(91,33,182,0.45)" }}
                          >
                            <span className="text-3xl">🔒</span>
                            <p className="text-white font-bold text-sm">
                              Match to unlock
                            </p>
                          </div>
                        ) : (
                          item.caption && (
                            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-6 flex items-end justify-between gap-3">
                              <p
                                className="text-white text-sm font-medium leading-snug flex-1"
                                style={{
                                  textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                                }}
                              >
                                {item.caption}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  handleLike(key, `"${item.caption}"`)
                                }
                                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                                style={{
                                  background: likedCards[key]
                                    ? "rgba(236,72,153,0.35)"
                                    : "rgba(255,255,255,0.2)",
                                  border: likedCards[key]
                                    ? "1px solid rgba(236,72,153,0.6)"
                                    : "1px solid rgba(255,255,255,0.4)",
                                  backdropFilter: "blur(4px)",
                                }}
                              >
                                <Heart
                                  size={16}
                                  style={{
                                    color: likedCards[key]
                                      ? "#EC4899"
                                      : "white",
                                  }}
                                  fill={likedCards[key] ? "#EC4899" : "none"}
                                />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </motion.div>
                  );
                }

                const key = `prompt-${item.promptIdx}`;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: feedIdx * 0.06 }}
                    className="rounded-2xl p-5"
                    style={{
                      background:
                        "linear-gradient(135deg, #f3f0ff 0%, #fce7f3 100%)",
                      border: "1.5px solid rgba(139,92,246,0.2)",
                    }}
                    data-ocid={`profile.item.${feedIdx + 1}`}
                  >
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-2"
                      style={{ color: "#7C3AED" }}
                    >
                      {item.prompt}
                    </p>
                    <p className="text-gray-800 text-lg font-semibold leading-snug mb-4">
                      {item.answer}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400">
                        ❤️ {item.likes + (likedCards[key] ? 1 : 0)} likes
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleLike(key, item.prompt)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: likedCards[key]
                              ? "rgba(236,72,153,0.15)"
                              : "rgba(139,92,246,0.1)",
                            border: likedCards[key]
                              ? "1px solid rgba(236,72,153,0.35)"
                              : "1px solid rgba(139,92,246,0.2)",
                            color: likedCards[key] ? "#EC4899" : "#7C3AED",
                          }}
                        >
                          <Heart
                            size={12}
                            fill={likedCards[key] ? "#EC4899" : "none"}
                          />
                          {likedCards[key] ? "Liked" : "Like"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLike(key, item.prompt)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                          style={{
                            background: "rgba(139,92,246,0.08)",
                            border: "1px solid rgba(139,92,246,0.15)",
                            color: "#7C3AED",
                          }}
                        >
                          <MessageCircle size={12} />
                          Comment
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* About */}
              <div
                className="rounded-2xl px-4 py-4"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(139,92,246,0.15)",
                }}
              >
                <h3 className="font-display font-bold text-purple-800 mb-2 text-sm uppercase tracking-wider">
                  About
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {isMatched
                    ? profile.bio
                    : profile.bio.slice(0, 100) +
                      (profile.bio.length > 100 ? "…" : "")}
                </p>
              </div>

              {/* Photos Gallery — clean card style with gradient overlay */}
              {profile.photos && profile.photos.length > 1 && (
                <div className="pb-2">
                  <h3 className="text-sm font-semibold mb-3 text-purple-500 uppercase tracking-wider px-1">
                    Photos
                  </h3>
                  <div className="space-y-3">
                    {profile.photos.slice(1).map((photo, index) => (
                      <div
                        key={photo.url || String(index)}
                        className="rounded-2xl overflow-hidden relative"
                        style={{
                          aspectRatio: "3/4",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                        data-ocid={`profile.item.${index + 2}`}
                      >
                        <ImgWithFallback
                          src={photo.url}
                          alt={`Photo ${index + 2}`}
                          className="w-full h-full object-cover"
                          style={{ opacity: 1 }}
                          fallbackAvatar={avatarOrDefault}
                        />
                        {/* Soft gradient overlay */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 40%, transparent 65%)",
                          }}
                        />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-6">
                            <p
                              className="text-white text-sm font-medium leading-snug"
                              style={{
                                textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                              }}
                            >
                              {photo.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests — only shown when matched */}
              {isMatched && (
                <div
                  className="rounded-2xl px-4 py-4"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(139,92,246,0.15)",
                  }}
                >
                  <h3 className="font-display font-bold text-purple-800 mb-3 text-sm uppercase tracking-wider">
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{
                          background: "rgba(139,92,246,0.1)",
                          border: "1px solid rgba(139,92,246,0.25)",
                          color: "#6d28d9",
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked hint for unmatched */}
              {!isMatched && (
                <div
                  className="rounded-2xl px-4 py-4 text-center"
                  style={{
                    background: "rgba(139,92,246,0.06)",
                    border: "1px dashed rgba(139,92,246,0.25)",
                  }}
                >
                  <p className="text-sm text-purple-400 font-medium">
                    🔒 Match to unlock interests & more
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center text-purple-300 gap-1 text-xs">
                <ChevronDown size={14} />
                <span>End of profile</span>
              </div>
            </div>

            {/* Action buttons */}
            <div
              className="sticky bottom-0 w-full px-6 py-4 flex gap-3"
              style={{
                background: "rgba(250,248,255,0.97)",
                backdropFilter: "blur(16px)",
                borderTop: "1px solid rgba(139,92,246,0.12)",
              }}
            >
              <button
                type="button"
                onClick={() => onSwipe("left")}
                className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 text-base transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
                data-ocid="profile.cancel_button"
              >
                Pass
              </button>
              {onMessage && (
                <button
                  type="button"
                  onClick={onMessage}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-purple-700 text-base flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(139,92,246,0.12)",
                    border: "1px solid rgba(139,92,246,0.3)",
                  }}
                  data-ocid="profile.secondary_button"
                >
                  <MessageSquare size={18} /> Message
                </button>
              )}
              <button
                type="button"
                onClick={() => onSwipe("right")}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                }}
                data-ocid="profile.confirm_button"
              >
                <Heart size={18} fill="white" /> Like
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Like + Comment modal */}
      {pendingLike && (
        <LikeCommentModal
          key={pendingLike.key}
          cardLabel={pendingLike.label}
          onConfirm={confirmLike}
          onCancel={() => setPendingLike(null)}
        />
      )}
    </AnimatePresence>
  );
}
