import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  CheckCircle,
  Edit2,
  LogOut,
  Moon,
  Play,
  Plus,
  Shield,
  Star,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { AdBanner } from "../components/AdBanner";
import { BottomNav } from "../components/BottomNav";
import { RewardedAdModal } from "../components/RewardedAdModal";
import { UpgradeModal } from "../components/UpgradeModal";
import { useApp } from "../context/AppContext";
import { AVAILABLE_PROMPTS } from "../data/mockData";

const ALL_INTERESTS = [
  "Coding",
  "Music",
  "Hiking",
  "Coffee",
  "Art",
  "Movies",
  "Yoga",
  "Gaming",
  "Travel",
  "Reading",
  "Dance",
  "Cooking",
  "Sports",
  "Photography",
];

interface Photo {
  url: string;
  caption: string;
}

interface PromptCard {
  prompt: string;
  answer: string;
}

function VerifyModal({
  onClose,
  onVerified,
}: { onClose: () => void; onVerified: () => void }) {
  const [step, setStep] = useState<"idle" | "loading" | "done">("idle");

  const handleVerify = () => {
    setStep("loading");
    setTimeout(() => {
      setStep("done");
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1200);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={step === "idle" ? onClose : undefined}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] rounded-t-3xl p-8 text-center"
        style={{
          background: "#faf8ff",
          boxShadow: "0 -8px 32px rgba(109,40,217,0.15)",
        }}
      >
        {step === "done" ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="space-y-3"
          >
            <div className="text-5xl">✅</div>
            <p className="font-bold text-gray-800 text-lg">Profile Verified!</p>
            <p className="text-sm text-gray-500">
              Your blue checkmark is now live.
            </p>
          </motion.div>
        ) : step === "loading" ? (
          <div className="space-y-4 py-4">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center animate-pulse"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              }}
            >
              <Camera size={28} className="text-white" />
            </div>
            <p className="text-gray-600 font-semibold">
              Verifying your selfie…
            </p>
            <div
              className="w-full h-1.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.15)" }}
            >
              <motion.div
                className="h-1.5 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #7C3AED, #EC4899)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7C3AED22, #EC489922)",
                border: "2px dashed rgba(139,92,246,0.4)",
              }}
            >
              <Camera size={32} style={{ color: "#7C3AED" }} />
            </div>
            <div>
              <h3 className="font-display text-xl font-black text-gray-800 mb-1">
                Verify Your Profile
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Take a quick selfie to get your blue checkmark. Verified
                profiles get 2x more matches.
              </p>
            </div>
            <div className="space-y-2 text-left">
              {[
                "Helps others trust your profile",
                "Blue ✓ badge on your profile",
                "Higher visibility in matches",
              ].map((tip) => (
                <div
                  key={tip}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <CheckCircle
                    size={14}
                    className="text-purple-500 flex-shrink-0"
                  />
                  {tip}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleVerify}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              }}
            >
              Take Selfie & Verify
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Not now
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const {
    user,
    setUser,
    theme,
    toggleTheme,
    setShowUpgradeModal,
    mode,
    rewardLikes,
    incrementAdsWatched,
    adsWatched,
    verifyProfile,
  } = useApp();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio ?? "");
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [promptCards, setPromptCards] = useState<PromptCard[]>(
    user?.promptCards ?? [],
  );
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [promptAnswer, setPromptAnswer] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoSlot, setActivePhotoSlot] = useState<number | null>(null);
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  if (!user) return null;

  // Profile completion calculation
  const photoScore = Math.min(photos.length / 6, 1) * 40;
  const bioScore = bio.trim().length > 10 ? 20 : (bio.trim().length / 10) * 20;
  const interestScore =
    interests.length >= 3 ? 20 : (interests.length / 3) * 20;
  const promptScore =
    promptCards.length >= 2 ? 20 : (promptCards.length / 2) * 20;
  const completionPct = Math.round(
    photoScore + bioScore + interestScore + promptScore,
  );

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 6
          ? [...prev, tag]
          : prev,
    );
  };

  const saveProfile = () => {
    setUser({ ...user, bio, interests, promptCards });
    setEditing(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const photoUrl = ev.target?.result as string;
      setUser({ ...user, photoUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleGridPhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activePhotoSlot === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPhotos((prev) => {
        const next = [...prev];
        if (activePhotoSlot < next.length) {
          next[activePhotoSlot] = { ...next[activePhotoSlot], url };
        } else {
          next.push({ url, caption: "" });
        }
        return next;
      });
      setActivePhotoSlot(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setPhotos((prev) => {
      const next = [...prev];
      if (next[index])
        next[index] = { ...next[index], caption: caption.slice(0, 60) };
      return next;
    });
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReward = (type: "likes" | "superlike", amount: number) => {
    rewardLikes(type, amount);
    incrementAdsWatched();
  };

  const addPromptCard = () => {
    if (!selectedPrompt || !promptAnswer.trim()) return;
    setPromptCards((prev) => [
      ...prev,
      { prompt: selectedPrompt, answer: promptAnswer.trim() },
    ]);
    setSelectedPrompt("");
    setPromptAnswer("");
    setShowAddPrompt(false);
  };

  const removePromptCard = (idx: number) => {
    setPromptCards((prev) => prev.filter((_, i) => i !== idx));
  };

  const isBff = mode === "bff";
  const gradientStyle = isBff
    ? "linear-gradient(135deg, #F59E0B, #F97316)"
    : "linear-gradient(135deg, #7C3AED, #EC4899)";
  const glowStyle = isBff
    ? "0 0 24px rgba(245,158,11,0.5)"
    : "0 0 24px rgba(124,58,237,0.5)";

  const nextRewardType: "likes" | "superlike" =
    adsWatched % 2 === 1 ? "superlike" : "likes";

  const completionTips: string[] = [];
  if (photos.length < 6)
    completionTips.push(
      `Add ${6 - photos.length} more photo${6 - photos.length > 1 ? "s" : ""}`,
    );
  if (bio.trim().length <= 10) completionTips.push("Write a bio");
  if (interests.length < 3) completionTips.push("Add at least 3 interests");
  if (promptCards.length < 2) completionTips.push("Answer 2 prompts");

  return (
    <div className="app-shell bg-app flex flex-col h-[100dvh]">
      <header className="glass-dark px-5 py-4 flex justify-between items-center flex-shrink-0">
        <h1 className="font-display text-2xl font-black text-gradient-violet">
          Profile
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="profile.toggle"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="profile.edit_button"
          >
            <Edit2 size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Profile Completion Bar */}
        <div className="px-5 pt-4 pb-2">
          <div className="glass-card rounded-2xl px-4 py-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-foreground">
                Profile Completion
              </span>
              <span
                className="text-sm font-black"
                style={{
                  color:
                    completionPct >= 80
                      ? "#22c55e"
                      : completionPct >= 50
                        ? "#7C3AED"
                        : "#f59e0b",
                }}
              >
                {completionPct}%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full"
              style={{ background: "rgba(139,92,246,0.12)" }}
            >
              <motion.div
                className="h-2 rounded-full"
                style={{ background: gradientStyle }}
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {completionTips.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                💡 {completionTips[0]} to boost your profile
              </p>
            )}
          </div>
        </div>

        {/* Verification Banner */}
        {!user.isVerified ? (
          <div className="px-5 pt-2 pb-1">
            <button
              type="button"
              onClick={() => setShowVerifyModal(true)}
              className="w-full rounded-2xl p-3.5 flex items-center gap-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))",
                border: "1px solid rgba(59,130,246,0.3)",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.15)" }}
              >
                <CheckCircle size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Verify your profile
                </p>
                <p className="text-xs text-muted-foreground">
                  Get a blue checkmark — 2x more matches
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="px-5 pt-2 pb-1">
            <div
              className="rounded-2xl p-3 flex items-center gap-2"
              style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <CheckCircle
                size={16}
                className="text-blue-500"
                fill="#3b82f6"
                color="white"
              />
              <span className="text-sm font-semibold text-blue-600">
                Verified Profile
              </span>
            </div>
          </div>
        )}

        {/* Avatar + info */}
        <div className="px-5 py-4 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
                style={{ boxShadow: glowStyle }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black text-white"
                style={{ background: gradientStyle, boxShadow: glowStyle }}
              >
                {user.name.charAt(0)}
              </div>
            )}
            {user.isVerified && (
              <div className="absolute -top-1 -right-1">
                <CheckCircle
                  size={20}
                  className="text-blue-500"
                  fill="#3b82f6"
                  color="white"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-110"
              style={{ background: gradientStyle }}
              data-ocid="profile.upload_button"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
              data-ocid="profile.dropzone"
            />
          </div>
          <h2 className="font-display text-2xl font-black text-foreground">
            {user.name}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {user.major} · {user.year}
            {user.gender && user.gender !== "prefer_not_to_say" && (
              <span className="ml-2">
                · {user.gender === "male" ? "♂️" : "♀️"}
              </span>
            )}
          </p>
          <div className="flex justify-center gap-2 mt-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: isBff
                  ? "linear-gradient(135deg, #F59E0B22, #F9731622)"
                  : "linear-gradient(135deg, #7C3AED22, #EC489922)",
                border: isBff
                  ? "1px solid rgba(245,158,11,0.3)"
                  : "1px solid rgba(139,92,246,0.3)",
              }}
            >
              {user.mode === "dating" ? "💘 Dating" : "🤝 BFF"}
            </span>
            {user.isPro && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold text-yellow-300"
                style={{
                  background: "rgba(234,179,8,0.2)",
                  border: "1px solid rgba(234,179,8,0.3)",
                }}
              >
                ⚡ Pro
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 mb-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Matches", value: "12" },
              { label: "Likes", value: "47" },
              { label: "Views", value: "134" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="glass-card rounded-2xl p-3 text-center"
              >
                <div className="font-display text-xl font-black text-gradient-violet">
                  {value}
                </div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Earn More */}
        {!user.isPro && (
          <div className="px-5 mb-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(249,115,22,0.12))",
                border: "1px solid rgba(245,158,11,0.25)",
              }}
              data-ocid="profile.card"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    🌟 Earn More
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Watch ads to earn free likes & super likes
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className="text-xl font-black"
                    style={{ color: "#F59E0B" }}
                  >
                    {adsWatched}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ads watched
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRewardedAd(true)}
                className="w-full py-3 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #F97316)",
                  boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
                }}
                data-ocid="profile.primary_button"
              >
                <Play size={16} fill="white" />
                {nextRewardType === "likes"
                  ? "Watch Ad — Earn 5 Likes"
                  : "Watch Ad — Earn 1 Super Like"}
              </button>
            </motion.div>
          </div>
        )}

        {!user.isPro && (
          <div className="px-5 mb-4">
            <AdBanner />
          </div>
        )}

        {/* My Photos */}
        <div className="px-5 mb-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">
            My Photos{" "}
            <span className="ml-1 text-xs opacity-60">{photos.length}/6</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {["p1", "p2", "p3", "p4", "p5", "p6"].map((slotId, i) => {
              const photo = photos[i];
              return (
                <motion.div
                  key={slotId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col gap-1"
                  data-ocid={`profile.item.${i + 1}`}
                >
                  {photo ? (
                    <>
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                        <img
                          src={photo.url}
                          alt="User uploaded content"
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)",
                          }}
                        />
                        {editing && (
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(i)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                            data-ocid={`profile.delete_button.${i + 1}`}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      {editing ? (
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) =>
                            handleCaptionChange(i, e.target.value)
                          }
                          placeholder="Add a caption..."
                          maxLength={60}
                          className="w-full px-2 py-1 rounded-lg text-xs bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        photo.caption && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium glass-card text-foreground truncate">
                            {photo.caption}
                          </span>
                        )
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editing) return;
                          setActivePhotoSlot(i);
                          photoInputRef.current?.click();
                        }}
                        className="aspect-[3/4] rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: editing
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(255,255,255,0.02)",
                          border: editing
                            ? `2px dashed rgba(${isBff ? "234,179,8" : "139,92,246"},0.4)`
                            : "2px dashed rgba(255,255,255,0.08)",
                          cursor: editing ? "pointer" : "default",
                        }}
                        data-ocid="profile.upload_button"
                      >
                        {editing ? (
                          <>
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                              style={{ background: gradientStyle }}
                            >
                              <Plus size={20} className="text-white" />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                              Add photo
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground/30 text-2xl">
                            +
                          </span>
                        )}
                      </button>
                      {editing && <div className="h-6" />}
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleGridPhotoAdd}
          />
          {!editing && photos.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Tap the edit icon to add up to 6 photos
            </p>
          )}
        </div>

        {/* Prompt Cards */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Prompts
            </h3>
            {editing && promptCards.length < 5 && (
              <button
                type="button"
                onClick={() => setShowAddPrompt(true)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105"
                style={{ background: gradientStyle, color: "white" }}
              >
                <Plus size={12} /> Add Prompt
              </button>
            )}
          </div>

          {promptCards.length === 0 && !editing && (
            <p className="text-xs text-muted-foreground text-center py-3 glass-card rounded-2xl">
              Tap edit to add prompts — they make your profile shine ✨
            </p>
          )}

          <div className="space-y-3">
            {promptCards.map((card, idx) => (
              <motion.div
                // biome-ignore lint/suspicious/noArrayIndexKey: prompt cards are user-ordered
                key={`prompt-${idx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 relative"
                style={{
                  background:
                    "linear-gradient(135deg, #f3f0ff 0%, #fce7f3 100%)",
                  border: "1.5px solid rgba(139,92,246,0.2)",
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: "#7C3AED" }}
                >
                  {card.prompt}
                </p>
                <p className="text-gray-800 text-sm font-medium leading-snug">
                  {card.answer}
                </p>
                {editing && (
                  <button
                    type="button"
                    onClick={() => removePromptCard(idx)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/10 flex items-center justify-center"
                  >
                    <X size={12} className="text-gray-500" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Add Prompt Panel */}
          <AnimatePresence>
            {showAddPrompt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="glass-card rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-bold text-foreground">
                    Choose a prompt
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_PROMPTS.filter(
                      (p) => !promptCards.some((c) => c.prompt === p),
                    ).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPrompt(p)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          selectedPrompt === p
                            ? "text-white"
                            : "text-muted-foreground"
                        }`}
                        style={{
                          background:
                            selectedPrompt === p
                              ? gradientStyle
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
                      placeholder="Your answer..."
                      rows={2}
                      maxLength={140}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPrompt(false);
                        setSelectedPrompt("");
                        setPromptAnswer("");
                      }}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-muted-foreground glass-card"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addPromptCard}
                      disabled={!selectedPrompt || !promptAnswer.trim()}
                      className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                      style={{ background: gradientStyle }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bio */}
        <div className="px-5 mb-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">
            About Me
          </h3>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              data-ocid="profile.textarea"
            />
          ) : (
            <p className="text-foreground text-sm glass-card rounded-xl px-4 py-3">
              {bio || "Add a bio to tell people about yourself!"}
            </p>
          )}
        </div>

        {/* Interests */}
        <div className="px-5 mb-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">
            Interests {editing && <span className="text-xs">(max 6)</span>}
          </h3>
          <div className="flex flex-wrap gap-2">
            {(editing ? ALL_INTERESTS : interests).map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => editing && toggleInterest(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  interests.includes(tag)
                    ? "text-primary neon-border-violet"
                    : editing
                      ? "glass-dark text-muted-foreground"
                      : "glass-dark text-foreground"
                }`}
                data-ocid={`profile.item.${ALL_INTERESTS.indexOf(tag) + 1}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {editing && (
          <div className="px-5 mb-4">
            <button
              type="button"
              onClick={saveProfile}
              className="w-full py-3.5 rounded-xl font-bold text-white"
              style={{ background: gradientStyle }}
              data-ocid="profile.save_button"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Subscription */}
        <div className="px-5 mb-4 space-y-3">
          {!user.isPro ? (
            <>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{ background: gradientStyle }}
                data-ocid="profile.primary_button"
              >
                <Zap size={20} /> Upgrade to Pro
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/subscription" })}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-muted-foreground glass-card flex items-center justify-center gap-2 hover:text-foreground transition-colors"
                data-ocid="profile.secondary_button"
              >
                <Star size={16} /> View Plans & Pricing
              </button>
            </>
          ) : (
            <div
              className="w-full py-3 rounded-2xl text-center text-sm font-bold"
              style={{
                background: "rgba(234,179,8,0.15)",
                border: "1px solid rgba(234,179,8,0.3)",
                color: "#F59E0B",
              }}
            >
              ⚡ UNIVÈRA Pro Active
            </div>
          )}
        </div>

        {/* Account actions */}
        <div className="px-5 mb-4 space-y-2">
          <button
            type="button"
            className="w-full py-3 px-4 glass-card rounded-xl text-sm font-semibold text-foreground flex items-center gap-3 hover:bg-white/5 transition-colors"
            onClick={() => navigate({ to: "/admin" })}
            data-ocid="profile.admin.link"
          >
            <Shield size={18} className="text-primary" /> Admin Panel
          </button>
          <button
            type="button"
            className="w-full py-3 px-4 glass-card rounded-xl text-sm font-semibold text-destructive flex items-center gap-3 hover:bg-destructive/10 transition-colors"
            onClick={() => {
              setUser(null);
              navigate({ to: "/" });
            }}
            data-ocid="profile.delete_button"
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>

        <div className="px-5 pb-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>

      <BottomNav />
      <UpgradeModal />
      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onReward={handleReward}
        rewardType={nextRewardType}
      />

      <AnimatePresence>
        {showVerifyModal && (
          <VerifyModal
            onClose={() => setShowVerifyModal(false)}
            onVerified={verifyProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
