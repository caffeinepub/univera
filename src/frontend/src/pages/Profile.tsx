import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  CheckCircle,
  Edit2,
  HelpCircle,
  Loader2,
  LogOut,
  Moon,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Shield,
  Star,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AdBanner } from "../components/AdBanner";
import { AvatarBuilder } from "../components/AvatarBuilder";
import { BoostButton } from "../components/BoostButton";
import { BottomNav } from "../components/BottomNav";
import { ImgWithFallback } from "../components/ImgWithFallback";
import { RewardedAdModal } from "../components/RewardedAdModal";
import { SelfieVerification } from "../components/SelfieVerification";
import { UpgradeModal } from "../components/UpgradeModal";
import { useApp } from "../context/AppContext";
import { AVAILABLE_PROMPTS } from "../data/mockData";
import { useUploadPhoto } from "../hooks/useUploadPhoto";

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

export function Profile() {
  const navigate = useNavigate();
  const {
    user,
    setUser,
    theme,
    toggleTheme,
    setShowUpgradeModal,
    setUpgradeReason,
    mode,
    rewardLikes,
    incrementAdsWatched,
    adsWatched,
    verifyProfile,
    setTutorialDone,
    planType,
    superLikesRemaining,
    nextSuperLikeResetIn,
    avatarData,
    setAvatarData,
    avatarString,
    updateUserPhotos,
    setCoverPhotoIdx,
    currentUserOnlineStatus,
    setCurrentUserOnlineStatus,
  } = useApp();
  const { uploadFile } = useUploadPhoto();
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
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const addPhotoInputRef = useRef<HTMLInputElement>(null);
  const [replaceSlot, setReplaceSlot] = useState<number | null>(null);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [uploadingLabel, setUploadingLabel] = useState("");

  // Sync photos from user context when user changes
  useEffect(() => {
    if (user?.photos && user.photos.length > 0) {
      setPhotos(user.photos);
    }
  }, [user?.photos]);

  if (!user) return null;

  // ─── Profile Completion (spec formula) ──────────────────────────────────────
  let completionPct = 0;
  if (user.name?.trim()) completionPct += 10;
  if (user.photoUrl) completionPct += 15;
  if (bio.trim().length > 5) completionPct += 15;
  if (interests.length >= 1) completionPct += 15;
  if (user.major?.trim()) completionPct += 10;
  if (user.year?.trim()) completionPct += 10;
  if (user.gender) completionPct += 10;
  if (user.isVerified) completionPct += 10;
  if (photos.length >= 3) completionPct += 5;

  // Smart tip
  let completionTip = "";
  if (!user.photoUrl)
    completionTip = "Add a profile photo to get more matches!";
  else if (bio.trim().length <= 5) completionTip = "Add your bio to stand out!";
  else if (interests.length < 1)
    completionTip = "Add interests to find better matches!";
  else if (!user.isVerified)
    completionTip = "Verify your profile for a blue checkmark!";
  else if (photos.length < 3)
    completionTip = "Add 3+ photos for more visibility!";
  else completionTip = "Your profile is looking great! 🎉";

  const completionColor =
    completionPct >= 80
      ? "#22c55e"
      : completionPct >= 50
        ? "#7C3AED"
        : "#f59e0b";

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 6
          ? [...prev, tag]
          : prev,
    );
  };

  const saveProfile = async () => {
    setUser({ ...user, bio, interests, promptCards });
    await handleSaveCaptions();
  };

  // ─── Photo management (blob-storage wired) ─────────────────────────────────

  const handleMainPhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = "";
    try {
      const url = await uploadFile(file);
      setUser({ ...user, photoUrl: url });
    } catch {
      // Fallback to local URL
      const url = URL.createObjectURL(file);
      setUser({ ...user, photoUrl: url });
    }
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setPhotos((prev) => {
      const next = [...prev];
      if (next[index])
        next[index] = { ...next[index], caption: caption.slice(0, 60) };
      return next;
    });
  };

  const handleSaveCaptions = async () => {
    const coverIdx = user.coverPhotoIndex ?? 0;
    await updateUserPhotos(photos, coverIdx);
    setEditing(false);
    toast.success("Profile saved ✨");
  };

  const handleSetCover = async (index: number) => {
    await setCoverPhotoIdx(index);
    toast.success("Cover photo updated 📸");
  };

  const handleDeletePhoto = async (index: number) => {
    if (photos.length <= 3) {
      toast.error("Minimum 3 photos required");
      return;
    }
    const next = photos.filter((_, i) => i !== index);
    const currentCover = user.coverPhotoIndex ?? 0;
    const newCover =
      index === currentCover
        ? 0
        : currentCover > index
          ? currentCover - 1
          : currentCover;
    setPhotos(next);
    await updateUserPhotos(next, newCover);
    toast.success("Photo removed");
  };

  const handleReplacePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceSlot === null) return;
    e.target.value = "";
    setPhotoUploading(true);
    setUploadingLabel("Replacing photo…");
    try {
      const url = await uploadFile(file);
      const next = [...photos];
      next[replaceSlot] = { ...next[replaceSlot], url };
      setPhotos(next);
      const coverIdx = user.coverPhotoIndex ?? 0;
      await updateUserPhotos(next, coverIdx);
      toast.success("Photo replaced ✨");
    } catch {
      toast.error("Upload failed. Try again.");
    } finally {
      setPhotoUploading(false);
      setUploadingLabel("");
      setReplaceSlot(null);
    }
  };

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= 6) {
      toast.error("Maximum 6 photos allowed");
      return;
    }
    e.target.value = "";
    setPhotoUploading(true);
    setUploadingLabel("Uploading photo…");
    try {
      const url = await uploadFile(file);
      const next = [...photos, { url, caption: "" }];
      setPhotos(next);
      const coverIdx = user.coverPhotoIndex ?? 0;
      await updateUserPhotos(next, coverIdx);
      toast.success("Photo added ✨");
    } catch {
      toast.error("Upload failed. Try again.");
    } finally {
      setPhotoUploading(false);
      setUploadingLabel("");
    }
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
            onClick={() => setEditing((prev) => !prev)}
            className={`transition-all active:scale-90 cursor-pointer px-2 py-1 rounded-lg ${
              editing
                ? "text-white font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={
              editing
                ? { background: "linear-gradient(135deg,#7C3AED,#EC4899)" }
                : {}
            }
            data-ocid="profile.edit_button"
          >
            {editing ? <X size={18} /> : <Edit2 size={20} />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* ─ Profile Completion Bar ──────────────────────────────────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-2">
          <div className="glass-card rounded-2xl px-4 py-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-foreground">
                Profile Completion
              </span>
              <motion.span
                key={completionPct}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-sm font-black"
                style={{ color: completionColor }}
              >
                {completionPct}%
              </motion.span>
            </div>
            <div
              className="w-full h-2.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.12)" }}
            >
              <motion.div
                className="h-2.5 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #7C3AED, #EC4899)",
                  boxShadow:
                    completionPct >= 80
                      ? "0 0 10px rgba(124,58,237,0.6)"
                      : "none",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 {completionTip}
            </p>
          </div>
        </div>

        {/* ─ Verification Banner ──────────────────────────────────────────────────────────────────────── */}
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
              data-ocid="profile.primary_button"
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

        {/* ─ Avatar + info ────────────────────────────────────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            {user.photoUrl ? (
              <ImgWithFallback
                src={user.photoUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
                fallbackAvatar={avatarString}
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
              onChange={handleMainPhotoChange}
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

        {/* ─ Stats ───────────────────────────────────────────────────────────────────────────────────────────────── */}
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

        {/* ─ Plan Info & Boost ─────────────────────────────────────────────────────────────────────────────────── */}
        <div className="px-5 mb-4">
          {/* Plan badge */}
          <div className="mb-3" data-ocid="profile.card">
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground">
                  Your Plan
                </span>
                {planType === "free" ? (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white/70"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    FREE
                  </span>
                ) : planType === "monthly" ? (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{
                      background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                    }}
                  >
                    PRO MONTHLY
                  </span>
                ) : (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#f97316)",
                    }}
                  >
                    PRO YEARLY ⭐
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>⭐ Super Likes remaining</span>
                <span className="font-bold text-foreground">
                  {superLikesRemaining === 999
                    ? "Unlimited"
                    : superLikesRemaining}
                </span>
              </div>
              {nextSuperLikeResetIn > 0 && planType !== "yearly" && (
                <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                  Resets in {Math.floor(nextSuperLikeResetIn / 3_600_000)}h{" "}
                  {Math.floor((nextSuperLikeResetIn % 3_600_000) / 60_000)}m
                </div>
              )}
              {planType === "free" && (
                <button
                  type="button"
                  onClick={() => {
                    setShowUpgradeModal(true);
                    setUpgradeReason("Unlock Pro features");
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold text-white mt-3"
                  style={{
                    background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                  }}
                  data-ocid="profile.primary_button"
                >
                  ✨ Upgrade to Pro
                </button>
              )}
            </div>
          </div>
          {/* Boost button */}
          <BoostButton />
        </div>

        {/* ─ Earn More ───────────────────────────────────────────────────────────────────────────────────────────── */}
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
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    🌟 Earn More
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Watch ads to earn free likes &amp; super likes
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

        {/* ─ My Photos ──────────────────────────────────────────────────────── */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-muted-foreground">
              My Photos{" "}
              <span className="ml-1 text-xs opacity-60">{photos.length}/6</span>
            </h3>
            {editing && photos.length < 6 && (
              <button
                type="button"
                onClick={() => addPhotoInputRef.current?.click()}
                disabled={photoUploading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                }}
                data-ocid="profile.upload_button"
              >
                {photoUploading && uploadingLabel === "Uploading photo…" ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Plus size={11} />
                )}
                Add Photo
              </button>
            )}
          </div>

          {/* Upload progress */}
          {photoUploading && (
            <div
              className="mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
              style={{
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
              data-ocid="profile.loading_state"
            >
              <Loader2 size={13} className="animate-spin text-primary" />
              <span className="text-xs font-medium text-primary">
                {uploadingLabel}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, i) => {
              const isCover = (user.coverPhotoIndex ?? 0) === i;
              return (
                <motion.div
                  key={photo.url || `photo-slot-${i}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col gap-1"
                  data-ocid={`profile.item.${i + 1}`}
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                    <ImgWithFallback
                      src={photo.url}
                      alt="Profile photo"
                      className="w-full h-full object-cover"
                      fallbackAvatar={avatarString}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)",
                      }}
                    />
                    {/* Cover badge */}
                    {isCover && (
                      <div
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ background: "rgba(124,58,237,0.85)" }}
                      >
                        Cover
                      </div>
                    )}
                    {editing && (
                      <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                        {/* Delete */}
                        {photos.length > 3 && (
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(i)}
                            className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                            data-ocid={`profile.delete_button.${i + 1}`}
                          >
                            <X size={11} />
                          </button>
                        )}
                        {/* Replace */}
                        <button
                          type="button"
                          onClick={() => {
                            setReplaceSlot(i);
                            replaceInputRef.current?.click();
                          }}
                          disabled={photoUploading}
                          className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-blue-500/80 transition-colors disabled:opacity-50"
                          data-ocid={`profile.edit_button.${i + 1}`}
                        >
                          <RefreshCw size={11} />
                        </button>
                      </div>
                    )}
                    {/* Set as Cover (bottom) */}
                    {editing && !isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(i)}
                        className="absolute bottom-2 left-2 right-2 py-1 rounded-lg text-[10px] font-bold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{
                          background: "rgba(0,0,0,0.55)",
                          backdropFilter: "blur(4px)",
                        }}
                        data-ocid={`profile.save_button.${i + 1}`}
                      >
                        ⭐ Set as Cover
                      </button>
                    )}
                  </div>
                  {editing ? (
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => handleCaptionChange(i, e.target.value)}
                      placeholder="Add a caption..."
                      maxLength={60}
                      className="w-full px-2 py-1 rounded-lg text-xs bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      data-ocid="profile.input"
                    />
                  ) : (
                    photo.caption && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium glass-card text-foreground truncate">
                        {photo.caption}
                      </span>
                    )
                  )}
                </motion.div>
              );
            })}

            {/* Add photo slot */}
            {photos.length < 6 && !editing && (
              <div
                className="aspect-[3/4] rounded-2xl flex flex-col items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "2px dashed rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-muted-foreground/30 text-2xl">+</span>
              </div>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAddPhoto}
          />
          <input
            ref={addPhotoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAddPhoto}
          />
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleReplacePhoto}
          />

          {!editing && photos.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Tap the edit icon ✏️ to add up to 6 photos
            </p>
          )}
        </div>

        {/* ─ Avatar Builder ────────────────────────────────────────────────────────────────────────────────────── */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-muted-foreground">
              🎭 Avatar
            </h3>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.08))",
              border: "1.5px solid rgba(139,92,246,0.2)",
            }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="text-4xl select-none">{avatarString}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Your Avatar
                </p>
                <p className="text-xs text-muted-foreground">
                  Used as profile fallback when no photo is set
                </p>
              </div>
              {editing && (
                <button
                  type="button"
                  onClick={() => setShowAvatarBuilder((p) => !p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  }}
                  data-ocid="profile.avatar.button"
                >
                  {showAvatarBuilder ? "Done" : "Customize"}
                </button>
              )}
            </div>
            {showAvatarBuilder && editing && avatarData && (
              <AvatarBuilder value={avatarData} onChange={setAvatarData} />
            )}
          </div>
        </div>

        {/* ─ Prompt Cards ─────────────────────────────────────────────────────────────────────────────────────── */}
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

        {/* ─ Bio ──────────────────────────────────────────────────────────────────────────────────────────────────────── */}
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

        {/* ─ Interests ────────────────────────────────────────────────────────────────────────────────────────── */}
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

        {/* ─ Subscription / How it works ─────────────────────────────────────────────────────── */}
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
                <Star size={16} /> View Plans &amp; Pricing
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

          {/* How it works button */}
          <button
            type="button"
            onClick={() => {
              setTutorialDone(false);
              navigate({ to: "/" });
            }}
            className="w-full py-3 px-4 glass-card rounded-xl text-sm font-semibold text-foreground flex items-center gap-3 hover:bg-white/5 transition-colors"
            data-ocid="profile.secondary_button"
          >
            <span className="text-base">🎉</span> How it works (replay tutorial)
          </button>
        </div>

        {/* ─ Online Status ─────────────────────────────────────────────────────────────────────────────────── */}
        <div className="px-5 mb-4">
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>●</span> Online Status
            </p>
            <div className="flex gap-2">
              {(["online", "away", "offline"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setCurrentUserOnlineStatus(status)}
                  className="flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background:
                      currentUserOnlineStatus === status
                        ? status === "online"
                          ? "rgba(34,197,94,0.2)"
                          : status === "away"
                            ? "rgba(245,158,11,0.2)"
                            : "rgba(107,114,128,0.2)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      currentUserOnlineStatus === status
                        ? status === "online"
                          ? "1px solid rgba(34,197,94,0.5)"
                          : status === "away"
                            ? "1px solid rgba(245,158,11,0.5)"
                            : "1px solid rgba(107,114,128,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                    color:
                      currentUserOnlineStatus === status
                        ? status === "online"
                          ? "#4ade80"
                          : status === "away"
                            ? "#f59e0b"
                            : "#9ca3af"
                        : "rgba(255,255,255,0.5)",
                  }}
                  data-ocid={`profile.online_${status}.toggle`}
                >
                  {status === "online"
                    ? "🟢 Online"
                    : status === "away"
                      ? "🟡 Away"
                      : "⬤ Offline"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─ Account actions ─────────────────────────────────────────────────────────────────────────────────── */}
        <div className="px-5 mb-4 space-y-2">
          <button
            type="button"
            className="w-full py-3 px-4 glass-card rounded-xl text-sm font-semibold text-foreground flex items-center gap-3 hover:bg-white/5 transition-colors"
            onClick={() => navigate({ to: "/help" })}
            data-ocid="profile.help.link"
          >
            <HelpCircle size={18} className="text-primary" /> Help Center
          </button>
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

      {/* Selfie Verification — uses real camera */}
      <SelfieVerification
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerified={verifyProfile}
      />
    </div>
  );
}
