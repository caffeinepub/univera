import { Principal } from "@icp-sdk/core/principal";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { NotificationType } from "../backend";
import {
  type AppMode,
  INITIAL_MATCHES,
  type LikeReceived,
  MOCK_LIKES_RECEIVED,
  type Match,
  type Message,
  PROFILES,
  type Profile,
} from "../data/mockData";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  type AvatarData,
  DEFAULT_AVATAR,
  getAvatarString,
} from "../types/avatar";

export interface PromptCardUser {
  prompt: string;
  answer: string;
}

export type PlanType = "free" | "monthly" | "yearly";

const PLAN_LIMITS = {
  free: {
    swipesPerDay: 5,
    superLikesPerCycle: 1,
    adsPerDay: 3,
    adLikesReward: 2,
    boostsPerWeek: 0,
  },
  monthly: {
    swipesPerDay: 10,
    superLikesPerCycle: 1,
    adsPerDay: 0,
    adLikesReward: 0,
    boostsPerWeek: 1,
  },
  yearly: {
    swipesPerDay: 999,
    superLikesPerCycle: 999,
    adsPerDay: 0,
    adLikesReward: 0,
    boostsPerWeek: 4,
  },
};

interface User {
  name: string;
  email: string;
  age: number;
  major: string;
  year: string;
  mode: AppMode;
  isPro: boolean;
  bio: string;
  interests: string[];
  personality?: string;
  personalityTags?: string[];
  photoUrl?: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  photos?: { url: string; caption: string }[];
  coverPhotoIndex?: number;
  isVerified?: boolean;
  promptCards?: PromptCardUser[];
}

export type AppNotification = {
  id: string;
  type: "like_photo" | "like_post" | "comment_post" | "like_prompt";
  fromName: string;
  fromPhoto: string;
  text: string;
  timestamp: string;
  read: boolean;
};

export type FeedPost = {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  userAge: number;
  isVerified: boolean;
  postImage?: string;
  prompt?: string;
  promptAnswer?: string;
  caption?: string;
  likesCount: number;
  likedByMe: boolean;
  comments: {
    id: string;
    userName: string;
    userPhoto: string;
    text: string;
    timestamp: string;
  }[];
  createdAt: string;
};

function formatTimeAgo(nanosTimestamp: bigint): string {
  const ms = Number(nanosTimestamp / 1_000_000n);
  const diff = Date.now() - ms;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return "Yesterday";
  return `${Math.floor(diff / 86400000)}d ago`;
}

function backendNotiTypeToFrontend(
  t: NotificationType,
): AppNotification["type"] {
  if (t === NotificationType.likePhoto) return "like_photo";
  if (t === NotificationType.likePost) return "like_post";
  if (t === NotificationType.commentPost) return "comment_post";
  return "like_prompt";
}

function frontendNotiTypeToBackend(
  t: AppNotification["type"],
): NotificationType {
  if (t === "like_photo") return NotificationType.likePhoto;
  if (t === "like_post") return NotificationType.likePost;
  if (t === "comment_post") return NotificationType.commentPost;
  return NotificationType.likePrompt;
}

export function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function lsSet(key: string, val: string) {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  mode: AppMode;
  setMode: (m: AppMode) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  // Plan system
  planType: PlanType;
  setPlanType: (plan: PlanType, expiryMs: number | null) => void;
  dailySwipesUsed: number;
  swipesLimit: number;
  superLikesRemaining: number;
  adsWatchedToday: number;
  canWatchAd: boolean;
  boostsUsedThisWeek: number;
  boostsRemaining: number;
  subscriptionExpiry: number | null;
  hasAIAccess: boolean;
  nextSwipeResetIn: number;
  nextSuperLikeResetIn: number;
  // Legacy compat
  likesLeft: number;
  superLikesLeft: number;
  adsWatched: number;
  consumeLike: () => boolean;
  consumeSuperLike: () => boolean;
  rewardLikes: (type: "likes" | "superlike", amount: number) => void;
  incrementAdsWatched: () => void;
  matches: Match[];
  addMatch: (profileId: string) => void;
  profiles: Profile[];
  currentProfileIndex: number;
  advanceProfile: () => void;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (v: boolean) => void;
  showMatchModal: boolean;
  matchedProfile: Profile | null;
  setMatchModal: (profile: Profile | null) => void;
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  addNotification: (n: Omit<AppNotification, "id" | "read">) => void;
  likesReceived: LikeReceived[];
  dismissLike: (id: string) => void;
  acceptLike: (like: LikeReceived) => void;
  verifyProfile: () => void;
  posts: FeedPost[];
  postsLoading: boolean;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  createPost: (
    post: Omit<
      FeedPost,
      | "id"
      | "likesCount"
      | "likedByMe"
      | "comments"
      | "createdAt"
      | "userId"
      | "userName"
      | "userPhoto"
      | "userAge"
      | "isVerified"
    >,
  ) => void;
  postsCreatedToday: number;
  upgradeReason: string | null;
  setUpgradeReason: (r: string | null) => void;
  boostActive: boolean;
  boostExpiresAt: number | null;
  activateBoost: () => void;
  tutorialDone: boolean;
  setTutorialDone: (v: boolean) => void;
  currentUserOnlineStatus: "online" | "away" | "offline";
  setCurrentUserOnlineStatus: (status: "online" | "away" | "offline") => void;
  // Safety features
  blockedUsers: string[];
  blockUser: (userId: string) => void;
  reportedUsers: string[];
  reportUser: (userId: string, reason: string, details: string) => void;
  removeMatch: (matchId: string) => void;
  deleteChat: (matchId: string) => void;
  matchCreatedTimes: Record<string, number>;
  // Avatar & chat personalization
  avatarData: AvatarData | null;
  setAvatarData: (data: AvatarData) => void;
  avatarString: string;
  chatThemes: Record<string, string>;
  setChatTheme: (chatId: string, theme: string) => void;
  // Photo management
  updateUserPhotos: (
    photos: { url: string; caption: string }[],
    coverIndex: number,
  ) => Promise<void>;
  setCoverPhotoIdx: (index: number) => Promise<void>;
  setVerificationImageUrl: (url: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  // Chat persistence
  userId: string;
  loadChatMessages: (matchId: string) => Promise<Message[]>;
  sendChatMessage: (
    matchId: string,
    text: string,
    msgId?: string,
  ) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  const [user, setUserState] = useState<User | null>(null);
  const setUser = (u: User | null) => setUserState(u);
  const logout = () => setUserState(null);
  const [mode, setModeState] = useState<AppMode>("dating");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // ─── localStorage userId (for display / identity) ─────────────────────────
  const [userId] = useState<string>(() => {
    let id = lsGet("univera_user_id");
    if (!id) {
      id = `user_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
      lsSet("univera_user_id", id);
    }
    return id;
  });

  // ─── Plan / subscription state (persisted) ─────────────────────────────────
  const [planType, setPlanTypeState] = useState<PlanType>(() => {
    return (lsGet("univera_plan_type") as PlanType) ?? "free";
  });
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<number | null>(
    () => {
      const v = lsGet("univera_plan_expiry");
      return v ? Number(v) : null;
    },
  );
  const [dailySwipesUsed, setDailySwipesUsed] = useState<number>(() => {
    return Number(lsGet("univera_daily_swipes_used") ?? "0");
  });
  const [lastSwipeResetTime, setLastSwipeResetTime] = useState<number>(() => {
    return Number(lsGet("univera_last_swipe_reset") ?? String(Date.now()));
  });
  const [adsWatchedToday, setAdsWatchedToday] = useState<number>(() => {
    return Number(lsGet("univera_ads_watched_today") ?? "0");
  });
  const [lastAdResetTime, setLastAdResetTime] = useState<number>(() => {
    return Number(lsGet("univera_last_ad_reset") ?? String(Date.now()));
  });
  const [superLikesRemaining, setSuperLikesRemaining] = useState<number>(() => {
    const stored = lsGet("univera_super_likes_remaining");
    if (stored !== null) return Number(stored);
    const plan = (lsGet("univera_plan_type") as PlanType) ?? "free";
    return plan === "yearly" ? 999 : 1;
  });
  const [lastSuperLikeReset, setLastSuperLikeReset] = useState<number>(() => {
    return Number(lsGet("univera_last_super_like_reset") ?? String(Date.now()));
  });
  const [boostsUsedThisWeek, setBoostsUsedThisWeek] = useState<number>(() => {
    return Number(lsGet("univera_boosts_used_this_week") ?? "0");
  });
  const [lastBoostReset, setLastBoostReset] = useState<number>(() => {
    return Number(lsGet("univera_last_boost_reset") ?? String(Date.now()));
  });

  // Boost active state
  const [boostActive, setBoostActive] = useState(false);
  const [boostExpiresAt, setBoostExpiresAt] = useState<number | null>(null);

  // Safety features
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    try {
      return JSON.parse(lsGet("univera_blocked_users") ?? "[]");
    } catch {
      return [];
    }
  });
  const [reportedUsers, setReportedUsers] = useState<string[]>([]);

  // matchCreatedTimes: track when each match was created
  const [matchCreatedTimes, setMatchCreatedTimes] = useState<
    Record<string, number>
  >(() => {
    // For INITIAL_MATCHES, set to 2 hours ago
    const times: Record<string, number> = {};
    for (const m of INITIAL_MATCHES) {
      times[m.id] = Date.now() - 2 * 60 * 60 * 1000;
    }
    return times;
  });

  // Avatar & chat themes
  const [avatarData, setAvatarDataState] = useState<AvatarData | null>(() => {
    try {
      const stored = lsGet("univera_avatar");
      return stored ? JSON.parse(stored) : DEFAULT_AVATAR;
    } catch {
      return DEFAULT_AVATAR;
    }
  });

  const setAvatarData = (data: AvatarData) => {
    setAvatarDataState(data);
    lsSet("univera_avatar", JSON.stringify(data));
  };

  const [chatThemes, setChatThemesState] = useState<Record<string, string>>(
    () => {
      try {
        const stored = lsGet("univera_chat_themes");
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    },
  );

  const setChatTheme = (chatId: string, theme: string) => {
    setChatThemesState((prev) => {
      const next = { ...prev, [chatId]: theme };
      lsSet("univera_chat_themes", JSON.stringify(next));
      return next;
    });
    // Fire-and-forget backend save (method declared in backend.d.ts, exists at runtime)
    if (actor) {
      (
        actor as unknown as {
          saveChatTheme(m: string, t: string): Promise<void>;
        }
      )
        .saveChatTheme(chatId, theme)
        .catch(() => {});
    }
  };

  // ─── Other existing state ─────────────────────────────────────────────────
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [likesReceived, setLikesReceived] =
    useState<LikeReceived[]>(MOCK_LIKES_RECEIVED);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsCreatedToday, setPostsCreatedToday] = useState(0);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
  const [tutorialDone, setTutorialDoneState] = useState(() => {
    return lsGet("univera_tutorial_done") === "true";
  });

  // ─── Reset logic ─────────────────────────────────────────────────────────
  const checkAndReset = useCallback(() => {
    const now = Date.now();

    // Check subscription expiry
    if (subscriptionExpiry && now > subscriptionExpiry) {
      setPlanTypeState("free");
      lsSet("univera_plan_type", "free");
      lsSet("univera_plan_expiry", "");
      setSubscriptionExpiry(null);
    }

    // Reset swipes every 24h
    if (now - lastSwipeResetTime > 86_400_000) {
      setDailySwipesUsed(0);
      lsSet("univera_daily_swipes_used", "0");
      const ts = now;
      setLastSwipeResetTime(ts);
      lsSet("univera_last_swipe_reset", String(ts));
    }

    // Reset ads every 24h
    if (now - lastAdResetTime > 86_400_000) {
      setAdsWatchedToday(0);
      lsSet("univera_ads_watched_today", "0");
      const ts = now;
      setLastAdResetTime(ts);
      lsSet("univera_last_ad_reset", String(ts));
    }

    // Reset super likes
    const currentPlan = (lsGet("univera_plan_type") as PlanType) ?? "free";
    const superLikeCycle = currentPlan === "monthly" ? 86_400_000 : 604_800_000;
    if (currentPlan !== "yearly" && now - lastSuperLikeReset > superLikeCycle) {
      const newVal = PLAN_LIMITS[currentPlan].superLikesPerCycle;
      setSuperLikesRemaining(newVal);
      lsSet("univera_super_likes_remaining", String(newVal));
      const ts = now;
      setLastSuperLikeReset(ts);
      lsSet("univera_last_super_like_reset", String(ts));
    }

    // Reset boosts weekly
    if (now - lastBoostReset > 604_800_000) {
      setBoostsUsedThisWeek(0);
      lsSet("univera_boosts_used_this_week", "0");
      const ts = now;
      setLastBoostReset(ts);
      lsSet("univera_last_boost_reset", String(ts));
    }
  }, [
    lastSwipeResetTime,
    lastAdResetTime,
    lastSuperLikeReset,
    lastBoostReset,
    subscriptionExpiry,
  ]);

  // Run reset check on mount and every minute
  useEffect(() => {
    checkAndReset();
    const t = setInterval(checkAndReset, 60_000);
    return () => clearInterval(t);
  }, [checkAndReset]);

  // Load boost state from localStorage on mount
  useEffect(() => {
    const stored = lsGet("univera_boost_expires_at");
    if (stored) {
      const exp = Number(stored);
      if (exp > Date.now()) {
        setBoostActive(true);
        setBoostExpiresAt(exp);
      } else {
        lsSet("univera_boost_expires_at", "");
      }
    }
  }, []);

  // Expire boost when timer runs out
  useEffect(() => {
    if (!boostActive || !boostExpiresAt) return;
    const remaining = boostExpiresAt - Date.now();
    if (remaining <= 0) {
      setBoostActive(false);
      setBoostExpiresAt(null);
      lsSet("univera_boost_expires_at", "");
      return;
    }
    const timer = setTimeout(() => {
      setBoostActive(false);
      setBoostExpiresAt(null);
      lsSet("univera_boost_expires_at", "");
    }, remaining);
    return () => clearTimeout(timer);
  }, [boostActive, boostExpiresAt]);

  // ─── Plan management ────────────────────────────────────────────────────────
  const setPlanType = useCallback((plan: PlanType, expiryMs: number | null) => {
    setPlanTypeState(plan);
    lsSet("univera_plan_type", plan);
    setSubscriptionExpiry(expiryMs);
    lsSet("univera_plan_expiry", expiryMs ? String(expiryMs) : "");
    // Reset counters
    const limits = PLAN_LIMITS[plan];
    setDailySwipesUsed(0);
    lsSet("univera_daily_swipes_used", "0");
    const newSuperLikes = plan === "yearly" ? 999 : limits.superLikesPerCycle;
    setSuperLikesRemaining(newSuperLikes);
    lsSet("univera_super_likes_remaining", String(newSuperLikes));
    setBoostsUsedThisWeek(0);
    lsSet("univera_boosts_used_this_week", "0");
    // Update user isPro
    setUserState((prev) => (prev ? { ...prev, isPro: plan !== "free" } : prev));
  }, []);

  // ─── Computed values ────────────────────────────────────────────────────────
  const swipesLimit = PLAN_LIMITS[planType].swipesPerDay;
  const canWatchAd = planType === "free" && adsWatchedToday < 3;
  const boostsRemaining = Math.max(
    0,
    PLAN_LIMITS[planType].boostsPerWeek - boostsUsedThisWeek,
  );
  const nextSwipeResetIn = Math.max(
    0,
    86_400_000 - (Date.now() - lastSwipeResetTime),
  );
  const nextSuperLikeResetIn =
    planType === "yearly"
      ? 0
      : (() => {
          const cycle = planType === "monthly" ? 86_400_000 : 604_800_000;
          return Math.max(0, cycle - (Date.now() - lastSuperLikeReset));
        })();

  // Legacy compat
  const likesLeft = Math.max(0, swipesLimit - dailySwipesUsed);
  const superLikesLeft = superLikesRemaining;
  const adsWatched = adsWatchedToday;

  // ─── Operations ─────────────────────────────────────────────────────────────
  const consumeLike = (): boolean => {
    checkAndReset();
    if (planType === "yearly") return true;
    if (dailySwipesUsed >= PLAN_LIMITS[planType].swipesPerDay) return false;
    const next = dailySwipesUsed + 1;
    setDailySwipesUsed(next);
    lsSet("univera_daily_swipes_used", String(next));
    return true;
  };

  const consumeSuperLike = (): boolean => {
    checkAndReset();
    if (planType === "yearly") return true;
    if (superLikesRemaining <= 0) return false;
    const next = superLikesRemaining - 1;
    setSuperLikesRemaining(next);
    lsSet("univera_super_likes_remaining", String(next));
    return true;
  };

  const rewardLikes = (_type: "likes" | "superlike", amount: number) => {
    // Give bonus likes by reducing dailySwipesUsed
    const next = Math.max(0, dailySwipesUsed - amount);
    setDailySwipesUsed(next);
    lsSet("univera_daily_swipes_used", String(next));
  };

  const incrementAdsWatched = () => {
    const next = adsWatchedToday + 1;
    setAdsWatchedToday(next);
    lsSet("univera_ads_watched_today", String(next));
  };

  const activateBoost = () => {
    if (boostsRemaining <= 0 && planType === "free") return;
    const exp = Date.now() + 5 * 60 * 60 * 1000; // 5 hours
    setBoostActive(true);
    setBoostExpiresAt(exp);
    lsSet("univera_boost_expires_at", String(exp));
    const newUsed = boostsUsedThisWeek + 1;
    setBoostsUsedThisWeek(newUsed);
    lsSet("univera_boosts_used_this_week", String(newUsed));
  };

  const setTutorialDone = (v: boolean) => {
    setTutorialDoneState(v);
    lsSet("univera_tutorial_done", String(v));
  };

  const [currentUserOnlineStatus, setCurrentUserOnlineStatusState] = useState<
    "online" | "away" | "offline"
  >(() => {
    return (
      (lsGet("univera_online_status") as "online" | "away" | "offline") ??
      "online"
    );
  });
  const setCurrentUserOnlineStatus = (
    status: "online" | "away" | "offline",
  ) => {
    setCurrentUserOnlineStatusState(status);
    lsSet("univera_online_status", status);
  };

  const getCallerPrincipal = useCallback((): Principal => {
    if (identity) return identity.getPrincipal();
    return Principal.anonymous();
  }, [identity]);

  // Safety features
  const blockUser = useCallback(
    (userId: string) => {
      setBlockedUsers((prev) => {
        if (prev.includes(userId)) return prev;
        const next = [...prev, userId];
        lsSet("univera_blocked_users", JSON.stringify(next));
        return next;
      });
      if (actor) {
        try {
          actor.toggleBlock(Principal.fromText(userId));
        } catch {
          /* ignore invalid principal for mock data */
        }
      }
    },
    [actor],
  );

  const reportUser = useCallback(
    (userId: string, reason: string, details: string) => {
      setReportedUsers((prev) => {
        if (prev.includes(userId)) return prev;
        return [...prev, userId];
      });
      if (actor) {
        const reportId = `r${Date.now()}`;
        try {
          actor.reportUser(
            reportId,
            Principal.fromText(userId),
            reason,
            details,
          );
        } catch {
          /* ignore invalid principal for mock data */
        }
      }
    },
    [actor],
  );

  const removeMatch = useCallback(
    (matchId: string) => {
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      if (actor) {
        actor.deleteMatch(matchId).catch(() => {});
      }
    },
    [actor],
  );

  const deleteChat = useCallback(
    (matchId: string) => {
      if (actor) {
        actor.deleteChat(matchId).catch(() => {});
      }
    },
    [actor],
  );

  // ─── Chat persistence ────────────────────────────────────────────────────────
  const loadChatMessages = useCallback(
    async (matchId: string): Promise<Message[]> => {
      if (!actor) return [];
      const myPrincipalStr = identity?.getPrincipal().toString() ?? "";
      try {
        const rawMsgs = await actor.getMessages(matchId);
        return rawMsgs.map((m) => ({
          id: m.msgId,
          matchId: m.matchId,
          senderId:
            m.senderUserId.toString() === myPrincipalStr
              ? "me"
              : m.senderUserId.toString(),
          text: m.text,
          timestamp: new Date(Number(m.sentAt / 1_000_000n)).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          ),
        }));
      } catch {
        return [];
      }
    },
    [actor, identity],
  );

  const sendChatMessage = useCallback(
    async (matchId: string, text: string, msgId?: string): Promise<boolean> => {
      if (!actor) return false;
      const key =
        msgId ?? `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const myPrincipal = identity
        ? identity.getPrincipal()
        : Principal.anonymous();
      try {
        await actor.createMessage(
          {
            msgId: key,
            text,
            sentAt: BigInt(Date.now()) * 1_000_000n,
            matchId,
            senderUserId: myPrincipal,
          },
          key,
        );
        return true;
      } catch {
        return false;
      }
    },
    [actor, identity],
  );

  // Sync chat themes from backend (backend wins over localStorage for conflicts)
  const syncChatThemes = useCallback(async () => {
    if (!actor) return;
    try {
      // getChatThemes is declared in backend.d.ts and exists at runtime
      const themes = await (
        actor as unknown as {
          getChatThemes(): Promise<Array<[string, string]>>;
        }
      ).getChatThemes();
      if (themes.length === 0) return;
      setChatThemesState((prev) => {
        const next = { ...prev };
        for (const [chatId, theme] of themes) {
          next[chatId] = theme;
        }
        lsSet("univera_chat_themes", JSON.stringify(next));
        return next;
      });
    } catch {
      // Ignore sync errors
    }
  }, [actor]);

  // Load posts from backend
  const loadPosts = useCallback(async () => {
    if (!actor) return;
    setPostsLoading(true);
    try {
      const rawPosts = await actor.getPosts();
      const mapped: FeedPost[] = rawPosts.map((pd) => ({
        id: pd.post.id,
        userId: pd.post.userId.toString(),
        userName: pd.post.userName,
        userPhoto: pd.post.userPhoto,
        userAge: Number(pd.post.userAge),
        isVerified: pd.post.isVerified,
        postImage: pd.post.postImage ?? undefined,
        prompt: pd.post.prompt ?? undefined,
        promptAnswer: pd.post.promptAnswer ?? undefined,
        caption: pd.post.caption ?? undefined,
        likesCount: Number(pd.likesCount),
        likedByMe: pd.didLike,
        comments: [],
        createdAt: formatTimeAgo(pd.post.createdAt),
      }));
      mapped.sort((a, b) => {
        const idA = Number(BigInt(a.id.replace(/[^0-9]/g, "") || "0"));
        const idB = Number(BigInt(b.id.replace(/[^0-9]/g, "") || "0"));
        return idB - idA;
      });
      setPosts(mapped);
    } catch (e) {
      console.error("Failed to load posts", e);
    } finally {
      setPostsLoading(false);
    }
  }, [actor]);

  // Load notifications from backend
  const loadNotifications = useCallback(async () => {
    if (!actor) return;
    try {
      const principal = getCallerPrincipal();
      const rawNotifs = await actor.getNotifications(principal);
      const mapped: AppNotification[] = rawNotifs.map((n) => ({
        id: n.id,
        type: backendNotiTypeToFrontend(n.notificationType),
        fromName: n.fromName,
        fromPhoto: n.fromPhoto,
        text: n.text,
        timestamp: formatTimeAgo(n.timestamp),
        read: n.read,
      }));
      mapped.sort((a, b) => a.id.localeCompare(b.id) * -1);
      setNotifications(mapped);
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  }, [actor, getCallerPrincipal]);

  // ─── Photo management ───────────────────────────────────────────────────────
  const refreshUserProfile = useCallback(async () => {
    if (!actor) return;
    try {
      const profile = await actor.getCallerUserProfile();
      if (profile?.photos && profile.photos.length > 0) {
        setUserState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            photos: profile.photos.map((p) => ({
              url: p.url,
              caption: p.caption,
            })),
            coverPhotoIndex: Number(profile.coverPhotoIndex),
            photoUrl:
              profile.photos[Number(profile.coverPhotoIndex)]?.url ??
              profile.photo,
            isVerified: profile.isVerified,
          };
        });
      }
    } catch (e) {
      console.warn("refreshUserProfile failed", e);
    }
  }, [actor]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (actor) {
      loadPosts();
      loadNotifications();
      refreshUserProfile();
      syncChatThemes();
      // Load backend matches and merge with INITIAL_MATCHES
      actor
        .getMatches()
        .then((backendMatches) => {
          const frontendMatches: Match[] = backendMatches.map((m) => ({
            id: m.matchId,
            profileId: m.matchId, // provisional — won't find in PROFILES, filtered in Matches.tsx
            matchedAt: "Matched",
            lastMessage: "Say hello! 👋",
            unread: 0,
          }));
          setMatches((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMatches = frontendMatches.filter(
              (m) => !existingIds.has(m.id),
            );
            if (newMatches.length === 0) return prev;
            return [...prev, ...newMatches];
          });
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor]);

  const updateUserPhotos = useCallback(
    async (photos: { url: string; caption: string }[], coverIndex: number) => {
      setUserState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          photos,
          coverPhotoIndex: coverIndex,
          photoUrl: photos[coverIndex]?.url ?? prev.photoUrl,
        };
      });
      if (!actor) return;
      try {
        await actor.updateUserPhotos(photos, BigInt(coverIndex));
        // Also persist to full profile
        const currentProfile = await actor.getCallerUserProfile();
        if (currentProfile) {
          await actor.saveCallerUserProfile({
            ...currentProfile,
            photos: photos,
            coverPhotoIndex: BigInt(coverIndex),
            photo: photos[coverIndex]?.url ?? currentProfile.photo,
          });
        }
      } catch (e) {
        console.warn("updateUserPhotos backend failed", e);
      }
    },
    [actor],
  );

  const setCoverPhotoIdx = useCallback(
    async (index: number) => {
      setUserState((prev) => {
        if (!prev) return prev;
        const newPhotoUrl = prev.photos?.[index]?.url ?? prev.photoUrl;
        return { ...prev, coverPhotoIndex: index, photoUrl: newPhotoUrl };
      });
      if (!actor) return;
      try {
        await actor.setCoverPhoto(BigInt(index));
      } catch (e) {
        console.warn("setCoverPhoto backend failed", e);
      }
    },
    [actor],
  );

  const setVerificationImageUrl = useCallback(
    async (url: string) => {
      setUserState((prev) => (prev ? { ...prev, isVerified: true } : prev));
      if (!actor) return;
      try {
        await actor.setVerificationImage(url);
      } catch (e) {
        console.warn("setVerificationImage backend failed", e);
      }
    },
    [actor],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!actor) return;
    try {
      await actor.markNotificationsRead(getCallerPrincipal());
    } catch (e) {
      console.error("markNotificationsRead failed", e);
    }
  }, [actor, getCallerPrincipal]);

  const addNotification = useCallback(
    async (n: Omit<AppNotification, "id" | "read">) => {
      const id = `n${Date.now()}`;
      const newN: AppNotification = { ...n, id, read: false };
      setNotifications((prev) => [newN, ...prev]);
      if (!actor) return;
      try {
        const principal = getCallerPrincipal();
        await actor.addNotification(
          {
            id,
            notificationType: frontendNotiTypeToBackend(n.type),
            read: false,
            text: n.text,
            toUserId: principal,
            fromPhoto: n.fromPhoto,
            timestamp: BigInt(Date.now()) * 1_000_000n,
            fromName: n.fromName,
          },
          id,
        );
      } catch (e) {
        console.error("addNotification failed", e);
      }
    },
    [actor, getCallerPrincipal],
  );

  const setMode = (m: AppMode) => {
    setModeState(m);
    document.documentElement.classList.toggle("bff-mode", m === "bff");
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
  };

  const addMatch = (profileId: string) => {
    const newMatchId = `m${Date.now()}`;
    const newMatch: Match = {
      id: newMatchId,
      profileId,
      matchedAt: "Just now",
      lastMessage: "Say hello! 👋",
      unread: 0,
    };
    setMatches((prev) => [newMatch, ...prev]);
    setMatchCreatedTimes((prev) => ({ ...prev, [newMatchId]: Date.now() }));
  };

  const advanceProfile = () =>
    setCurrentProfileIndex((prev) => (prev + 1) % PROFILES.length);

  const setMatchModal = (profile: Profile | null) => {
    setMatchedProfile(profile);
    setShowMatchModal(!!profile);
  };

  const dismissLike = (id: string) => {
    setLikesReceived((prev) => prev.filter((l) => l.id !== id));
  };

  const acceptLike = (like: LikeReceived) => {
    addMatch(like.profileId);
    dismissLike(like.id);
    const profile = PROFILES.find((p) => p.id === like.profileId);
    if (profile) {
      setMatchModal(profile);
      addNotification({
        type: "like_photo",
        fromName: profile.name,
        fromPhoto: profile.photo,
        text: `${profile.name} liked your photo`,
        timestamp: "Just now",
      });
    }
  };

  const verifyProfile = () => {
    if (user) setUser({ ...user, isVerified: true });
  };

  const likePost = useCallback(
    async (postId: string) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByMe: !p.likedByMe,
                likesCount: p.likedByMe ? p.likesCount - 1 : p.likesCount + 1,
              }
            : p,
        ),
      );
      if (!actor) return;
      try {
        const newCount = await actor.likePost(postId);
        if (newCount !== null) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, likesCount: Number(newCount) } : p,
            ),
          );
        }
      } catch (e) {
        console.error("likePost backend failed", e);
      }
    },
    [actor],
  );

  const addComment = useCallback(
    async (postId: string, text: string) => {
      const commentId = `c${Date.now()}`;
      const newComment = {
        id: commentId,
        userName: user?.name ?? "You",
        userPhoto:
          user?.photoUrl ??
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100",
        text,
        timestamp: "Just now",
      };
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p,
        ),
      );
      if (!actor) return;
      try {
        await actor.addComment(
          postId,
          {
            id: commentId,
            userName: user?.name ?? "You",
            userPhoto:
              user?.photoUrl ??
              "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100",
            text,
            timestamp: BigInt(Date.now()) * 1_000_000n,
            postId,
          },
          commentId,
        );
      } catch (e) {
        console.error("addComment failed", e);
      }
    },
    [actor, user],
  );

  const createPost = useCallback(
    async (
      post: Omit<
        FeedPost,
        | "id"
        | "likesCount"
        | "likedByMe"
        | "comments"
        | "createdAt"
        | "userId"
        | "userName"
        | "userPhoto"
        | "userAge"
        | "isVerified"
      >,
    ) => {
      if (postsCreatedToday >= 3) return;
      const key = Date.now().toString();
      const principal = getCallerPrincipal();

      const optimisticPost: FeedPost = {
        ...post,
        id: key,
        userId: principal.toString(),
        userName: user?.name ?? "You",
        userPhoto:
          user?.photoUrl ??
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100",
        userAge: user?.age ?? 20,
        isVerified: user?.isVerified ?? false,
        likesCount: 0,
        likedByMe: false,
        comments: [],
        createdAt: "Just now",
      };

      setPosts((prev) => [optimisticPost, ...prev]);
      setPostsCreatedToday((p) => p + 1);

      if (!actor) return;
      try {
        const backendPost = {
          id: key,
          userId: principal,
          userName: user?.name ?? "You",
          userPhoto:
            user?.photoUrl ??
            "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100",
          userAge: BigInt(user?.age ?? 20),
          isVerified: user?.isVerified ?? false,
          postImage: post.postImage,
          prompt: post.prompt,
          promptAnswer: post.promptAnswer,
          caption: post.caption,
          likesCount: 0n,
          createdAt: BigInt(Date.now()) * 1_000_000n,
        };
        await actor.createPost(backendPost, key);
      } catch (e) {
        console.error("createPost backend failed", e);
      }
    },
    [actor, user, postsCreatedToday, getCallerPrincipal],
  );

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        logout,
        mode,
        setMode,
        theme,
        toggleTheme,
        // Plan
        planType,
        hasAIAccess: planType === "monthly" || planType === "yearly",
        setPlanType,
        dailySwipesUsed,
        swipesLimit,
        superLikesRemaining,
        adsWatchedToday,
        canWatchAd,
        boostsUsedThisWeek,
        boostsRemaining,
        subscriptionExpiry,
        nextSwipeResetIn,
        nextSuperLikeResetIn,
        // Legacy compat
        likesLeft,
        superLikesLeft,
        adsWatched,
        consumeLike,
        consumeSuperLike,
        rewardLikes,
        incrementAdsWatched,
        matches,
        addMatch,
        profiles: PROFILES,
        currentProfileIndex,
        advanceProfile,
        showUpgradeModal,
        setShowUpgradeModal,
        showMatchModal,
        matchedProfile,
        setMatchModal,
        notifications,
        unreadCount,
        markAllRead,
        addNotification,
        likesReceived,
        dismissLike,
        acceptLike,
        verifyProfile,
        posts,
        postsLoading,
        likePost,
        addComment,
        createPost,
        postsCreatedToday,
        upgradeReason,
        setUpgradeReason,
        boostActive,
        boostExpiresAt,
        activateBoost,
        tutorialDone,
        setTutorialDone,
        currentUserOnlineStatus,
        setCurrentUserOnlineStatus,
        // Safety
        blockedUsers,
        blockUser,
        reportedUsers,
        reportUser,
        removeMatch,
        deleteChat,
        matchCreatedTimes,
        // Avatar & chat personalization
        avatarData,
        setAvatarData,
        avatarString: getAvatarString(avatarData),
        chatThemes,
        setChatTheme,
        // Photo management
        updateUserPhotos,
        setCoverPhotoIdx,
        setVerificationImageUrl,
        refreshUserProfile,
        // Chat persistence
        userId,
        loadChatMessages,
        sendChatMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
