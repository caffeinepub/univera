import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronLeft,
  MoreVertical,
  Send,
  Smile,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../backend.d";
import { EmojiStickerPicker } from "../components/EmojiStickerPicker";
import { ImgWithFallback } from "../components/ImgWithFallback";
import { ReportModal } from "../components/ReportModal";
import { ScreenshotDetector } from "../components/ScreenshotDetector";
import { useApp } from "../context/AppContext";
import {
  ICEBREAKERS,
  MESSAGES,
  type Message,
  PROFILES,
} from "../data/mockData";
import { useActor } from "../hooks/useActor";
import { useChatPolling } from "../hooks/useChatPolling";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const AI_POOLS = {
  hobbies: [
    "Okay but what's your go-to hobby when you're procrastinating? 😅",
    "Are you more of a gym rat or a Netflix-and-chill type?",
    "What would your ideal weekend look like?",
  ],
  start: [
    "Hey! Your profile caught my eye 👀",
    "Okay I have to ask — what's the story behind your first photo?",
    "Hi! I feel like we'd have the best campus convos tbh",
  ],
  flirty: [
    "Not to be weird but your smile in that photo?? 😭🔥",
    "Okay your vibe is immaculate honestly",
    "I was going to play it cool but honestly you're too cute for that",
  ],
  funny: [
    "I'm legally required to ask: pineapple on pizza, yes or no?",
    "Okay real talk: morning person or total disaster before 10am?",
    "Your personality test results and mine are basically the same person 💀",
  ],
};

const AI_QUICK_ACTIONS = [
  { label: "Ask about hobbies 🎮", pool: "hobbies" as const },
  { label: "Start conversation 💬", pool: "start" as const },
  { label: "Flirty reply 😏", pool: "flirty" as const },
  { label: "Funny reply 😂", pool: "funny" as const },
];

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0h 0m";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function formatMsgTime(nanoseconds: bigint): string {
  return new Date(Number(nanoseconds / 1_000_000n)).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function convertBackendMsg(m: ChatMessage, myPrincipalStr: string): Message {
  return {
    id: m.msgId,
    matchId: m.matchId,
    senderId:
      m.senderUserId.toString() === myPrincipalStr
        ? "me"
        : m.senderUserId.toString(),
    text: m.text,
    timestamp: formatMsgTime(m.sentAt),
  };
}

const CHAT_THEMES: Record<
  string,
  { bg: string; bubble: string; accent: string; label: string; color: string }
> = {
  default: {
    bg: "",
    bubble: "",
    accent: "",
    label: "Default",
    color: "#7C3AED",
  },
  pink: {
    bg: "bg-gradient-to-b from-pink-50 to-rose-100 dark:from-pink-950 dark:to-rose-900",
    bubble: "bg-pink-200 dark:bg-pink-800",
    accent: "text-pink-600",
    label: "Pink",
    color: "#EC4899",
  },
  purple: {
    bg: "bg-gradient-to-b from-purple-900 to-indigo-900",
    bubble: "bg-purple-600",
    accent: "text-purple-300",
    label: "Purple Neon",
    color: "#8B5CF6",
  },
  yellow: {
    bg: "bg-gradient-to-b from-yellow-50 to-amber-100 dark:from-yellow-950 dark:to-amber-900",
    bubble: "bg-yellow-200 dark:bg-yellow-700",
    accent: "text-yellow-600",
    label: "BFF Yellow",
    color: "#F59E0B",
  },
  blue: {
    bg: "bg-gradient-to-b from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900",
    bubble: "bg-blue-200 dark:bg-blue-800",
    accent: "text-blue-600",
    label: "Blue Minimal",
    color: "#3B82F6",
  },
};

export function Chat() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const {
    matches,
    planType,
    user,
    blockUser,
    removeMatch,
    deleteChat,
    matchCreatedTimes,
    chatThemes,
    setChatTheme,
    avatarString,
    loadChatMessages,
    sendChatMessage,
  } = useApp();

  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  const match = matches.find((m) => m.id === id) ?? matches[0];
  const profile =
    PROFILES.find((p) => p.id === match?.profileId) ?? PROFILES[2];

  // Determine if this is a demo chat (use mock messages) or real (use backend)
  const isDemo = profile.isDemo ?? true;

  // ─── Message state ─────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>(() =>
    isDemo ? (MESSAGES[match?.id ?? "m1"] ?? MESSAGES.m1) : [],
  );
  const [messagesLoaded, setMessagesLoaded] = useState(isDemo);
  const [lastTimestamp, setLastTimestamp] = useState<bigint>(0n);

  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // ─── "New chat system activated" banner (shows once on first chat open) ───
  const [showActivatedBanner, setShowActivatedBanner] = useState(() => {
    const activated = localStorage.getItem("univera_chat_backend_activated");
    if (!activated) {
      localStorage.setItem("univera_chat_backend_activated", "1");
      return true;
    }
    return false;
  });

  // Female-first messaging
  const [firstMessageSentLocal, setFirstMessageSentLocal] = useState(false);
  const firstMessageSent = false;
  const isMaleWaiting =
    user?.gender === "male" && !firstMessageSent && !firstMessageSentLocal;

  // 24-hour countdown
  const createdTime =
    matchCreatedTimes[match?.id ?? ""] ?? Date.now() - 2 * 60 * 60 * 1000;
  const [countdown, setCountdown] = useState(
    () => createdTime + 24 * 60 * 60 * 1000 - Date.now(),
  );
  const matchExpired =
    !firstMessageSent && !firstMessageSentLocal && countdown <= 0;

  useEffect(() => {
    if (firstMessageSent || firstMessageSentLocal) return;
    const t = setInterval(() => {
      setCountdown(createdTime + 24 * 60 * 60 * 1000 - Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [createdTime, firstMessageSentLocal]);

  // ─── Load messages from backend on mount (real profiles only) ───────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only run on matchId change
  useEffect(() => {
    if (isDemo || !match) return;
    // Capture load time BEFORE the async call so polling starts from this point
    const loadTime = BigInt(Date.now()) * 1_000_000n;
    loadChatMessages(match.id)
      .then((msgs) => {
        setMessages(msgs);
        setLastTimestamp(loadTime);
        setMessagesLoaded(true);
      })
      .catch(() => {
        setLastTimestamp(loadTime);
        setMessagesLoaded(true);
      });
  }, [isDemo, match?.id]);

  // ─── Polling for new messages (real profiles only) ────────────────────────
  const { newMessages, resetPolling } = useChatPolling({
    actor,
    matchId: match?.id ?? "",
    isDemo,
    enabled: messagesLoaded && !isDemo,
    afterTimestamp: lastTimestamp,
  });

  // Append polled messages to state, deduplicating by id
  // biome-ignore lint/correctness/useExhaustiveDependencies: resetPolling is stable
  useEffect(() => {
    if (newMessages.length === 0) return;
    const myPrincipalStr = identity?.getPrincipal().toString() ?? "";
    const converted = newMessages.map((m) =>
      convertBackendMsg(m, myPrincipalStr),
    );
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const toAdd = converted.filter((m) => !existingIds.has(m.id));
      if (toAdd.length === 0) return prev;
      return [...prev, ...toAdd];
    });
    resetPolling();
  }, [newMessages]);

  // Menu state
  const [reportOpen, setReportOpen] = useState(false);
  const [blockAlertOpen, setBlockAlertOpen] = useState(false);
  const [removeMatchAlertOpen, setRemoveMatchAlertOpen] = useState(false);
  const [deleteChatAlertOpen, setDeleteChatAlertOpen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const activeThemeId = chatThemes[id ?? match?.id ?? ""] ?? "default";
  const activeTheme = CHAT_THEMES[activeThemeId] ?? CHAT_THEMES.default;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Send function ──────────────────────────────────────────────────────
  const send = async (text: string) => {
    if (!text.trim()) return;
    if (isMaleWaiting || matchExpired) return;

    if (isDemo) {
      // ─── Demo profile: local state + simulated auto-reply ───
      const msg: Message = {
        id: String(Date.now()),
        matchId: match?.id ?? "m1",
        senderId: "me",
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((p) => [...p, msg]);
      setInput("");
      if (user?.gender === "female" && !firstMessageSentLocal) {
        setFirstMessageSentLocal(true);
      }
      setTimeout(() => {
        const replies = [
          "That's so cool! 😊",
          "Haha yes exactly!",
          "We should definitely hang out!",
          "Tell me more about that 👀",
          "Same here honestly 😂",
        ];
        const reply: Message = {
          id: String(Date.now() + 1),
          matchId: match?.id ?? "m1",
          senderId: profile.id,
          text: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((p) => [...p, reply]);
      }, 1200);
    } else {
      // ─── Real profile: optimistic update + backend persist ───
      // Generate a deterministic msgId used for both optimistic UI and backend
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const optimisticMsg: Message = {
        id: msgId,
        matchId: match?.id ?? "",
        senderId: "me",
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((p) => [...p, optimisticMsg]);
      setInput("");

      const success = await sendChatMessage(
        match?.id ?? "",
        text.trim(),
        msgId,
      );
      if (success) {
        if (user?.gender === "female" && !firstMessageSentLocal) {
          setFirstMessageSentLocal(true);
        }
      } else {
        // Remove failed optimistic message
        setMessages((p) => p.filter((m) => m.id !== msgId));
      }
    }
  };

  const pickFromPool = (pool: keyof typeof AI_POOLS) => {
    const arr = AI_POOLS[pool];
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const handleQuickAction = (pool: keyof typeof AI_POOLS) => {
    setAiLoading(true);
    setTimeout(() => {
      setInput(pickFromPool(pool));
      setAiLoading(false);
    }, 400);
  };

  const handleAiInputSubmit = () => {
    if (!aiInput.trim()) return;
    const lower = aiInput.toLowerCase();
    let pool: keyof typeof AI_POOLS = "start";
    if (
      lower.includes("hobb") ||
      lower.includes("interest") ||
      lower.includes("game")
    )
      pool = "hobbies";
    else if (
      lower.includes("flirt") ||
      lower.includes("cute") ||
      lower.includes("like")
    )
      pool = "flirty";
    else if (
      lower.includes("funny") ||
      lower.includes("joke") ||
      lower.includes("laugh")
    )
      pool = "funny";
    setAiLoading(true);
    setTimeout(() => {
      setInput(pickFromPool(pool));
      setAiInput("");
      setAiLoading(false);
    }, 500);
  };

  const handleBlock = () => {
    blockUser(profile.id);
    navigate({ to: "/matches" });
  };

  const handleRemoveMatch = () => {
    if (match) removeMatch(match.id);
    navigate({ to: "/matches" });
  };

  const handleDeleteChat = () => {
    if (match) deleteChat(match.id);
    navigate({ to: "/matches" });
  };

  const inputDisabled = isMaleWaiting || matchExpired;

  // Index of last "me" message
  const lastMeIndex = messages.reduce(
    (last, msg, i) => (msg.senderId === "me" ? i : last),
    -1,
  );

  return (
    <div className="app-shell bg-app flex flex-col h-[100dvh]">
      {/* Header */}
      <header className="glass-dark px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => navigate({ to: "/matches" })}
          className="text-muted-foreground hover:text-foreground"
          data-ocid="chat.cancel_button"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="relative w-10 h-10 flex-shrink-0">
          <ImgWithFallback
            src={profile.photo}
            alt={profile.name}
            className="w-10 h-10 rounded-full object-cover neon-border-violet"
            fallbackAvatar={avatarString}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm">
              {profile.name}, {profile.age}
            </span>
            {planType !== "free" && (
              <span
                className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{
                  background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                }}
              >
                <Zap size={8} fill="white" /> Priority
              </span>
            )}
          </div>
          <div className="text-xs text-green-400">
            {profile.online ? "Online Now" : "Active recently"}
          </div>
        </div>
        <div className="text-xs text-primary font-bold">
          {profile.compatibility}% match
        </div>

        {/* 3-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground p-1"
              data-ocid="chat.dropdown_menu"
            >
              <MoreVertical size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-2xl border-border/50"
            style={{ background: "#1a1030", minWidth: "180px" }}
          >
            <DropdownMenuItem
              onClick={() => setReportOpen(true)}
              className="text-sm py-2.5 cursor-pointer"
              data-ocid="chat.report.button"
            >
              📋 Report {profile.name}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setBlockAlertOpen(true)}
              className="text-sm py-2.5 cursor-pointer text-red-400"
              data-ocid="chat.block.button"
            >
              🚫 Block {profile.name}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setRemoveMatchAlertOpen(true)}
              className="text-sm py-2.5 cursor-pointer text-red-400"
              data-ocid="chat.remove_match.button"
            >
              💔 Remove Match
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowThemePicker((p) => !p)}
              className="text-sm py-2.5 cursor-pointer"
              data-ocid="chat.toggle"
            >
              🎨 Change Theme
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteChatAlertOpen(true)}
              className="text-sm py-2.5 cursor-pointer"
              data-ocid="chat.delete_chat.button"
            >
              🗑️ Delete Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Theme picker */}
      {showThemePicker && (
        <div
          className="px-4 py-3 flex items-center gap-3 flex-shrink-0 flex-wrap"
          style={{
            background: "#1a1030",
            borderBottom: "1px solid rgba(139,92,246,0.2)",
          }}
          data-ocid="chat.popover"
        >
          <span className="text-xs text-muted-foreground">Theme:</span>
          {Object.entries(CHAT_THEMES).map(([key, t]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setChatTheme(id ?? match?.id ?? "", key);
                setShowThemePicker(false);
              }}
              title={t.label}
              className={`w-7 h-7 rounded-full transition-all hover:scale-110 active:scale-95 ${
                activeThemeId === key
                  ? "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110"
                  : ""
              }`}
              style={{ background: t.color }}
              data-ocid="chat.toggle"
            />
          ))}
        </div>
      )}

      {/* 24h expiry countdown banner */}
      {!firstMessageSent && !firstMessageSentLocal && (
        <div
          className="px-4 py-2 text-center text-xs flex-shrink-0"
          style={{
            background: matchExpired
              ? "rgba(239,68,68,0.12)"
              : "rgba(124,58,237,0.1)",
            borderBottom: "1px solid rgba(139,92,246,0.15)",
            color: matchExpired ? "#f87171" : "#a78bfa",
          }}
        >
          {matchExpired
            ? "Match expired 💔"
            : `⏳ ${formatCountdown(countdown)} left to start the chat`}
        </div>
      )}

      {/* Backend activation banner — shown once on first chat open */}
      {showActivatedBanner && (
        <div
          className="px-4 py-2 text-center text-xs flex-shrink-0 text-green-400 bg-green-500/10 border-b border-green-500/20"
          data-ocid="chat.success_state"
        >
          💬 New chat system activated — your messages now persist across
          devices
          <button
            type="button"
            onClick={() => setShowActivatedBanner(false)}
            className="ml-2 text-green-400/60 hover:text-green-400"
            data-ocid="chat.close_button"
          >
            ×
          </button>
        </div>
      )}

      {/* Icebreakers */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 no-scrollbar">
        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
          <Sparkles size={12} className="text-primary" /> AI
        </div>
        {ICEBREAKERS.slice(0, 3).map((q, i) => (
          <button
            type="button"
            key={q}
            onClick={() => send(q)}
            className="flex-shrink-0 px-3 py-1.5 glass-dark rounded-full text-xs text-foreground hover:bg-primary/20 transition-colors"
            data-ocid={`chat.item.${i + 1}`}
          >
            {q.slice(0, 30)}…
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        className={`flex-1 overflow-y-auto px-4 py-2 space-y-3 ${activeTheme.bg}`}
      >
        {/* Loading state for real profiles */}
        {!isDemo && !messagesLoaded && (
          <div
            className="flex items-center justify-center py-8"
            data-ocid="chat.loading_state"
          >
            <div className="text-xs text-muted-foreground animate-pulse">
              Loading messages...
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.senderId === "me";
          const isSticker = msg.text.startsWith("/assets/");
          const isLastMe = isMe && i === lastMeIndex;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i < 5 ? 0 : 0.1 }}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              data-ocid={`chat.item.${i + 1}`}
            >
              {isSticker ? (
                <motion.img
                  src={msg.text}
                  alt="sticker"
                  className="w-24 h-24 object-contain rounded-2xl"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                />
              ) : (
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? "text-white rounded-br-sm"
                      : `${activeTheme.bubble || "glass-card"} text-foreground rounded-bl-sm`
                  }`}
                  style={
                    isMe
                      ? {
                          background:
                            planType !== "free"
                              ? "linear-gradient(135deg, #7C3AED, #EC4899)"
                              : "linear-gradient(135deg, #7C3AED, #6D28D9)",
                        }
                      : {}
                  }
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-white/60" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              )}
              {isLastMe && (
                <p className="text-[9px] text-white/50 text-right mt-0.5 mr-1">
                  ✓✓ Seen
                </p>
              )}
              {isMe && !isLastMe && i === lastMeIndex - 1 && (
                <p className="text-[9px] text-white/40 text-right mt-0.5 mr-1">
                  ✓ Delivered
                </p>
              )}
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {planType === "free" && (
        <ScreenshotDetector otherUserName={profile.name} />
      )}

      {/* Input area */}
      <div className="px-4 py-3 glass-dark flex flex-col gap-2 flex-shrink-0">
        {/* AI Quick Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {AI_QUICK_ACTIONS.map((action) => (
              <button
                key={action.pool}
                type="button"
                onClick={() => handleQuickAction(action.pool)}
                disabled={aiLoading || inputDisabled}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))",
                  border: "1px solid rgba(139,92,246,0.35)",
                  color: "#c4b5fd",
                }}
                data-ocid="chat.toggle"
              >
                {aiLoading ? (
                  <Sparkles size={10} className="animate-pulse" />
                ) : (
                  <Sparkles size={10} />
                )}
                {action.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiInputSubmit()}
              placeholder="Ask AI what to say…"
              disabled={inputDisabled}
              className="flex-1 px-3 py-1.5 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
              style={{
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)",
                color: "#c4b5fd",
              }}
              data-ocid="chat.search_input"
            />
            <button
              type="button"
              onClick={handleAiInputSubmit}
              disabled={!aiInput.trim() || inputDisabled}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.5), rgba(236,72,153,0.5))",
              }}
              data-ocid="chat.secondary_button"
            >
              <span className="text-xs">✨</span>
            </button>
          </div>
        </div>

        {/* Message input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((p) => !p)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-white/10"
              data-ocid="chat.toggle"
            >
              <Smile size={20} />
            </button>
            {showEmojiPicker && (
              <EmojiStickerPicker
                onSelect={(text) => {
                  if (text.startsWith("/assets/")) {
                    send(text);
                    setShowEmojiPicker(false);
                  } else {
                    setInput((p) => p + text);
                  }
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void send(input)}
            placeholder={
              matchExpired
                ? "Match expired 💔"
                : isMaleWaiting
                  ? `Waiting for ${profile.name} to break the ice 💜`
                  : "Type a message..."
            }
            disabled={inputDisabled}
            className="flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "white",
            }}
            data-ocid="chat.input"
          />
          <button
            type="button"
            onClick={() => void send(input)}
            disabled={!input.trim() || inputDisabled}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
            }}
            data-ocid="chat.submit_button"
          >
            <Send size={18} color="white" />
          </button>
        </div>

        {/* Female-first hint */}
        {isMaleWaiting && !matchExpired && (
          <p className="text-center text-[11px] text-purple-400/70">
            She messages first — it's the UNIVÈRA way ✨
          </p>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetUserId={profile.id}
        targetName={profile.name}
      />

      {/* Block Alert */}
      <AlertDialog open={blockAlertOpen} onOpenChange={setBlockAlertOpen}>
        <AlertDialogContent
          className="rounded-3xl border-border/30"
          style={{ background: "#1a1030" }}
          data-ocid="chat.block.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Block {profile.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They won't be able to contact you and will be hidden from your
              matches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              data-ocid="chat.block.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
              data-ocid="chat.block.confirm_button"
            >
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Match Alert */}
      <AlertDialog
        open={removeMatchAlertOpen}
        onOpenChange={setRemoveMatchAlertOpen}
      >
        <AlertDialogContent
          className="rounded-3xl border-border/30"
          style={{ background: "#1a1030" }}
          data-ocid="chat.remove_match.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Remove match?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This deletes your chat history and removes the match permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              data-ocid="chat.remove_match.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMatch}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
              data-ocid="chat.remove_match.confirm_button"
            >
              Remove Match
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Chat Alert */}
      <AlertDialog
        open={deleteChatAlertOpen}
        onOpenChange={setDeleteChatAlertOpen}
      >
        <AlertDialogContent
          className="rounded-3xl border-border/30"
          style={{ background: "#1a1030" }}
          data-ocid="chat.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete chat from your view?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The conversation will be removed from your chat list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              data-ocid="chat.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChat}
              className="rounded-xl"
              data-ocid="chat.delete.confirm_button"
            >
              Delete for me
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
