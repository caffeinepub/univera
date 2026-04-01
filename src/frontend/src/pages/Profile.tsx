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
  MoreVertical,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Settings,
  Shield,
  Sparkles,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
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

const PROMPT_EMOJIS: Record<string, string> = {
  "My simple pleasure is...": "☕",
  "Dating me is like...": "💫",
  "Biggest green flag...": "🌱",
  "My love language is...": "💝",
  "I'm looking for...": "🔍",
  "Fun fact about me...": "🎲",
  "My ideal weekend...": "🌅",
  "Currently obsessed with...": "🔥",
};

const PROMPT_COLORS = [
  { border: "#a855f7", glow: "rgba(168,85,247,0.3)" },
  { border: "#ec4899", glow: "rgba(236,72,153,0.3)" },
  { border: "#f97316", glow: "rgba(249,115,22,0.3)" },
];

const STORY_HIGHLIGHTS = [
  { emoji: "✨", label: "Vibes" },
  { emoji: "🏫", label: "Campus" },
  { emoji: "✈️", label: "Travel" },
  { emoji: "🎨", label: "Hobby" },
  { emoji: "🎵", label: "Music" },
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
  const [menuOpen, setMenuOpen] = useState(false);
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

  useEffect(() => {
    if (user?.photos && user.photos.length > 0) {
      setPhotos(user.photos);
    }
  }, [user?.photos]);

  if (!user) return null;

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
        ? "#a855f7"
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

  const coverPhoto =
    photos[user.coverPhotoIndex ?? 0]?.url ?? user.photoUrl ?? null;

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
    <div
      className="app-shell flex flex-col h-[100dvh]"
      style={{ background: "#0a0a0f" }}
    >
      <div className="flex-1 overflow-y-auto">
        {/* ══════════════════════════════════════════════════
            1. IMMERSIVE HEADER
        ══════════════════════════════════════════════════ */}
        <div
          className="relative w-full overflow-hidden"
          style={{ minHeight: 320 }}
        >
          {/* Background cover */}
          <div className="absolute inset-0">
            {coverPhoto ? (
              <ImgWithFallback
                src={coverPhoto}
                alt={user.name}
                className="w-full h-full object-cover"
                fallbackAvatar={avatarString}
                style={{ filter: "brightness(0.55) saturate(1.2)" }}
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(135deg, #1a0533 0%, #2d0a3e 40%, #1a0020 100%)",
                }}
              />
            )}
          </div>

          {/* Animated neon gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(88,28,135,0.5) 0%, rgba(157,23,77,0.35) 40%, rgba(154,52,18,0.2) 70%, rgba(10,10,15,1) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Floating orbs */}
          <motion.div
            className="absolute top-8 left-8 w-24 h-24 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)",
              filter: "blur(12px)",
            }}
            animate={{
              x: [0, 12, -6, 0],
              y: [0, -8, 10, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-16 right-12 w-16 h-16 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)",
              filter: "blur(10px)",
            }}
            animate={{
              x: [0, -10, 6, 0],
              y: [0, 8, -12, 0],
              scale: [1, 0.9, 1.15, 1],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-20 right-6 w-12 h-12 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 70%)",
              filter: "blur(8px)",
            }}
            animate={{ x: [0, 8, -4, 0], y: [0, -6, 8, 0] }}
            transition={{
              duration: 7,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          {/* Top controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
              }}
              data-ocid="profile.toggle"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing((prev) => !prev)}
              className="px-4 py-2 rounded-full text-xs font-bold text-white flex items-center gap-1.5"
              style={{
                background: editing
                  ? "rgba(239,68,68,0.7)"
                  : "rgba(168,85,247,0.25)",
                backdropFilter: "blur(12px)",
                border: editing
                  ? "1px solid rgba(239,68,68,0.5)"
                  : "1px solid rgba(168,85,247,0.5)",
                boxShadow: editing
                  ? "0 0 16px rgba(239,68,68,0.2)"
                  : "0 0 16px rgba(168,85,247,0.25)",
              }}
              data-ocid="profile.edit_button"
            >
              {editing ? (
                <>
                  <X size={13} /> Cancel
                </>
              ) : (
                <>
                  <Edit2 size={13} /> Edit
                </>
              )}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
              }}
              data-ocid="profile.open_modal_button"
            >
              <MoreVertical size={16} />
            </motion.button>
          </div>

          {/* Profile photo + info centered */}
          <div className="relative z-10 flex flex-col items-center pt-14 pb-6 px-4">
            {/* Avatar / profile photo with neon ring */}
            <div className="relative mb-3">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => editing && fileInputRef.current?.click()}
                className="relative w-28 h-28 rounded-full overflow-hidden cursor-pointer"
                style={{
                  boxShadow:
                    "0 0 0 3px #a855f7, 0 0 30px rgba(168,85,247,0.6), 0 0 60px rgba(168,85,247,0.25)",
                }}
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
                    className="w-full h-full flex items-center justify-center text-4xl"
                    style={{
                      background: "linear-gradient(135deg, #2d1b69, #4a1942)",
                    }}
                  >
                    {avatarString || user.name.charAt(0)}
                  </div>
                )}
                {editing && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    <Camera size={22} className="text-white" />
                  </div>
                )}
              </motion.div>
              {/* Online status ring */}
              <div
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
                style={{
                  background: onlineColor,
                  borderColor: "#0a0a0f",
                  boxShadow: `0 0 8px ${onlineColor}`,
                }}
              />
            </div>

            {/* Name + verified */}
            <div className="flex items-center gap-2 mb-1">
              <h1
                className="text-2xl font-black text-white"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                {user.name}
                {user.age ? `, ${user.age}` : ""}
              </h1>
              {user.isVerified && (
                <CheckCircle
                  size={18}
                  className="text-blue-400 flex-shrink-0"
                  fill="#3b82f6"
                  color="white"
                />
              )}
            </div>

            {/* Course / year */}
            {(user.year || user.major) && (
              <p className="text-white/60 text-sm mb-2">
                {user.year && user.year}
                {user.year && user.major && " · "}
                {user.major && user.major}
              </p>
            )}

            {/* Online status pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: onlineColor,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: onlineColor,
                  boxShadow: `0 0 6px ${onlineColor}`,
                }}
              />
              {currentUserOnlineStatus === "online"
                ? "Online now"
                : currentUserOnlineStatus === "away"
                  ? "Away"
                  : "Offline"}
            </div>

            {/* Pro badge */}
            {user.isPro && (
              <div
                className="mt-2 px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                  boxShadow: "0 0 12px rgba(168,85,247,0.4)",
                }}
              >
                ⚡ UNIVÈRA Pro
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMainPhotoChange}
            data-ocid="profile.dropzone"
          />
        </div>

        {/* ══════════════════════════════════════════════════
            2. STORY HIGHLIGHTS
        ══════════════════════════════════════════════════ */}
        <div className="px-4 mt-4">
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {/* Add story CTA */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
              data-ocid="profile.upload_button"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(168,85,247,0.12)",
                  border: "2px dashed rgba(168,85,247,0.5)",
                  boxShadow: "0 0 12px rgba(168,85,247,0.15)",
                }}
              >
                <Plus size={22} style={{ color: "#a855f7" }} />
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Add Story
              </span>
            </motion.button>

            {/* Highlight circles */}
            {STORY_HIGHLIGHTS.map((h, i) => (
              <motion.button
                key={h.label}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                data-ocid={`profile.item.${i + 1}`}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(8px)",
                    border: "2px solid transparent",
                    backgroundClip: "padding-box",
                    boxShadow:
                      i % 3 === 0
                        ? "0 0 0 2px #a855f7, 0 0 12px rgba(168,85,247,0.3)"
                        : i % 3 === 1
                          ? "0 0 0 2px #ec4899, 0 0 12px rgba(236,72,153,0.3)"
                          : "0 0 0 2px #f97316, 0 0 12px rgba(249,115,22,0.3)",
                  }}
                >
                  {h.emoji}
                </div>
                <span className="text-[10px] font-semibold text-white/50">
                  {h.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            3. ANIMATED FLOATING STATS PILLS
        ══════════════════════════════════════════════════ */}
        <div className="px-4 mt-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              {
                icon: "✨",
                label: `${completionPct}% Complete`,
                glow: "rgba(168,85,247,0.35)",
                border: "rgba(168,85,247,0.4)",
                progress: true,
                pct: completionPct,
                color: completionColor,
              },
              {
                icon: "📸",
                label: `${photos.length} Photos`,
                glow: "rgba(236,72,153,0.35)",
                border: "rgba(236,72,153,0.4)",
              },
              {
                icon: "💫",
                label:
                  planType === "free"
                    ? "Free Plan"
                    : planType === "monthly"
                      ? "Pro Monthly"
                      : "Pro Yearly",
                glow: "rgba(249,115,22,0.35)",
                border: "rgba(249,115,22,0.4)",
              },
              {
                icon: "⭐",
                label:
                  superLikesRemaining === 999
                    ? "∞ Super Likes"
                    : `${superLikesRemaining} Super Likes`,
                glow: "rgba(168,85,247,0.35)",
                border: "rgba(168,85,247,0.4)",
              },
            ].map((pill, i) => (
              <motion.div
                key={pill.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(16px)",
                  border: `1px solid ${pill.border}`,
                  boxShadow: `0 0 16px ${pill.glow}, inset 0 0 8px rgba(255,255,255,0.02)`,
                }}
              >
                <span className="text-sm">{pill.icon}</span>
                <span className="text-xs font-bold text-white/90 whitespace-nowrap">
                  {pill.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            4. PROMPTS — PERSONALITY FIRST
        ══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-black"
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              My Vibe ✨
            </h2>
            {editing && promptCards.length < 5 && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddPrompt(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white"
                style={{
                  background: gradientStyle,
                  boxShadow: "0 0 12px rgba(168,85,247,0.35)",
                }}
              >
                <Plus size={12} /> Add Prompt
              </motion.button>
            )}
          </div>

          <div className="space-y-3">
            {/* Ghost prompts */}
            {promptCards.length === 0 &&
              !editing &&
              GHOST_PROMPTS.map((gp, i) => (
                <motion.button
                  key={gp}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => {
                    setSelectedPrompt(gp);
                    setShowAddPrompt(true);
                    setEditing(true);
                  }}
                  className="w-full text-left px-4 py-4 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1.5px dashed ${PROMPT_COLORS[i % 3].border}`,
                    boxShadow: `0 0 16px ${PROMPT_COLORS[i % 3].glow}`,
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                    style={{ color: PROMPT_COLORS[i % 3].border }}
                  >
                    ✦ Tap to answer
                  </p>
                  <p className="text-sm text-white/50 italic">{gp}</p>
                </motion.button>
              ))}

            {/* Filled prompt cards */}
            {promptCards.map((card, idx) => (
              <motion.div
                // biome-ignore lint/suspicious/noArrayIndexKey: prompt cards are user-ordered
                key={`prompt-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="relative rounded-2xl p-4 overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(16px)",
                  borderLeft: `3px solid ${PROMPT_COLORS[idx % 3].border}`,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: `4px 0 0 0 ${PROMPT_COLORS[idx % 3].border}, 0 0 24px ${PROMPT_COLORS[idx % 3].glow}`,
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: PROMPT_COLORS[idx % 3].border }}
                >
                  {PROMPT_EMOJIS[card.prompt] ?? "💬"} {card.prompt}
                </p>
                <p className="text-white text-base font-semibold leading-snug">
                  {card.answer}
                </p>
                {editing && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removePromptCard(idx)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <X size={11} className="text-white/60" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Add prompt form */}
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
                    background: "rgba(168,85,247,0.06)",
                    border: "1px solid rgba(168,85,247,0.2)",
                  }}
                >
                  <p className="text-sm font-bold text-white">
                    Choose a prompt
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_PROMPTS.filter(
                      (p) => !promptCards.some((c) => c.prompt === p),
                    ).map((p) => (
                      <motion.button
                        key={p}
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelectedPrompt(p)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                          background:
                            selectedPrompt === p
                              ? gradientStyle
                              : "rgba(168,85,247,0.08)",
                          border:
                            selectedPrompt === p
                              ? "none"
                              : "1px solid rgba(168,85,247,0.25)",
                          color:
                            selectedPrompt === p
                              ? "white"
                              : "rgba(255,255,255,0.6)",
                          boxShadow:
                            selectedPrompt === p
                              ? "0 0 12px rgba(168,85,247,0.4)"
                              : "none",
                        }}
                      >
                        {p}
                      </motion.button>
                    ))}
                  </div>
                  {selectedPrompt && (
                    <textarea
                      value={promptAnswer}
                      onChange={(e) => setPromptAnswer(e.target.value)}
                      placeholder="Your answer..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 resize-none"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(168,85,247,0.3)",
                      }}
                      data-ocid="profile.textarea"
                    />
                  )}
                  <div className="flex gap-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={addPromptCard}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{
                        background: gradientStyle,
                        boxShadow: "0 0 12px rgba(168,85,247,0.3)",
                      }}
                    >
                      Add ✦
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowAddPrompt(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            5. ABOUT + INTERESTS
        ══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="px-4 mt-5"
        >
          <h2
            className="text-lg font-black mb-3"
            style={{
              background: "linear-gradient(135deg, #ec4899, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            About Me 🌸
          </h2>

          {/* Bio */}
          <div
            className="rounded-2xl p-4 mb-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(16px)",
            }}
          >
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 resize-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(236,72,153,0.3)",
                }}
                data-ocid="profile.textarea"
              />
            ) : (
              <p className="text-white/80 text-sm leading-relaxed">
                {bio || (
                  <span className="text-white/30 italic">
                    Tap Edit to add a bio...
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Interests */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white/70">Interests</span>
              {editing && (
                <span className="text-xs text-white/40">
                  {interests.length}/6
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(editing ? ALL_INTERESTS : interests).map((tag) => (
                <motion.button
                  type="button"
                  key={tag}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => editing && toggleInterest(tag)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: interests.includes(tag)
                      ? "rgba(168,85,247,0.2)"
                      : "rgba(255,255,255,0.04)",
                    border: interests.includes(tag)
                      ? "1px solid rgba(168,85,247,0.6)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: interests.includes(tag)
                      ? "#d8b4fe"
                      : "rgba(255,255,255,0.4)",
                    boxShadow: interests.includes(tag)
                      ? "0 0 12px rgba(168,85,247,0.3)"
                      : "none",
                    cursor: editing ? "pointer" : "default",
                  }}
                  data-ocid={`profile.item.${ALL_INTERESTS.indexOf(tag) + 1}`}
                >
                  {tag}
                </motion.button>
              ))}
              {!editing && interests.length === 0 && (
                <span className="text-xs text-white/30 italic">
                  No interests added yet
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            6. PHOTOS GRID
        ══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="px-4 mt-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-black"
              style={{
                background: "linear-gradient(135deg, #a855f7, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Photos 📸
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(168,85,247,0.12)",
                  border: "1px solid rgba(168,85,247,0.3)",
                  color: "#c084fc",
                }}
              >
                {photos.length}/6
              </span>
              {editing && photos.length < 6 && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addPhotoInputRef.current?.click()}
                  disabled={photoUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{
                    background: gradientStyle,
                    boxShadow: "0 0 10px rgba(168,85,247,0.3)",
                  }}
                  data-ocid="profile.upload_button"
                >
                  {photoUploading && uploadingLabel === "Uploading photo…" ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Plus size={11} />
                  )}
                  Add
                </motion.button>
              )}
            </div>
          </div>

          {/* Upload progress */}
          {photoUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
              style={{
                background: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.25)",
              }}
              data-ocid="profile.loading_state"
            >
              <Loader2
                size={13}
                className="animate-spin"
                style={{ color: "#a855f7" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "#a855f7" }}
              >
                {uploadingLabel}
              </span>
            </motion.div>
          )}

          {/* 2x3 grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => {
              const photo = photos[i];
              const isCover = (user.coverPhotoIndex ?? 0) === i;

              if (photo) {
                return (
                  <motion.div
                    key={photo.url || `photo-slot-${i}`}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative flex flex-col gap-1.5 group"
                    data-ocid={`profile.item.${i + 1}`}
                  >
                    <div
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden"
                      style={{
                        boxShadow: isCover
                          ? "0 0 0 2px #a855f7, 0 0 16px rgba(168,85,247,0.35)"
                          : "none",
                      }}
                    >
                      <ImgWithFallback
                        src={photo.url}
                        alt="Profile photo"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fallbackAvatar={avatarString}
                      />
                      {/* Hover overlay */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                        }}
                      >
                        {photo.caption && (
                          <p className="text-white text-[10px] font-medium leading-tight mb-1 line-clamp-2">
                            {photo.caption}
                          </p>
                        )}
                      </div>

                      {isCover && (
                        <div
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                          style={{ background: "rgba(168,85,247,0.85)" }}
                        >
                          Cover
                        </div>
                      )}

                      {editing && (
                        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                          {photos.length > 3 && (
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeletePhoto(i)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                              style={{ background: "rgba(0,0,0,0.65)" }}
                              data-ocid={`profile.delete_button.${i + 1}`}
                            >
                              <X size={11} />
                            </motion.button>
                          )}
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setReplaceSlot(i);
                              replaceInputRef.current?.click();
                            }}
                            disabled={photoUploading}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                            style={{ background: "rgba(0,0,0,0.65)" }}
                            data-ocid={`profile.edit_button.${i + 1}`}
                          >
                            <RefreshCw size={11} />
                          </motion.button>
                        </div>
                      )}

                      {editing && !isCover && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSetCover(i)}
                          className="absolute bottom-2 left-2 right-2 py-1 rounded-lg text-[10px] font-bold text-white"
                          style={{
                            background: "rgba(0,0,0,0.6)",
                            backdropFilter: "blur(4px)",
                          }}
                          data-ocid={`profile.save_button.${i + 1}`}
                        >
                          ⭐ Set as Cover
                        </motion.button>
                      )}
                    </div>

                    {editing ? (
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => handleCaptionChange(i, e.target.value)}
                        placeholder="Add a caption..."
                        maxLength={60}
                        className="w-full px-2 py-1 rounded-lg text-xs text-white placeholder:text-white/25 focus:outline-none focus:ring-1"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(168,85,247,0.25)",
                        }}
                        data-ocid="profile.input"
                      />
                    ) : (
                      photo.caption && (
                        <span
                          className="px-2 py-1 rounded-lg text-[10px] font-medium text-white/70 truncate"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        >
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
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={editing ? { scale: 1.03 } : {}}
                  whileTap={editing ? { scale: 0.97 } : {}}
                  onClick={() =>
                    editing ? addPhotoInputRef.current?.click() : undefined
                  }
                  className="aspect-[3/4] rounded-2xl flex flex-col items-center justify-center gap-2"
                  style={{
                    background: "rgba(255,255,255,0.015)",
                    border: "1.5px dashed rgba(168,85,247,0.25)",
                    cursor: editing ? "pointer" : "default",
                    boxShadow: editing
                      ? "0 0 12px rgba(168,85,247,0.1)"
                      : "none",
                  }}
                  disabled={!editing}
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    <Camera
                      size={22}
                      style={{
                        color: editing
                          ? "rgba(168,85,247,0.6)"
                          : "rgba(255,255,255,0.12)",
                      }}
                    />
                  </motion.div>
                  <span
                    className="text-[10px] font-semibold"
                    style={{
                      color: editing
                        ? "rgba(168,85,247,0.7)"
                        : "rgba(255,255,255,0.15)",
                    }}
                  >
                    {editing ? "Add Photo" : "Empty"}
                  </span>
                </motion.button>
              );
            })}
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
        </motion.div>

        {/* ── Avatar builder ─ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="px-4 mt-4"
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(168,85,247,0.06), rgba(236,72,153,0.06))",
              border: "1px solid rgba(168,85,247,0.2)",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl select-none">{avatarString}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Your Avatar</p>
                <p className="text-xs text-white/40">
                  Used as fallback when no photo is set
                </p>
              </div>
              {editing && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAvatarBuilder((p) => !p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                  style={{ background: gradientStyle }}
                  data-ocid="profile.avatar.button"
                >
                  {showAvatarBuilder ? "Done" : "Customize"}
                </motion.button>
              )}
            </div>
            {showAvatarBuilder && editing && avatarData && (
              <div className="mt-3">
                <AvatarBuilder value={avatarData} onChange={setAvatarData} />
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Profile completion ─ */}
        {completionPct < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 mt-4"
          >
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white/60">
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
                className="w-full h-1.5 rounded-full"
                style={{ background: "rgba(168,85,247,0.1)" }}
              >
                <motion.div
                  className="h-1.5 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #a855f7, #ec4899)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <div className="space-y-1.5 mt-3">
                {completionTips.slice(0, 3).map((tip) => (
                  <div key={tip.text} className="flex items-center gap-2">
                    <span className="text-sm">{tip.icon}</span>
                    <span className="text-xs text-white/40">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Save button ─ */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="px-4 mt-4"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveProfile}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                style={{
                  background: gradientStyle,
                  boxShadow: "0 0 24px rgba(168,85,247,0.35)",
                }}
                data-ocid="profile.save_button"
              >
                <Sparkles size={15} /> Save Changes
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Preview button ─ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 mt-3"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowPreviewModal(true)}
            className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            data-ocid="profile.secondary_button"
          >
            <Eye size={15} /> Preview Profile
          </motion.button>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            7. MONETIZATION (last)
        ══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="px-4 mt-5 space-y-3"
        >
          {/* Plan + super likes */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            data-ocid="profile.card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">Your Plan</span>
              {planType === "free" ? (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  FREE
                </span>
              ) : planType === "monthly" ? (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                  style={{
                    background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                    boxShadow: "0 0 12px rgba(168,85,247,0.3)",
                  }}
                >
                  PRO MONTHLY
                </span>
              ) : (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#f97316)",
                    boxShadow: "0 0 12px rgba(249,115,22,0.3)",
                  }}
                >
                  PRO YEARLY ⭐
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>⭐ Super Likes remaining</span>
              <span className="font-bold text-white">
                {superLikesRemaining === 999
                  ? "Unlimited"
                  : superLikesRemaining}
              </span>
            </div>
            {nextSuperLikeResetIn > 0 && planType !== "yearly" && (
              <div className="text-[10px] text-white/30 mt-0.5">
                Resets in {Math.floor(nextSuperLikeResetIn / 3_600_000)}h{" "}
                {Math.floor((nextSuperLikeResetIn % 3_600_000) / 60_000)}m
              </div>
            )}
            {planType === "free" && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowUpgradeModal(true);
                  setUpgradeReason("Unlock Pro features");
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white mt-3"
                style={{
                  background: gradientStyle,
                  boxShadow: "0 0 16px rgba(168,85,247,0.3)",
                }}
                data-ocid="profile.primary_button"
              >
                ✨ Upgrade to Pro
              </motion.button>
            )}
          </div>

          <div>
            <BoostButton />
          </div>

          {/* Earn more (free users) */}
          {!user.isPro && (
            <div
              className="rounded-2xl p-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.08))",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">🌟 Earn More</h3>
                  <p className="text-xs text-white/40 mt-0.5">
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
                  <div className="text-xs text-white/40">ads watched</div>
                </div>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowRewardedAd(true)}
                className="w-full py-3 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2"
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
              </motion.button>
            </div>
          )}

          {!user.isPro && (
            <div>
              <AdBanner />
            </div>
          )}

          {/* Upgrade CTA */}
          {!user.isPro ? (
            <div
              className="rounded-2xl p-5 text-center relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))",
                border: "1px solid rgba(168,85,247,0.25)",
                boxShadow: "0 0 32px rgba(168,85,247,0.1)",
              }}
            >
              <div className="text-3xl mb-2">👑</div>
              <h3 className="font-black text-white text-base mb-1">
                Unlock the Full Experience
              </h3>
              <p className="text-xs text-white/50 mb-4">
                AI matching, unlimited swipes, boosts &amp; more
              </p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowUpgradeModal(true)}
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: gradientStyle,
                  boxShadow: "0 0 24px rgba(168,85,247,0.4)",
                }}
                data-ocid="profile.primary_button"
              >
                <Zap size={18} /> Upgrade to Pro
              </motion.button>
              <button
                type="button"
                onClick={() => navigate({ to: "/subscription" })}
                className="w-full py-2.5 mt-2 rounded-xl text-xs font-semibold text-white/50 flex items-center justify-center gap-1.5"
                data-ocid="profile.secondary_button"
              >
                <Star size={13} /> View Plans &amp; Pricing
              </button>
            </div>
          ) : (
            <div
              className="w-full py-3 rounded-2xl text-center text-sm font-bold"
              style={{
                background: "rgba(234,179,8,0.1)",
                border: "1px solid rgba(234,179,8,0.25)",
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
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white/50 flex items-center gap-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            data-ocid="profile.secondary_button"
          >
            <span className="text-base">🎉</span> Replay tutorial
          </button>
        </motion.div>

        {/* ══════════════════════════════════════════════════
            8. SETTINGS
        ══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="px-4 mt-5 mb-4"
        >
          <h2
            className="text-sm font-bold mb-3 uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Settings
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Online status */}
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <p className="text-xs font-semibold text-white/50 mb-2">
                Online Status
              </p>
              <div className="flex gap-2">
                {(["online", "away", "offline"] as const).map((status) => (
                  <motion.button
                    key={status}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentUserOnlineStatus(status)}
                    className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold"
                    style={{
                      background:
                        currentUserOnlineStatus === status
                          ? status === "online"
                            ? "rgba(34,197,94,0.15)"
                            : status === "away"
                              ? "rgba(245,158,11,0.15)"
                              : "rgba(107,114,128,0.15)"
                          : "rgba(255,255,255,0.03)",
                      border:
                        currentUserOnlineStatus === status
                          ? status === "online"
                            ? "1px solid rgba(34,197,94,0.4)"
                            : status === "away"
                              ? "1px solid rgba(245,158,11,0.4)"
                              : "1px solid rgba(107,114,128,0.4)"
                          : "1px solid rgba(255,255,255,0.06)",
                      color:
                        currentUserOnlineStatus === status
                          ? status === "online"
                            ? "#4ade80"
                            : status === "away"
                              ? "#f59e0b"
                              : "#9ca3af"
                          : "rgba(255,255,255,0.35)",
                    }}
                    data-ocid={`profile.online_${status}.toggle`}
                  >
                    {status === "online"
                      ? "🟢 Online"
                      : status === "away"
                        ? "🟡 Away"
                        : "⬤ Offline"}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Theme toggle */}
            <motion.button
              type="button"
              whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              whileTap={{ scale: 0.99 }}
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3.5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
              data-ocid="profile.toggle"
            >
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
                ) : (
                  <Sun size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
                )}
                <span className="text-sm text-white">
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </span>
              </div>
              <span className="text-xs text-white/30">
                {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
              </span>
            </motion.button>

            {/* Help Center */}
            <motion.button
              type="button"
              whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
              onClick={() => navigate({ to: "/help" })}
              data-ocid="profile.help.link"
            >
              <HelpCircle size={16} style={{ color: "#a855f7" }} />
              <span className="text-sm text-white">Help Center</span>
            </motion.button>

            {/* Admin (conditional) */}
            {(user as any).isAdmin && (
              <motion.button
                type="button"
                whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
                onClick={() => navigate({ to: "/admin" })}
                data-ocid="profile.admin.link"
              >
                <Shield size={16} style={{ color: "#a855f7" }} />
                <span className="text-sm text-white">Admin Panel</span>
              </motion.button>
            )}

            {/* Logout */}
            <motion.button
              type="button"
              whileHover={{ backgroundColor: "rgba(239,68,68,0.05)" }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center gap-3 px-4 py-3.5"
              onClick={() => {
                setUser(null);
                navigate({ to: "/" });
              }}
              data-ocid="profile.delete_button"
            >
              <LogOut size={16} className="text-red-400" />
              <span className="text-sm font-semibold text-red-400">
                Log Out
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="px-4 pb-6 text-center">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="hover:underline"
              style={{ color: "#a855f7" }}
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

      {/* 3-dot Bottom Sheet Menu */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-0 px-0 pb-safe"
          style={{ background: "#0a0a0f", maxHeight: "60vh" }}
        >
          <SheetHeader className="px-6 pb-4">
            <SheetTitle className="text-white text-base font-bold">
              Menu
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col px-4 gap-1">
            {/* Edit Profile */}
            <button
              type="button"
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all text-left"
              style={{ background: "rgba(255,255,255,0.04)" }}
              onClick={() => {
                setEditing(true);
                setMenuOpen(false);
              }}
              data-ocid="profile.menu.edit_button"
            >
              <Edit2 size={18} style={{ color: "#a855f7" }} />
              <span className="flex-1 text-sm font-medium text-white">
                Edit Profile
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 18 }}>
                ›
              </span>
            </button>
            {/* Subscription */}
            <button
              type="button"
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all text-left"
              style={{ background: "rgba(255,255,255,0.04)" }}
              onClick={() => {
                navigate({ to: "/subscription" });
                setMenuOpen(false);
              }}
              data-ocid="profile.menu.subscription_button"
            >
              <Sparkles size={18} style={{ color: "#f97316" }} />
              <span className="flex-1 text-sm font-medium text-white">
                Subscription
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 18 }}>
                ›
              </span>
            </button>
            {/* Dark / Light Mode */}
            <button
              type="button"
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all text-left"
              style={{ background: "rgba(255,255,255,0.04)" }}
              onClick={() => {
                toggleTheme();
                setMenuOpen(false);
              }}
              data-ocid="profile.menu.toggle"
            >
              {theme === "dark" ? (
                <Moon size={18} style={{ color: "#818cf8" }} />
              ) : (
                <Sun size={18} style={{ color: "#f59e0b" }} />
              )}
              <span className="flex-1 text-sm font-medium text-white">
                {theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 18 }}>
                ›
              </span>
            </button>
            {/* Help Center */}
            <button
              type="button"
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all text-left"
              style={{ background: "rgba(255,255,255,0.04)" }}
              onClick={() => {
                navigate({ to: "/help" });
                setMenuOpen(false);
              }}
              data-ocid="profile.menu.help_button"
            >
              <HelpCircle size={18} style={{ color: "#22d3ee" }} />
              <span className="flex-1 text-sm font-medium text-white">
                Help Center
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 18 }}>
                ›
              </span>
            </button>
            {/* Logout */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                marginTop: 4,
                paddingTop: 4,
              }}
            >
              <button
                type="button"
                className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all text-left"
                style={{ background: "rgba(239,68,68,0.06)" }}
                onClick={() => {
                  setUser(null);
                  navigate({ to: "/" });
                  setMenuOpen(false);
                }}
                data-ocid="profile.menu.logout_button"
              >
                <LogOut size={18} style={{ color: "#f87171" }} />
                <span
                  className="flex-1 text-sm font-medium"
                  style={{ color: "#f87171" }}
                >
                  Logout
                </span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onReward={handleReward}
        rewardType={nextRewardType}
      />

      <SelfieVerification
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerified={verifyProfile}
      />

      {/* Preview Modal */}
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
                        style={{ background: "rgba(168,85,247,0.4)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {bio && (
              <p className="mt-3 text-sm text-foreground text-center leading-snug">
                {bio}
              </p>
            )}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPreviewModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: gradientStyle }}
              data-ocid="profile.close_button"
            >
              Done
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
