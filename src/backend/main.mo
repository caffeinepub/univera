import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import List "mo:core/List";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";


actor {
  ////////////////////
  /// Access Control
  ////////////////////

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  ////////////////////
  /// Types
  ////////////////////

  public type UserProfile = {
    name : Text;
    photo : Text;
    age : Nat;
    isVerified : Bool;
  };

  public type FeedPost = {
    id : Text;
    userId : Principal;
    userName : Text;
    userPhoto : Text;
    userAge : Nat;
    isVerified : Bool;
    postImage : ?Text;
    prompt : ?Text;
    promptAnswer : ?Text;
    caption : ?Text;
    likesCount : Nat;
    createdAt : Time.Time;
  };

  public type Comment = {
    id : Text;
    postId : Text;
    userName : Text;
    userPhoto : Text;
    text : Text;
    timestamp : Time.Time;
  };

  public type NotificationType = {
    #likePhoto;
    #likePost;
    #commentPost;
    #likePrompt;
  };

  public type Notification = {
    id : Text;
    toUserId : Principal;
    notificationType : NotificationType;
    fromName : Text;
    fromPhoto : Text;
    text : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  public type PostResult = {
    #ok : Text;
    #error : Text;
  };

  type NotificationInternal = {
    notification : Notification;
    key : Text;
  };

  type CommentInternal = {
    comment : Comment;
    key : Text;
  };

  public type PostData = {
    post : FeedPost;
    key : Text;
    didLike : Bool;
    likesCount : Nat;
  };

  ////////////////////
  /// Error Handling
  ////////////////////

  public type Error = {
    #alreadyLiked;
    #postNotFound;
    #commentNotFound;
    #invalidPostData;
    #unknown : Text;
    #limitExceeded;
  };

  type Result<Ok, Err> = {
    #ok : Ok;
    #err : Err;
  };

  ////////////////////
  /// Persistent State
  ////////////////////

  let userProfiles = Map.empty<Principal, UserProfile>();
  let notificationMap = Map.empty<Text, NotificationInternal>();
  let commentMap = Map.empty<Text, CommentInternal>();
  let feedPosts = Map.empty<Text, FeedPost>();
  let postLikes = Map.empty<Text, ([Principal], Text)>();
  let postsCreatedToday = Map.empty<Principal, Nat>();

  ////////////////////
  /// User Profile Functions
  ////////////////////

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  ////////////////////
  /// Core Functions
  ////////////////////

  public query ({ caller }) func getPosts() : async [PostData] {
    let posts = feedPosts.values().toArray();
    let result = posts.map(
      func(post : FeedPost) : PostData {
        let didLike = switch (postLikes.get(post.id)) {
          case (?likes) {
            let (likeList, _) = likes;
            likeList.find(func(p) { p == caller }) != null;
          };
          case (null) { false };
        };
        {
          post = post;
          key = post.id;
          didLike = didLike;
          likesCount = post.likesCount;
        };
      },
    );
    result;
  };

  public query ({ caller }) func getLikes(postId : Text) : async [Principal] {
    switch (postLikes.get(postId)) {
      case (?likes) {
        let (likeList, _) = likes;
        likeList;
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func likePost(postId : Text) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    switch (feedPosts.get(postId)) {
      case (?post) {
        let currentLikes = switch (postLikes.get(postId)) {
          case (?likes) { let (list, id) = likes; list };
          case (null) { [] };
        };

        // Check if already liked - toggle to unlike
        let alreadyLiked = currentLikes.find<Principal>(func(p) { p == caller }) != null;
        
        if (alreadyLiked) {
          // Unlike
          let updatedLikes = currentLikes.filter(func(id) { id != caller });
          postLikes.add(postId, (updatedLikes, post.id));
          let newLikesCount = if (post.likesCount > 0) { post.likesCount - 1 } else { 0 };
          let updatedPost = {
            post with likesCount = newLikesCount;
          };
          feedPosts.add(postId, updatedPost);
          ?newLikesCount;
        } else {
          // Like
          let callerArray : [Principal] = [caller];
          let updatedLikes = currentLikes.concat(callerArray);
          postLikes.add(postId, (updatedLikes, post.id));
          let newLikesCount = post.likesCount + 1;
          let updatedPost = {
            post with likesCount = newLikesCount;
          };
          feedPosts.add(postId, updatedPost);
          ?newLikesCount;
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func unlikePost(postId : Text) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };

    switch (feedPosts.get(postId)) {
      case (?post) {
        let currentLikes = switch (postLikes.get(postId)) {
          case (null) { return null };
          case (?likes) { let (list, id) = likes; list };
        };
        let updatedLikes = currentLikes.filter(func(id) { id != caller });
        postLikes.add(postId, (updatedLikes, post.id));
        let newLikesCount = if (post.likesCount > 0) { post.likesCount - 1 } else { 0 };
        let updatedPost = {
          post with likesCount = newLikesCount;
        };
        feedPosts.add(postId, updatedPost);
        ?newLikesCount;
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func createPost(post : FeedPost, key : Text) : async FeedPost {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    // Verify caller matches userId to prevent impersonation
    if (post.userId != caller) {
      Runtime.trap("Unauthorized: Cannot create posts for other users");
    };

    // Check daily limit
    let todayCount = switch (postsCreatedToday.get(caller)) {
      case (null) { 0 };
      case (?count) { count };
    };

    if (todayCount >= 3) {
      Runtime.trap("Daily post limit exceeded: Maximum 3 posts per day");
    };

    let newPostLike : FeedPost = {
      id = key;
      userId = caller;
      userName = post.userName;
      userPhoto = post.userPhoto;
      userAge = post.userAge;
      isVerified = post.isVerified;
      postImage = post.postImage;
      prompt = post.prompt;
      promptAnswer = post.promptAnswer;
      caption = post.caption;
      likesCount = 0;
      createdAt = Time.now();
    };
    feedPosts.add(key, newPostLike);
    
    // Update daily count
    postsCreatedToday.add(caller, todayCount + 1);
    
    newPostLike;
  };

  public shared ({ caller }) func addComment(postId : Text, comment : Comment, key : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    let newComment : Comment = {
      id = key;
      postId = comment.postId;
      userName = comment.userName;
      userPhoto = comment.userPhoto;
      text = comment.text;
      timestamp = Time.now();
    };
    commentMap.add(key, {
      comment = newComment;
      key;
    });
  };

  public shared ({ caller }) func addNotification(notification : Notification, key : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add notifications");
    };

    let newNotification : Notification = {
      notification with
      id = key;
      timestamp = Time.now();
      read = false;
    };
    notificationMap.add(key, {
      notification = newNotification;
      key;
    });
  };

  public shared ({ caller }) func markNotificationsRead(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    // Verify caller can only mark their own notifications as read
    if (caller != userId) {
      Runtime.trap("Unauthorized: Can only mark your own notifications as read");
    };

    for ((key, notifInternal) in notificationMap.entries()) {
      if (notifInternal.notification.toUserId == userId) {
        let updatedNotification = {
          notifInternal.notification with
          read = true;
        };
        notificationMap.add(
          key,
          {
            notification = updatedNotification;
            key = notifInternal.key;
          },
        );
      };
    };
  };

  public query ({ caller }) func getComments(postId : Text) : async [Comment] {
    var filteredComments : [CommentInternal] = [];
    for ((key, commentInternal) in commentMap.entries()) {
      if (commentInternal.comment.postId == postId) {
        let commentInternalArray : [CommentInternal] = [commentInternal];
        filteredComments := filteredComments.concat(commentInternalArray);
      };
    };
    filteredComments.map<CommentInternal, Comment>(func(commentInternal) { commentInternal.comment });
  };

  public query ({ caller }) func getNotifications(userId : Principal) : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    // Verify caller can only view their own notifications
    if (caller != userId) {
      Runtime.trap("Unauthorized: Can only view your own notifications");
    };

    var filteredNotifications : [NotificationInternal] = [];
    for ((key, notificationInternal) in notificationMap.entries()) {
      if (notificationInternal.notification.toUserId == userId) {
        let notificationInternalArray : [NotificationInternal] = [notificationInternal];
        filteredNotifications := filteredNotifications.concat(notificationInternalArray);
      };
    };
    filteredNotifications.map<NotificationInternal, Notification>(func(notificationInternal) { notificationInternal.notification });
  };

  public shared ({ caller }) func updatePostsCreatedToday(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update post counts");
    };

    // Verify caller can only update their own count
    if (caller != userId) {
      Runtime.trap("Unauthorized: Can only update your own post count");
    };

    let count = switch (postsCreatedToday.get(userId)) {
      case (null) { 0 };
      case (?c) { c };
    };
    postsCreatedToday.add(userId, count + 1);
  };

  public query ({ caller }) func getPostsCreatedToday(userId : Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view post counts");
    };

    // Verify caller can only view their own count
    if (caller != userId) {
      Runtime.trap("Unauthorized: Can only view your own post count");
    };

    switch (postsCreatedToday.get(userId)) {
      case (null) { 0 };
      case (?count) { count };
    };
  };

  public shared ({ caller }) func resetDailyLimits() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset daily limits");
    };
    postsCreatedToday.clear();
  };

  public shared ({ caller }) func createNotifications(user : Principal, notifType : NotificationType) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create notifications");
    };

    let notification : Notification = {
      id = "new notification";
      toUserId = user;
      notificationType = notifType;
      fromName = "new notification name";
      fromPhoto = "new notification photo";
      text = "new notification text";
      timestamp = Time.now();
      read = false;
    };
    notification.id;
  };
};
