import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  CheckCircle,
  Edit2,
  Eye,
  HelpCircle,
  Loader2,
  LogOut,
  Moon,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Settings,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
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

const GHOST_PROMPTS = [
  "My simple pleasure is...",
  "Dating me is like...",
  "Biggest green flag...",
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
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
  let _completionTip = "";
  if (!user.photoUrl)
    _completionTip = "Add a profile photo to get more matches!";
  else if (bio.trim().length <= 5)
    _completionTip = "Add your bio to stand out!";
  else if (interests.length < 1)
    _completionTip = "Add interests to find better matches!";
  else if (!user.isVerified)
    _completionTip = "Verify your profile for a blue checkmark!";
  else if (photos.length < 3)
    _completionTip = "Add 3+ photos for more visibility!";
  else _completionTip = "Your profile is looking great! 🎉";

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
  const _glowStyle = isBff
    ? "0 0 24px rgba(245,158,11,0.5)"
    : "0 0 24px rgba(124,58,237,0.5)";

  const nextRewardType: "likes" | "superlike" =
    adsWatched % 2 === 1 ? "superlike" : "likes";

  // Cover photo for hero
  const coverPhoto =
    photos[user.coverPhotoIndex ?? 0]?.url ?? user.photoUrl ?? null;

  // Actionable completion tips
  const completionTips: { icon: string; text: string }[] = [];
  if (!user.photoUrl && photos.length === 0)
    completionTips.push({ icon: "📸", text: "Add photos to get more matches" });
  if (bio.trim().length <= 5)
    completionTips.push({ icon: "✏️", text: "Write your bio to stand out" });
  if (!user.isVerified)
    completionTips.push({
      icon: "✅",
      text: "Verify your profile for 2x matches",
    });
  if (interests.length < 3)
    completionTips.push({
      icon: "🏷️",
      text: "Add interests to find better matches",
    });

  const onlineColor =
    currentUserOnlineStatus === "online"
      ? "#4ade80"
      : currentUserOnlineStatus === "away"
        ? "#f59e0b"
        : "#6b7280";

  return (
    <div className="app-shell bg-app flex flex-col h-[100dvh]">
      <div className="flex-1 overflow-y-auto">
        {/* ─ HERO HEADER ──────────────────────────────────────────────────── */}
        <div className="relative w-full" style={{ height: 280 }}>
          {/* Cover photo */}
          {coverPhoto ? (
            <ImgWithFallback
              src={coverPhoto}
              alt={user.name}
              className="w-full h-full object-cover"
              fallbackAvatar={avatarString}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-7xl"
              style={{ background: gradientStyle }}
            >
              {avatarString || user.name.charAt(0)}
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 45%, transparent 100%)",
            }}
          />

          {/* Top-right controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              data-ocid="profile.toggle"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setEditing((prev) => !prev)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
              style={{
                background: editing
                  ? "linear-gradient(135deg,#7C3AED,#EC4899)"
                  : "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)",
              }}
              data-ocid="profile.edit_button"
            >
              {editing ? <X size={16} /> : <Edit2 size={16} />}
            </button>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="font-display text-2xl font-black text-white leading-tight">
                    {user.name}
                  </h1>
                  {user.isVerified && (
                    <CheckCircle
                      size={18}
                      className="text-blue-400 flex-shrink-0"
                      fill="#3b82f6"
                      color="white"
                    />
                  )}
                  {/* Online dot */}
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: onlineColor }}
                  />
                </div>
                <p className="text-white/80 text-sm">
                  {user.year && `${user.year}`}
                  {user.year && user.major && " · "}
                  {user.major && user.major}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {user.isPro && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                      }}
                    >
                      ⚡ PRO
                    </span>
                  )}
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white/80"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    {user.mode === "dating" ? "💘 Dating" : "🤝 BFF"}
                  </span>
                </div>
              </div>
              {/* Camera upload for main photo */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
                style={{ background: gradientStyle }}
                data-ocid="profile.upload_button"
              >
                <Camera size={16} />
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMainPhotoChange}
            data-ocid="profile.dropzone"
          />
        </div>

        {/* Edit Profile button - full-width below hero */}
        <div className="px-4 -mt-0 mb-0">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setEditing((prev) => !prev)}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg"
            style={{
              background: editing ? "rgba(239,68,68,0.85)" : gradientStyle,
            }}
            data-ocid="profile.primary_button"
          >
            {editing ? (
              <>
                <X size={15} /> Cancel Editing
              </>
            ) : (
              <>
                <Edit2 size={15} /> Edit Profile
              </>
            )}
          </motion.button>
        </div>

        {/* ─ PROFILE COMPLETION ────────────────────────────────────────────── */}
        {completionPct < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 mt-3"
          >
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">
                  Profile Strength
                </span>
                <motion.span
                  key={completionPct}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-black"
                  style={{ color: completionColor }}
                >
                  {completionPct}%
                </motion.span>
              </div>
              <div
                className="w-full h-1.5 rounded-full mb-3"
                style={{ background: "rgba(139,92,246,0.12)" }}
              >
                <motion.div
                  className="h-1.5 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #7C3AED, #EC4899)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              {/* Actionable tips */}
              <div className="space-y-1.5">
                {completionTips.slice(0, 3).map((tip) => (
                  <div key={tip.text} className="flex items-center gap-2">
                    <span className="text-sm">{tip.icon}</span>
                    <span className="text-xs text-muted-foreground">
                      {tip.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─ STATS ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="px-4 mt-3"
        >
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Matches", value: "12" },
              { label: "Likes", value: "47" },
              { label: "Views", value: "134" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl p-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="font-display text-xl font-black text-gradient-violet">
                  {value}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─ PLAN + BOOST ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="px-4 mt-3"
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            data-ocid="profile.card"
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
                style={{ background: gradientStyle }}
                data-ocid="profile.primary_button"
              >
                ✨ Upgrade to Pro
              </button>
            )}
          </div>
          <div className="mt-2">
            <BoostButton />
          </div>
        </motion.div>

        {/* ─ EARN MORE ───────────────────────────────────────────────────── */}
        {!user.isPro && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-4 mt-3"
          >
            <div
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
                className="w-full py-3 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #F97316)",
                  boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
                }}
                data-ocid="profile.primary_button"
              >
                <Play size={16} fill="white" />
                {nextRewardType === "likes"
                  ? "Watch Ad — Earn 2 Likes"
                  : "Watch Ad — Earn 1 Super Like"}
              </button>
            </div>
          </motion.div>
        )}

        {!user.isPro && (
          <div className="px-4 mt-3">
            <AdBanner />
          </div>
        )}

        {/* ─ MY PHOTOS ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="px-4 mt-3"
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-foreground">
                My Photos{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  {photos.length}/6
                </span>
              </h3>
              {editing && photos.length < 6 && (
                <button
                  type="button"
                  onClick={() => addPhotoInputRef.current?.click()}
                  disabled={photoUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ background: gradientStyle }}
                  data-ocid="profile.upload_button"
                >
                  {photoUploading && uploadingLabel === "Uploading photo…" ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Plus size={11} />
                  )}
                  Add
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

            {photos.length === 0 && !editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="w-full py-8 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "rgba(139,92,246,0.05)",
                  border: "2px dashed rgba(139,92,246,0.3)",
                }}
                data-ocid="profile.upload_button"
              >
                <span className="text-2xl">📸</span>
                <span className="text-sm font-bold text-foreground">
                  Add Photos
                </span>
                <span className="text-xs text-muted-foreground">
                  Photos get you 3x more matches
                </span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {/* Show up to 6 slots: filled + empty */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const photo = photos[i];
                  const isCover = (user.coverPhotoIndex ?? 0) === i;
                  if (photo) {
                    return (
                      <motion.div
                        key={photo.url || `photo-slot-${i}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
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
                            onChange={(e) =>
                              handleCaptionChange(i, e.target.value)
                            }
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
                  }
                  // Empty slot
                  return (
                    <motion.button
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length 6-slot grid
                      key={`empty-slot-${i}`}
                      type="button"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() =>
                        editing ? addPhotoInputRef.current?.click() : undefined
                      }
                      className="aspect-[3/4] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "2px dashed rgba(255,255,255,0.1)",
                        cursor: editing ? "pointer" : "default",
                      }}
                      disabled={!editing}
                    >
                      <Plus size={20} className="text-muted-foreground/40" />
                      <span className="text-[10px] text-muted-foreground/40 font-medium">
                        {editing ? "Add Photo" : "Empty"}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}

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
          </div>
        </motion.div>

        {/* ─ PROMPTS ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="px-4 mt-3"
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-foreground">Prompts</h3>
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

            {/* Ghost prompts — shown when empty and not editing */}
            {promptCards.length === 0 && !editing && (
              <div className="space-y-2">
                {GHOST_PROMPTS.map((gp) => (
                  <button
                    key={gp}
                    type="button"
                    onClick={() => {
                      setSelectedPrompt(gp);
                      setShowAddPrompt(true);
                      setEditing(true);
                    }}
                    className="w-full text-left px-4 py-3 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: "rgba(139,92,246,0.06)",
                      border: "1.5px dashed rgba(139,92,246,0.25)",
                    }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: "#7C3AED" }}
                    >
                      Tap to answer
                    </p>
                    <p className="text-sm text-muted-foreground italic">{gp}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Prompt cards */}
            <div className="space-y-2">
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
                    className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
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
                  <div
                    className="rounded-2xl p-4 space-y-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
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
                        className="flex-1 py-2 rounded-xl text-sm font-semibold text-muted-foreground"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
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
        </motion.div>

        {/* ─ ABOUT ME ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="px-4 mt-3"
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-foreground">About Me</h3>
            </div>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                data-ocid="profile.textarea"
              />
            ) : (
              <p className="text-foreground text-sm leading-relaxed">
                {bio || (
                  <span className="text-muted-foreground italic">
                    Tap "Edit Profile" to add a bio...
                  </span>
                )}
              </p>
            )}
          </div>
        </motion.div>

        {/* ─ INTERESTS ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="px-4 mt-3"
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-foreground">Interests</h3>
              {editing && (
                <span className="text-xs text-muted-foreground">
                  {interests.length}/6
                </span>
              )}
            </div>
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
              {!editing && interests.length === 0 && (
                <span className="text-xs text-muted-foreground italic">
                  No interests added yet
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─ SAVE BUTTON (editing mode) ────────────────────────────────── */}
        {editing && (
          <div className="px-4 mt-3">
            <button
              type="button"
              onClick={saveProfile}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
              style={{ background: gradientStyle }}
              data-ocid="profile.save_button"
            >
              💾 Save Changes
            </button>
          </div>
        )}

        {/* ─ AVATAR BUILDER ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 mt-3"
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.08))",
              border: "1.5px solid rgba(139,92,246,0.2)",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl select-none">{avatarString}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Your Avatar
                </p>
                <p className="text-xs text-muted-foreground">
                  Used as fallback when no photo is set
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
              <div className="mt-3">
                <AvatarBuilder value={avatarData} onChange={setAvatarData} />
              </div>
            )}
          </div>
        </motion.div>

        {/* ─ PREVIEW PROFILE ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="px-4 mt-3"
        >
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              color: "white",
            }}
            data-ocid="profile.secondary_button"
          >
            <Eye size={16} />
            Preview Profile
          </button>
        </motion.div>

        {/* ─ SUBSCRIPTION ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="px-4 mt-3 space-y-2"
        >
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
                className="w-full py-3 rounded-2xl font-semibold text-sm text-muted-foreground flex items-center justify-center gap-2 hover:text-foreground transition-colors"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
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
          <button
            type="button"
            onClick={() => {
              setTutorialDone(false);
              navigate({ to: "/" });
            }}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-foreground flex items-center gap-3 hover:bg-white/5 transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            data-ocid="profile.secondary_button"
          >
            <span className="text-base">🎉</span> How it works (replay tutorial)
          </button>
        </motion.div>

        {/* ─ SETTINGS ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="px-4 mt-3 mb-4"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Settings header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <Settings size={14} className="text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Settings
              </span>
            </div>

            {/* Online Status */}
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs font-semibold text-foreground mb-2">
                Online Status
              </p>
              <div className="flex gap-2">
                {(["online", "away", "offline"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setCurrentUserOnlineStatus(status)}
                    className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all"
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

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3.5 border-b border-white/5 hover:bg-white/3 transition-colors"
              data-ocid="profile.toggle"
            >
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon size={16} className="text-muted-foreground" />
                ) : (
                  <Sun size={16} className="text-muted-foreground" />
                )}
                <span className="text-sm text-foreground">
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
              </span>
            </button>

            {/* Help Center */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-white/5 hover:bg-white/3 transition-colors"
              onClick={() => navigate({ to: "/help" })}
              data-ocid="profile.help.link"
            >
              <HelpCircle size={16} className="text-primary" />
              <span className="text-sm text-foreground">Help Center</span>
            </button>

            {/* Admin Panel (conditional) */}
            {(user as any).isAdmin && (
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-white/5 hover:bg-white/3 transition-colors"
                onClick={() => navigate({ to: "/admin" })}
                data-ocid="profile.admin.link"
              >
                <Shield size={16} className="text-primary" />
                <span className="text-sm text-foreground">Admin Panel</span>
              </button>
            )}

            {/* Logout */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-500/5 transition-colors"
              onClick={() => {
                setUser(null);
                navigate({ to: "/" });
              }}
              data-ocid="profile.delete_button"
            >
              <LogOut size={16} className="text-destructive" />
              <span className="text-sm text-destructive font-semibold">
                Log Out
              </span>
            </button>
          </div>
        </motion.div>

        {/* ─ FOOTER ────────────────────────────────────────────────────── */}
        <div className="px-4 pb-6 text-center">
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

      {/* Selfie Verification */}
      <SelfieVerification
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerified={verifyProfile}
      />

      {/* ─ PREVIEW PROFILE MODAL ────────────────────────────────────────── */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent
          className="max-w-xs mx-auto p-0 overflow-hidden rounded-3xl"
          data-ocid="profile.modal"
        >
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle className="text-base font-bold text-foreground">
              Your Profile Preview
            </DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-5 pt-3">
            {/* Swipe card preview */}
            <div
              className="relative w-full rounded-2xl overflow-hidden shadow-xl"
              style={{ aspectRatio: "3/4" }}
            >
              {coverPhoto ? (
                <ImgWithFallback
                  src={coverPhoto}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  fallbackAvatar={avatarString}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-6xl"
                  style={{ background: gradientStyle }}
                >
                  {avatarString || user.name.charAt(0)}
                </div>
              )}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)",
                }}
              />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-display text-xl font-black text-white">
                    {user.name}
                  </h3>
                  {user.isVerified && (
                    <CheckCircle
                      size={16}
                      className="text-blue-400"
                      fill="#3b82f6"
                      color="white"
                    />
                  )}
                </div>
                <p className="text-white/80 text-xs mb-2">
                  {user.year} {user.major && `· ${user.major}`}
                </p>
                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {interests.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{ background: "rgba(255,255,255,0.2)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bio preview */}
            {bio && (
              <p className="mt-3 text-sm text-foreground text-center leading-snug">
                {bio}
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: gradientStyle }}
              data-ocid="profile.close_button"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
