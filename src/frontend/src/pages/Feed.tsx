import { Heart, MessageCircle, Plus, Send, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { ProfileViewer } from "../components/ProfileViewer";
import { useApp } from "../context/AppContext";
import type { FeedPost } from "../context/AppContext";
import { PROFILES } from "../data/mockData";
import type { Profile } from "../data/mockData";

const FEED_PROMPTS = [
  "My perfect weekend is…",
  "Unpopular opinion…",
  "I'm looking for…",
  "My love language is…",
  "The most spontaneous thing I've done…",
  "A hot take I have…",
];

function PostCard({
  post,
  onViewProfile,
}: {
  post: FeedPost;
  onViewProfile?: () => void;
}) {
  const { likePost, addComment, user } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl overflow-hidden mx-4 mb-4 shadow-card-dark"
    >
      {/* User row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={onViewProfile}
          className="relative flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          data-ocid="feed.button"
        >
          <img
            src={post.userPhoto}
            alt={post.userName}
            className="w-10 h-10 rounded-full object-cover"
          />
          {post.isVerified && (
            <ShieldCheck
              size={14}
              className="absolute -bottom-0.5 -right-0.5 text-blue-500"
              fill="#3b82f6"
              color="white"
            />
          )}
        </button>
        <button
          type="button"
          onClick={onViewProfile}
          className="flex-1 min-w-0 text-left cursor-pointer hover:opacity-80 transition-opacity"
          data-ocid="feed.link"
        >
          <p className="font-semibold text-sm text-foreground">
            {post.userName},{" "}
            <span className="font-normal text-muted-foreground">
              {post.userAge}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{post.createdAt}</p>
        </button>
      </div>

      {/* Image */}
      {post.postImage && (
        <div className="px-4 mb-3">
          <img
            src={post.postImage}
            alt="Post content"
            className="w-full rounded-2xl object-cover max-h-64"
          />
        </div>
      )}

      {/* Prompt pill + answer */}
      {post.prompt && (
        <div className="px-4 mb-2">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "#7C3AED",
            }}
          >
            {post.prompt}
          </span>
          <p className="text-sm text-foreground font-medium leading-snug">
            {post.promptAnswer}
          </p>
        </div>
      )}

      {/* Caption */}
      {post.caption && !post.prompt && (
        <div className="px-4 mb-2">
          <p className="text-sm text-foreground leading-snug">{post.caption}</p>
        </div>
      )}

      {/* Stats + actions */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-border/20 mt-1">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => likePost(post.id)}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-all hover:scale-110 active:scale-95 ${
              post.likedByMe ? "text-red-400" : "text-muted-foreground"
            }`}
            data-ocid="feed.toggle"
          >
            <Heart
              size={18}
              fill={post.likedByMe ? "currentColor" : "none"}
              className="transition-colors"
            />
            {post.likesCount}
          </button>
          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="feed.secondary_button"
          >
            <MessageCircle size={18} />
            {post.comments.length}
          </button>
        </div>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/20 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3">
              {post.comments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  Be the first to comment!
                </p>
              )}
              {post.comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <img
                    src={c.userPhoto}
                    alt={c.userName}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                  />
                  <div
                    className="flex-1 rounded-2xl px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <p className="text-xs font-bold text-foreground">
                      {c.userName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}

              {/* Comment input */}
              <div className="flex items-center gap-2 pt-1">
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  }}
                >
                  {(user?.name ?? "Y").charAt(0)}
                </div>
                <div className="flex-1 flex items-center gap-2 rounded-2xl px-3 py-2 bg-input border border-border">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    data-ocid="feed.input"
                  />
                  <button
                    type="button"
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="text-primary disabled:opacity-30 transition-opacity"
                    data-ocid="feed.submit_button"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PostSkeleton() {
  return (
    <div className="glass-card rounded-3xl overflow-hidden mx-4 mb-4 animate-pulse">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-full bg-white/10" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 rounded-full bg-white/10 w-1/3" />
          <div className="h-2.5 rounded-full bg-white/8 w-1/5" />
        </div>
      </div>
      <div className="mx-4 mb-3 h-48 rounded-2xl bg-white/8" />
      <div className="px-4 py-3 border-t border-border/20 flex gap-4">
        <div className="h-4 w-12 rounded-full bg-white/10" />
        <div className="h-4 w-12 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

function CreatePostModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, createPost, postsCreatedToday } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [promptAnswer, setPromptAnswer] = useState("");
  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage(url);
  };

  const handlePost = () => {
    if (!selectedPrompt && !caption && !image) return;
    createPost({
      postImage: image ?? undefined,
      prompt: selectedPrompt || undefined,
      promptAnswer: selectedPrompt ? promptAnswer : undefined,
      caption: caption || undefined,
    });
    onClose();
    setImage(null);
    setSelectedPrompt("");
    setPromptAnswer("");
    setCaption("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md"
            data-ocid="feed.modal"
          >
            <div
              className="glass-dark rounded-t-3xl p-5 pb-8"
              style={{ border: "1px solid rgba(139,92,246,0.2)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl font-black text-gradient-violet">
                  Share a moment
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-muted-foreground"
                  data-ocid="feed.close_button"
                >
                  <X size={16} />
                </button>
              </div>

              {!user?.isVerified && (
                <div
                  className="rounded-2xl p-4 mb-4 text-center"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                  data-ocid="feed.error_state"
                >
                  <p className="text-sm font-semibold text-red-400">
                    🔒 Verify your profile to post
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Head to your Profile to verify your account
                  </p>
                </div>
              )}

              {postsCreatedToday >= 3 && (
                <div
                  className="rounded-2xl p-4 mb-4 text-center"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.25)",
                  }}
                  data-ocid="feed.error_state"
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#F59E0B" }}
                  >
                    You've reached your 3 posts/day limit 🎬
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Come back tomorrow for more
                  </p>
                </div>
              )}

              {/* Image upload */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-2xl flex flex-col items-center justify-center py-6 mb-4 transition-all hover:opacity-80"
                style={{
                  background: image ? "transparent" : "rgba(139,92,246,0.06)",
                  border: "2px dashed rgba(139,92,246,0.3)",
                  padding: image ? 0 : undefined,
                  overflow: "hidden",
                }}
                data-ocid="feed.upload_button"
              >
                {image ? (
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-2xl"
                  />
                ) : (
                  <>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2"
                      style={{
                        background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                      }}
                    >
                      <Plus size={24} className="text-white" />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Add a photo
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Optional
                    </p>
                  </>
                )}
              </button>

              {/* Prompt selector */}
              <div className="mb-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Add a prompt
                </p>
                <div className="flex flex-wrap gap-2">
                  {FEED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setSelectedPrompt((prev) => (prev === p ? "" : p))
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selectedPrompt === p
                          ? "text-white"
                          : "text-muted-foreground"
                      }`}
                      style={{
                        background:
                          selectedPrompt === p
                            ? "linear-gradient(135deg, #7C3AED, #EC4899)"
                            : "rgba(139,92,246,0.08)",
                        border:
                          selectedPrompt === p
                            ? "none"
                            : "1px solid rgba(139,92,246,0.2)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {selectedPrompt && (
                  <textarea
                    value={promptAnswer}
                    onChange={(e) => setPromptAnswer(e.target.value)}
                    placeholder="Your answer…"
                    rows={2}
                    maxLength={200}
                    className="w-full mt-3 px-4 py-3 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    data-ocid="feed.textarea"
                  />
                )}
              </div>

              {/* Caption */}
              {!selectedPrompt && (
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption…"
                  rows={2}
                  maxLength={300}
                  className="w-full mb-4 px-4 py-3 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  data-ocid="feed.textarea"
                />
              )}

              <button
                type="button"
                onClick={handlePost}
                disabled={
                  (!image && !caption && !(selectedPrompt && promptAnswer)) ||
                  !user?.isVerified ||
                  postsCreatedToday >= 3
                }
                className="w-full py-3.5 rounded-2xl font-bold text-white disabled:opacity-40 transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                }}
                data-ocid="feed.submit_button"
              >
                Post
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Feed() {
  const { posts, postsLoading, user } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);

  const findProfileByName = (name: string) =>
    PROFILES.find(
      (p) => p.name.toLowerCase() === name.toLowerCase().split(",")[0].trim(),
    ) ?? null;

  return (
    <div className="app-shell bg-app flex flex-col h-[100dvh]">
      {/* Header */}
      <header className="glass-dark px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <span className="font-display text-xl font-black text-gradient-violet">
          UNIVÈRA
        </span>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Feed
        </span>
        {user?.isVerified && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              boxShadow: "0 2px 12px rgba(124,58,237,0.35)",
            }}
            data-ocid="feed.open_modal_button"
          >
            <Plus size={16} /> Post
          </button>
        )}
        {!user?.isVerified && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-muted-foreground glass-card"
            data-ocid="feed.open_modal_button"
          >
            <Plus size={16} /> Post
          </button>
        )}
      </header>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto pt-4 pb-4">
        {postsLoading ? (
          <div data-ocid="feed.loading_state">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full text-center px-8"
            data-ocid="feed.empty_state"
          >
            <div className="text-5xl mb-4">🌟</div>
            <h3 className="font-display text-xl font-black text-gradient-violet mb-2">
              Nothing here yet
            </h3>
            <p className="text-muted-foreground text-sm">
              Be the first to share a moment on campus!
            </p>
          </div>
        ) : (
          posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              data-ocid={`feed.item.${i + 1}`}
            >
              <PostCard
                post={post}
                onViewProfile={() => {
                  const p = findProfileByName(post.userName);
                  if (p) setViewingProfile(p);
                }}
              />
            </motion.div>
          ))
        )}
      </div>

      <BottomNav />
      <CreatePostModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />

      {/* Profile Viewer */}
      <ProfileViewer
        profile={viewingProfile}
        isOpen={!!viewingProfile}
        onClose={() => setViewingProfile(null)}
        onSwipe={() => setViewingProfile(null)}
        isMatched={false}
      />
    </div>
  );
}
