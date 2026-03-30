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
export interface Report {
    isReviewed: boolean;
    reportedUserId: Principal;
    reportedAt: Time;
    reporterUserId: Principal;
    details: string;
    reportId: string;
    reason: string;
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
export interface PostData {
    key: string;
    didLike: boolean;
    post: FeedPost;
    likesCount: bigint;
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
    name: string;
    isVerified: boolean;
    gender: string;
    photo: string;
    planType: string;
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
    /**
     * / Matches System
     */
    createMatch(user1: Principal, user2: Principal, matchId: string): Promise<Match>;
    /**
     * / Messaging System
     */
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
    /**
     * / User Profile Functions
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: string): Promise<Array<Comment>>;
    getLikes(postId: string): Promise<Array<Principal>>;
    getMatch(matchId: string): Promise<Match | null>;
    getMatches(): Promise<Array<Match>>;
    getMessages(matchId: string): Promise<Array<ChatMessage>>;
    getNotifications(userId: Principal): Promise<Array<Notification>>;
    /**
     * / Core Functions
     */
    getPosts(): Promise<Array<PostData>>;
    getPostsCreatedToday(userId: Principal): Promise<bigint>;
    getReports(): Promise<Array<Report>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isBlocked(user1: Principal, user2: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: string): Promise<bigint | null>;
    markNotificationsRead(userId: Principal): Promise<void>;
    markReportReviewed(reportId: string): Promise<void>;
    /**
     * / Report System
     */
    reportUser(id: string, reportedUserId: Principal, reportType: string, details: string): Promise<void>;
    resetDailyLimits(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Block System
     */
    toggleBlock(targetUserId: Principal): Promise<{
        __kind__: "blockedSuccessfully";
        blockedSuccessfully: boolean;
    } | {
        __kind__: "unblockedSuccessfully";
        unblockedSuccessfully: boolean;
    }>;
    unlikePost(postId: string): Promise<bigint | null>;
    updatePostsCreatedToday(userId: Principal): Promise<void>;
}
