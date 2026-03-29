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
  PROFILES,
  type Profile,
} from "../data/mockData";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export interface PromptCardUser {
  prompt: string;
  answer: string;
}

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

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  mode: AppMode;
  setMode: (m: AppMode) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  likesLeft: number;
  superLikesLeft: number;
  consumeLike: () => boolean;
  consumeSuperLike: () => boolean;
  rewardLikes: (type: "likes" | "superlike", amount: number) => void;
  adsWatched: number;
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
  const [likesLeft, setLikesLeft] = useState(5);
  const [superLikesLeft, setSuperLikesLeft] = useState(1);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [adsWatched, setAdsWatched] = useState(0);
  const [likesReceived, setLikesReceived] =
    useState<LikeReceived[]>(MOCK_LIKES_RECEIVED);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsCreatedToday, setPostsCreatedToday] = useState(0);

  const getCallerPrincipal = useCallback((): Principal => {
    if (identity) return identity.getPrincipal();
    return Principal.anonymous();
  }, [identity]);

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
      // Sort newest first
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
      // Sort newest first
      mapped.sort((a, b) => a.id.localeCompare(b.id) * -1);
      setNotifications(mapped);
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  }, [actor, getCallerPrincipal]);

  // Load posts/notifications on actor ready
  useEffect(() => {
    if (actor) {
      loadPosts();
      loadNotifications();
    }
  }, [actor, loadPosts, loadNotifications]);

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

  const consumeLike = () => {
    if (user?.isPro) return true;
    if (likesLeft <= 0) {
      setShowUpgradeModal(true);
      return false;
    }
    setLikesLeft((p) => p - 1);
    return true;
  };

  const consumeSuperLike = () => {
    if (user?.isPro) return true;
    if (superLikesLeft <= 0) {
      setShowUpgradeModal(true);
      return false;
    }
    setSuperLikesLeft((p) => p - 1);
    return true;
  };

  const rewardLikes = (type: "likes" | "superlike", amount: number) => {
    if (type === "likes") setLikesLeft((p) => p + amount);
    else setSuperLikesLeft((p) => p + amount);
  };

  const incrementAdsWatched = () => setAdsWatched((p) => p + 1);

  const addMatch = (profileId: string) => {
    const newMatch: Match = {
      id: `m${Date.now()}`,
      profileId,
      matchedAt: "Just now",
      lastMessage: "Say hello! 👋",
      unread: 0,
    };
    setMatches((prev) => [newMatch, ...prev]);
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
      // Optimistic update
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
      // Optimistic update
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
        console.error("addComment backend failed", e);
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
        likesLeft,
        superLikesLeft,
        consumeLike,
        consumeSuperLike,
        rewardLikes,
        adsWatched,
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
