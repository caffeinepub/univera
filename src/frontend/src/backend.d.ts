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
export interface UserProfile {
    age: bigint;
    name: string;
    isVerified: boolean;
    photo: string;
}
export interface PostData {
    key: string;
    didLike: boolean;
    post: FeedPost;
    likesCount: bigint;
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
    createNotifications(user: Principal, notifType: NotificationType): Promise<string>;
    createPost(post: FeedPost, key: string): Promise<FeedPost>;
    /**
     * / User Profile Functions
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: string): Promise<Array<Comment>>;
    getLikes(postId: string): Promise<Array<Principal>>;
    getNotifications(userId: Principal): Promise<Array<Notification>>;
    /**
     * / Core Functions
     */
    getPosts(): Promise<Array<PostData>>;
    getPostsCreatedToday(userId: Principal): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Types
     */
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: string): Promise<bigint | null>;
    markNotificationsRead(userId: Principal): Promise<void>;
    resetDailyLimits(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unlikePost(postId: string): Promise<bigint | null>;
    updatePostsCreatedToday(userId: Principal): Promise<void>;
}
