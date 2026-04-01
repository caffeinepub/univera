import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { StoryItem } from "../context/AppContext";

interface Props {
  stories: StoryItem[];
  startIndex: number;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onMarkViewed?: (id: string) => void;
  onReply?: (storyOwnerId: string, text: string) => void;
  currentUserId?: string;
}

const IMAGE_DURATION = 5000;

export function StoryViewer({
  stories,
  startIndex,
  onClose,
  onDelete,
  onMarkViewed,
  onReply,
  currentUserId,
}: Props) {
  const [current, setCurrent] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [replyFocused, setReplyFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startXRef = useRef<number>(0);
  const progressRef = useRef(0);

  const story = stories[current];

  const goNext = useCallback(() => {
    if (current < stories.length - 1) {
      setCurrent((c) => c + 1);
      setProgress(0);
      progressRef.current = 0;
    } else {
      onClose();
    }
  }, [current, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setProgress(0);
      progressRef.current = 0;
    }
  }, [current]);

  // Mark viewed when story changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on story id change
  useEffect(() => {
    if (story) {
      onMarkViewed?.(story.id);
    }
  }, [story?.id]);

  // Progress timer
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional deps
  useEffect(() => {
    if (!story || paused || replyFocused) return;
    const isVideo = story.storyType === "video";
    if (isVideo) return; // Videos advance on ended event

    const tick = 50; // ms per tick
    const total = IMAGE_DURATION;
    progressRef.current = 0;

    timerRef.current = setInterval(() => {
      progressRef.current += (tick / total) * 100;
      setProgress(Math.min(progressRef.current, 100));
      if (progressRef.current >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        goNext();
      }
    }, tick);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [current, paused, replyFocused, goNext, story?.storyType]);

  // Handle tap zones
  const handleTap = (e: React.MouseEvent) => {
    if (replyFocused) return;
    const x = e.clientX;
    const w = e.currentTarget.clientWidth;
    if (x < w * 0.35) {
      goPrev();
    } else if (x > w * 0.65) {
      goNext();
    }
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - startXRef.current;
    if (Math.abs(diff) > 60) {
      if (diff < 0) goNext();
      else goPrev();
    }
  };

  const handleReply = () => {
    if (!replyText.trim() || !story) return;
    onReply?.(story.userId, replyText);
    toast.success("Reply sent! 💬");
    setReplyText("");
    setReplyFocused(false);
  };

  const handleDelete = () => {
    if (!story) return;
    onDelete?.(story.id);
    toast.success("Story deleted");
    if (current < stories.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      onClose();
    }
    setShowMenu(false);
  };

  const isOwnStory = story?.userId === currentUserId || story?.isOwnStory;

  if (!story) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-3 pt-3">
        {stories.map((s, i) => (
          <div
            key={s.id}
            className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden"
          >
            <motion.div
              className="h-full bg-white rounded-full"
              style={{
                width:
                  i < current ? "100%" : i === current ? `${progress}%` : "0%",
              }}
              transition={{ duration: 0.05 }}
            />
          </div>
        ))}
      </div>

      {/* Story header */}
      <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <img
            src={story.userPhoto}
            alt={story.userName}
            className="w-9 h-9 rounded-full object-cover border-2 border-white/60"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://picsum.photos/seed/story/100/100";
            }}
          />
          <div>
            <p className="text-white font-semibold text-sm">{story.userName}</p>
            <p className="text-white/50 text-xs">
              {story.location
                ? `📍 ${story.location}`
                : new Date(story.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOwnStory && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-white/70 hover:text-white"
              data-ocid="story.open_modal_button"
            >
              ⋯
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white/70 hover:text-white"
            data-ocid="story.close_button"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Story menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-20 right-4 z-20 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(20,10,40,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-5 py-3 text-red-400 text-sm font-semibold hover:bg-red-400/10 transition-colors w-full"
              data-ocid="story.delete_button"
            >
              🗑 Delete Story
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {story.storyType === "video" ? (
          <video
            ref={videoRef}
            src={story.mediaUrl}
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted={muted}
            playsInline
            onEnded={goNext}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) {
                setProgress((v.currentTime / v.duration) * 100);
              }
            }}
          />
        ) : (
          <img
            src={story.mediaUrl}
            alt="Story"
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://picsum.photos/seed/fallback/400/600";
            }}
          />
        )}

        {/* Overlay text */}
        {story.overlayText && (
          <div className="absolute bottom-20 left-4 right-4 text-center">
            <span className="bg-black/50 text-white font-bold px-4 py-2 rounded-xl text-base">
              {story.overlayText}
            </span>
          </div>
        )}

        {/* Video mute toggle */}
        {story.storyType === "video" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMuted((m) => !m);
            }}
            className="absolute bottom-24 right-4 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white text-sm"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        )}

        {/* YouTube music player (hidden) */}
        {story.youtubeVidId && (
          <div className="absolute bottom-20 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
            <span className="text-white text-xs">🎵</span>
            <span className="text-white/80 text-xs max-w-[150px] truncate">
              {story.youtubeTtitle ?? "Playing music"}
            </span>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${story.youtubeVidId}?autoplay=1&mute=0&controls=0&playsinline=1`}
              className="absolute -z-10 w-0 h-0 opacity-0"
              allow="autoplay"
              title="story-music"
            />
          </div>
        )}
      </div>

      {/* Bottom: viewers + reply */}
      <div
        className="px-4 pb-6 pt-2 flex-shrink-0"
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {isOwnStory && (
          <p className="text-white/50 text-xs text-center mb-2">
            👁 Seen by {story.viewerCount}{" "}
            {story.viewerCount === 1 ? "person" : "people"}
          </p>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Reply to story..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onFocus={() => setReplyFocused(true)}
            onBlur={() => setTimeout(() => setReplyFocused(false), 200)}
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm placeholder:text-white/40 outline-none focus:border-white/40"
            data-ocid="story.input"
          />
          {replyText.trim() && (
            <button
              type="button"
              onClick={handleReply}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              }}
              data-ocid="story.submit_button"
            >
              ➤
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
