import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Comment {
    id: string;
    userName: string;
    text: string;
    userPhoto: string;
    timestamp: Time;
    postId: string;
}
export interface Match {
    screenshotAttemptFlag: boolean;
    matchCreatedTime: Time;
    matchId: string;
    isMatched: boolean;
    user1: Principal;
    user2: Principal;
    chatDeleted: boolean;
    firstMessageSent: boolean;
}
export interface FeedPost {
    id: string;
    userName: string;
    userId: Principal;
    createdAt: Time;
    userPhoto: string;
    userAge: bigint;
    postImage?: string;
    isVerified: boolean;
    caption?: string;
    prompt?: string;
    likesCount: bigint;
    promptAnswer?: string;
}
export interface UserPhoto {
    url: string;
    caption: string;
}
export interface PostData {
    key: string;
    didLike: boolean;
    post: FeedPost;
    likesCount: bigint;
}
export interface Report {
    isReviewed: boolean;
    reportedUserId: Principal;
    reportedAt: Time;
    reporterUserId: Principal;
    details: string;
    reportId: string;
    reason: string;
}
export interface Notification {
    id: string;
    notificationType: NotificationType;
    read: boolean;
    text: string;
    toUserId: Principal;
    fromPhoto: string;
    timestamp: Time;
    fromName: string;
}
export interface ChatMessage {
    msgId: string;
    text: string;
    sentAt: Time;
    matchId: string;
    senderUserId: Principal;
}
export interface UserProfile {
    age: bigint;
    avatarData?: string;
    name: string;
    isDemo: boolean;
    isVerified: boolean;
    gender: string;
    coverPhotoIndex: bigint;
    photo: string;
    planType: string;
    photos: Array<UserPhoto>;
    verificationImage?: string;
}
export enum NotificationType {
    likePost = "likePost",
    likePhoto = "likePhoto",
    commentPost = "commentPost",
    likePrompt = "likePrompt"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: string, comment: Comment, key: string): Promise<void>;
    addNotification(notification: Notification, key: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMatch(user1: Principal, user2: Principal, matchId: string): Promise<Match>;
    createMessage(incomingMsg: ChatMessage, key: string): Promise<{
        __kind__: "message";
        message: {
            msgId: string;
            text: string;
            sentAt: Time;
            matchId: string;
            senderUserId: Principal;
        } | null;
    }>;
    createNotifications(user: Principal, notifType: NotificationType): Promise<string>;
    createPost(post: FeedPost, key: string): Promise<FeedPost>;
    deleteChat(matchId: string): Promise<void>;
    deleteMatch(matchId: string): Promise<void>;
    flagScreenshotAttempt(matchId: string): Promise<void>;
    getBlockedUsers(userId: Principal): Promise<Array<Principal>>;
    getBlockingUsers(userId: Principal): Promise<Array<Principal>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: string): Promise<Array<Comment>>;
    getLikes(postId: string): Promise<Array<Principal>>;
    getMatch(matchId: string): Promise<Match | null>;
    getMatches(): Promise<Array<Match>>;
    getMessages(matchId: string): Promise<Array<ChatMessage>>;
    getNotifications(userId: Principal): Promise<Array<Notification>>;
    getPosts(): Promise<Array<PostData>>;
    getPostsCreatedToday(userId: Principal): Promise<bigint>;
    getReports(): Promise<Array<Report>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isBlocked(user1: Principal, user2: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: string): Promise<bigint | null>;
    markNotificationsRead(userId: Principal): Promise<void>;
    markReportReviewed(reportId: string): Promise<void>;
    reportUser(id: string, reportedUserId: Principal, reportType: string, details: string): Promise<void>;
    resetDailyLimits(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCoverPhoto(index: bigint): Promise<void>;
    setVerificationImage(url: string): Promise<void>;
    toggleBlock(targetUserId: Principal): Promise<{
        __kind__: "blockedSuccessfully";
        blockedSuccessfully: boolean;
    } | {
        __kind__: "unblockedSuccessfully";
        unblockedSuccessfully: boolean;
    }>;
    unlikePost(postId: string): Promise<bigint | null>;
    updatePostsCreatedToday(userId: Principal): Promise<void>;
    updateUserPhotos(photos: Array<UserPhoto>, coverIndex: bigint): Promise<void>;
    getMessagesAfter(matchId: string, afterTimestamp: bigint): Promise<Array<ChatMessage>>;
    saveChatTheme(matchId: string, theme: string): Promise<void>;
    getChatThemes(): Promise<Array<[string, string]>>;
}
