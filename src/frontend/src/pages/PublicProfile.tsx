import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Heart,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ImgWithFallback } from "../components/ImgWithFallback";
import { Sheet, SheetContent } from "../components/ui/sheet";
import { useApp } from "../context/AppContext";
import { PROFILES } from "../data/mockData";

const HIGHLIGHTS = [
  { emoji: "🌟", label: "Vibes" },
  { emoji: "🏫", label: "Campus" },
  { emoji: "✈️", label: "Travel" },
  { emoji: "🎨", label: "Hobby" },
  { emoji: "🎵", label: "Music" },
];

const STATUS_COLOR: Record<string, string> = {
  online: "#22c55e",
  away: "#f59e0b",
  offline: "#6b7280",
};
const STATUS_LABEL: Record<string, string> = {
  online: "Online",
  away: "Away",
  offline: "Offline",
};

export function PublicProfile() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/user/$id" });
  const {
    matches,
    consumeLike,
    addMatch,
    setMatchModal,
    avatarString,
    setShowUpgradeModal,
    setUpgradeReason,
  } = useApp();

  const profile = PROFILES.find((p) => p.id === id);
  const isMatched = matches.some((m) => m.profileId === id);

  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<string>("");
  const [photoOpen, setPhotoOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    caption: string;
  } | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

  if (!profile) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[100dvh] gap-4"
        style={{ background: "#0a0a0f", color: "#fff" }}
      >
        <p className="text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
          Profile not found
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/app" })}
          className="px-4 py-2 rounded-full text-sm"
          style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const coverPhoto =
    profile.photos?.[0]?.url || profile.photo || profile.photoUrl || "";
  const allPhotos = profile.photos || [];
  const posts = profile.posts || [];
  const selectedPost = posts.find((p) => p.id === selectedPostId);

  const handleLike = () => {
    const ok = consumeLike();
    if (!ok) {
      setUpgradeReason("Get Unlimited Likes");
      setShowUpgradeModal(true);
      return;
    }
    addMatch(profile.id);
    setMatchModal(profile);
    navigate({ to: "/app" });
  };

  const handlePass = () => navigate({ to: "/app" });

  const togglePostLike = (postId: string) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div
      className="relative min-h-[100dvh] overflow-x-hidden pb-28"
      style={{ background: "#0a0a0f", color: "#fff" }}
    >
      {/* ── Cover Photo ── */}
      <div className="relative w-full" style={{ height: 220 }}>
        <ImgWithFallback
          src={coverPhoto}
          alt={profile.name}
          className="w-full h-full object-cover"
          fallbackAvatar={avatarString}
        />
        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.2) 50%, rgba(0,0,0,0.3) 100%)",
          }}
        />
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate({ to: "/app" })}
          className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 rounded-full"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          data-ocid="public_profile.back_button"
        >
          <ArrowLeft size={20} color="#fff" />
        </button>
      </div>

      {/* ── Profile photo + name row ── */}
      <div className="flex items-end gap-4 px-4 -mt-10 relative z-10">
        {/* Circular profile photo with gradient ring */}
        <div
          className="shrink-0 rounded-full p-[3px]"
          style={{
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            width: 84,
            height: 84,
          }}
        >
          <div className="w-full h-full rounded-full overflow-hidden">
            <ImgWithFallback
              src={coverPhoto}
              alt={profile.name}
              className="w-full h-full object-cover"
              fallbackAvatar={avatarString}
            />
          </div>
        </div>
        {/* Name / verified / status */}
        <div className="pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              {profile.name}, {profile.age}
            </span>
            {profile.isVerified && (
              <BadgeCheck size={18} style={{ color: "#3b82f6" }} />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: STATUS_COLOR[profile.onlineStatus] }}
            />
            <span
              className="text-xs"
              style={{ color: STATUS_COLOR[profile.onlineStatus] }}
            >
              {STATUS_LABEL[profile.onlineStatus]}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex mx-4 mt-4 rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {[
          { label: "Matches", value: `${profile.compatibility}` },
          { label: "Likes", value: `${Math.round(profile.compatibility * 3)}` },
          { label: "Views", value: `${Math.round(profile.compatibility * 7)}` },
        ].map((stat, i, arr) => (
          <div
            key={stat.label}
            className="flex-1 flex flex-col items-center py-4"
            style={{
              borderRight:
                i < arr.length - 1
                  ? "1px solid rgba(255,255,255,0.07)"
                  : "none",
            }}
          >
            <span className="text-lg font-bold text-white">{stat.value}</span>
            <span
              className="text-[11px] mt-0.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* ── Bio ── */}
      {profile.bio && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-4 mt-4 px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            {profile.bio}
          </p>
        </motion.div>
      )}

      {/* ── Highlights ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-5 px-4"
      >
        <div
          className="flex gap-4 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {HIGHLIGHTS.map((h) => (
            <button
              key={h.label}
              type="button"
              className="flex flex-col items-center gap-1.5 shrink-0"
              onClick={() => {
                setSelectedHighlight(h.label);
                setHighlightOpen(true);
              }}
              data-ocid={`public_profile.${h.label.toLowerCase()}_tab`}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: "rgba(168,85,247,0.12)",
                  border: "2.5px solid transparent",
                  backgroundClip: "padding-box",
                  boxShadow: "0 0 0 2.5px rgba(168,85,247,0.45)",
                }}
              >
                {h.emoji}
              </div>
              <span
                className="text-[10px]"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {h.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Photos Grid ── */}
      {allPhotos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-4 mt-6"
        >
          <h2
            className="text-base font-bold mb-3"
            style={{
              background: "linear-gradient(90deg, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Photos
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {allPhotos.slice(0, 6).map((photo, i) => (
              <button
                key={photo.url}
                type="button"
                className="relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
                onClick={() => {
                  setSelectedPhoto(photo);
                  setPhotoOpen(true);
                }}
                data-ocid={`public_profile.photo.item.${i + 1}`}
              >
                <ImgWithFallback
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                  fallbackAvatar={avatarString}
                />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Posts Feed ── */}
      {posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-4 mt-6"
        >
          <h2
            className="text-base font-bold mb-3"
            style={{
              background: "linear-gradient(90deg, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Posts
          </h2>
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                data-ocid={`public_profile.post.item.${post.id}`}
              >
                {/* Post header */}
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #a855f7, #ec4899)",
                      padding: 1.5,
                    }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <ImgWithFallback
                        src={coverPhoto}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        fallbackAvatar={avatarString}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {profile.name}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      2h ago
                    </p>
                  </div>
                </div>
                {/* Post image */}
                <div className="w-full aspect-square overflow-hidden">
                  <ImgWithFallback
                    src={post.image}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                    fallbackAvatar={avatarString}
                  />
                </div>
                {/* Action row */}
                <div className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-5">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 transition-all active:scale-90"
                      onClick={() => togglePostLike(post.id)}
                      data-ocid={`public_profile.post.toggle.${post.id}`}
                    >
                      <Heart
                        size={22}
                        style={{
                          color: likedPosts[post.id]
                            ? "#ec4899"
                            : "rgba(255,255,255,0.6)",
                          fill: likedPosts[post.id] ? "#ec4899" : "none",
                        }}
                      />
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        {post.likes + (likedPosts[post.id] ? 1 : 0)}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5"
                      onClick={() => {
                        setSelectedPostId(post.id);
                        setCommentsOpen(true);
                      }}
                      data-ocid={`public_profile.post.comments.${post.id}`}
                    >
                      <MessageCircle
                        size={22}
                        style={{ color: "rgba(255,255,255,0.6)" }}
                      />
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        {post.comments.length}
                      </span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5">
                      <Send
                        size={20}
                        style={{ color: "rgba(255,255,255,0.6)" }}
                      />
                    </button>
                  </div>
                </div>
                {/* Caption */}
                <div className="px-4 pb-3">
                  <p
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    <span className="font-semibold text-white">
                      {profile.name}{" "}
                    </span>
                    {post.caption}
                  </p>
                  {post.comments.length > 0 && (
                    <button
                      type="button"
                      className="text-xs mt-1"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                      onClick={() => {
                        setSelectedPostId(post.id);
                        setCommentsOpen(true);
                      }}
                    >
                      View all {post.comments.length} comments
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Fixed Bottom Action Bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-6 py-4"
        style={{
          background: "rgba(10,10,15,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        {isMatched ? (
          <button
            type="button"
            onClick={() => navigate({ to: "/chat/$id", params: { id } })}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-base transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              color: "white",
              boxShadow: "0 4px 20px rgba(124,58,237,0.45)",
            }}
            data-ocid="public_profile.send_message_button"
          >
            <MessageCircle size={22} />
            Send Message 💬
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handlePass}
              className="flex flex-col items-center gap-1 group"
              data-ocid="public_profile.pass_button"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
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
            <button
              type="button"
              onClick={handleLike}
              className="flex flex-col items-center gap-1 group"
              data-ocid="public_profile.like_button"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #ec4899, #f97316)",
                  boxShadow: "0 4px 20px rgba(236,72,153,0.4)",
                }}
              >
                <Heart size={28} style={{ color: "white", fill: "white" }} />
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

      {/* ── Highlight Empty State Sheet ── */}
      <Sheet open={highlightOpen} onOpenChange={setHighlightOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-0 px-0"
          style={{ background: "#12111a", maxHeight: "50vh" }}
        >
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="text-4xl">
              {HIGHLIGHTS.find((h) => h.label === selectedHighlight)?.emoji}
            </span>
            <p className="text-base font-semibold text-white">
              {selectedHighlight}
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              No stories in this highlight yet 🌸
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Photo Fullscreen Modal ── */}
      <AnimatePresence>
        {photoOpen && selectedPhoto && (
          <motion.div
            key="photo-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: "rgba(0,0,0,0.92)" }}
            onClick={() => setPhotoOpen(false)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onClick={() => setPhotoOpen(false)}
              data-ocid="public_profile.photo_modal.close_button"
            >
              <X size={18} color="#fff" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl"
            />
            {selectedPhoto.caption && (
              <p
                className="mt-4 px-6 text-center text-sm"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {selectedPhoto.caption}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Comments Sheet ── */}
      <Sheet open={commentsOpen} onOpenChange={setCommentsOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-0"
          style={{ background: "#12111a", maxHeight: "70vh" }}
        >
          <div className="flex flex-col h-full gap-4 pt-2">
            <h3 className="text-base font-bold text-white text-center">
              Comments
            </h3>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2">
              {selectedPost?.comments.map((c, i) => (
                <div key={`${c.user}-${i}`} className="flex gap-3 items-start">
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{
                      background: "linear-gradient(135deg, #a855f7, #ec4899)",
                      color: "#fff",
                    }}
                  >
                    {c.user[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{c.user}</p>
                    <p
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}
              {(!selectedPost?.comments ||
                selectedPost.comments.length === 0) && (
                <p
                  className="text-center text-sm"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  No comments yet. Be first! 💬
                </p>
              )}
            </div>
            <div
              className="flex items-center gap-3 px-1 pb-2"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                paddingTop: 12,
              }}
            >
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-white/30"
                data-ocid="public_profile.comment_input"
              />
              <button
                type="button"
                className="text-sm font-semibold"
                style={{ color: "#a855f7" }}
                onClick={() => setCommentInput("")}
                data-ocid="public_profile.comment_submit_button"
              >
                Post
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
