import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Int "mo:core/Int";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type UserPhoto = {
    url : Text;
    caption : Text;
  };

  public type UserProfile = {
    name : Text;
    photo : Text;
    age : Nat;
    isVerified : Bool;
    gender : Text;
    planType : Text;
    photos : [UserPhoto];
    coverPhotoIndex : Nat;
    verificationImage : ?Text;
    isDemo : Bool;
    avatarData : ?Text;
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

  public type Match = {
    matchId : Text;
    user1 : Principal;
    user2 : Principal;
    isMatched : Bool;
    firstMessageSent : Bool;
    matchCreatedTime : Time.Time;
    chatDeleted : Bool;
    screenshotAttemptFlag : Bool;
  };

  public type Block = {
    blockId : Text;
    blockerUserId : Principal;
    blockedUserId : Principal;
    blockedAt : Time.Time;
  };

  public type Report = {
    reportId : Text;
    reporterUserId : Principal;
    reportedUserId : Principal;
    reason : Text;
    details : Text;
    reportedAt : Time.Time;
    isReviewed : Bool;
  };

  public type ChatMessage = {
    msgId : Text;
    matchId : Text;
    senderUserId : Principal;
    text : Text;
    sentAt : Time.Time;
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

  public type Error = {
    #alreadyLiked;
    #postNotFound;
    #commentNotFound;
    #invalidPostData;
    #unknown : Text;
    #limitExceeded;
    #blockNotFound;
  };

  type Result<Ok, Err> = {
    #ok : Ok;
    #err : Err;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let notificationMap = Map.empty<Text, NotificationInternal>();
  let commentMap = Map.empty<Text, CommentInternal>();
  let feedPosts = Map.empty<Text, FeedPost>();
  let postLikes = Map.empty<Text, ([Principal], Text)>();
  let postsCreatedToday = Map.empty<Principal, Nat>();
  let matches = Map.empty<Text, Match>();
  let blocks = Map.empty<Text, Block>();
  let reports = Map.empty<Text, Report>();
  let chatMessages = Map.empty<Text, ChatMessage>();
  // Per-user chat themes: key = principal + "_" + matchId
  let chatThemeMap = Map.empty<Text, Text>();

  public shared ({ caller }) func updateUserPhotos(photos : [UserPhoto], coverIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update photos");
    };
    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        let updatedProfile = {
          existingProfile with
          photos = photos;
          coverPhotoIndex = coverIndex;
        };
        userProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("Profile not found");
      };
    };
  };

  public shared ({ caller }) func setVerificationImage(url : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set verification image");
    };
    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        let updatedProfile = {
          existingProfile with
          verificationImage = ?url;
        };
        userProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("Profile not found");
      };
    };
  };

  public shared ({ caller }) func setCoverPhoto(index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set cover photo");
    };
    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        let updatedProfile = {
          existingProfile with
          coverPhotoIndex = index;
        };
        userProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("Profile not found");
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    
    switch (userProfiles.get(user)) {
      case (?profile) {
        // If viewing own profile, return everything
        if (caller == user) {
          return ?profile;
        };
        
        // If viewing another user's profile, hide verificationImage
        ?{
          profile with
          verificationImage = null;
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getPosts() : async [PostData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view likes");
    };
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
        let alreadyLiked = currentLikes.find<Principal>(func(p) { p == caller }) != null;
        if (alreadyLiked) {
          let updatedLikes = currentLikes.filter(func(id) { id != caller });
          postLikes.add(postId, (updatedLikes, post.id));
          let prevCount1 : Int = post.likesCount;
          let newLikesCount = if (prevCount1 > 0) { Int.abs(prevCount1 - 1) } else { 0 };
          let updatedPost = {
            post with likesCount = newLikesCount;
          };
          feedPosts.add(postId, updatedPost);
          ?newLikesCount;
        } else {
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
        let prevCount2 : Int = post.likesCount;
        let newLikesCount = if (prevCount2 > 0) { Int.abs(prevCount2 - 1) } else { 0 };
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
    if (post.userId != caller) {
      Runtime.trap("Unauthorized: Cannot create posts for other users");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view comments");
    };
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

  public shared ({ caller }) func createMatch(user1 : Principal, user2 : Principal, matchId : Text) : async Match {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create matches");
    };
    if (caller != user1 and caller != user2) {
      Runtime.trap("Unauthorized: You must be a participant in the match");
    };
    if (user1 == user2) {
      Runtime.trap("You cannot create a match with yourself");
    };
    let blocked = await isBlocked(user1, user2);
    if (blocked) {
      Runtime.trap("Cannot create match: users have blocked each other");
    };
    let newMatch : Match = {
      matchId = matchId;
      user1 = user1;
      user2 = user2;
      isMatched = true;
      firstMessageSent = false;
      matchCreatedTime = Time.now();
      chatDeleted = false;
      screenshotAttemptFlag = false;
    };
    matches.add(matchId, newMatch);
    newMatch;
  };

  public shared ({ caller }) func deleteMatch(matchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete matches");
    };
    let existingMatch = switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?m) {
        if (m.user1 != caller and m.user2 != caller) {
          Runtime.trap("Unauthorized: You don't have permission to delete this match");
        };
        m;
      };
    };
    matches.remove(matchId);
  };

  public shared ({ caller }) func flagScreenshotAttempt(matchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can flag screenshot attempts");
    };
    let existingMatch = switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?m) {
        if (m.user1 != caller and m.user2 != caller) {
          Runtime.trap("Unauthorized: You don't have permission to flag this match");
        };
        m;
      };
    };
    let updatedMatch = {
      existingMatch with
      screenshotAttemptFlag = true;
    };
    matches.add(matchId, updatedMatch);
  };

  public query ({ caller }) func getMatches() : async [Match] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view matches");
    };
    let userMatches = matches.filter(func(_k, m) { m.user1 == caller or m.user2 == caller });
    userMatches.values().toArray();
  };

  public query ({ caller }) func getMatch(matchId : Text) : async ?Match {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view matches");
    };

    switch (matches.get(matchId)) {
      case (?m) {
        if (m.user1 != caller and m.user2 != caller) {
          Runtime.trap("Unauthorized: You can only view your own matches");
        };
        ?m;
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func toggleBlock(targetUserId : Principal) : async {
    #blockedSuccessfully : Bool;
    #unblockedSuccessfully : Bool;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can block/unblock users");
    };
    if (caller == targetUserId) { Runtime.trap("Cannot block yourself") };
    let blockKey = caller.toText() # "_" # targetUserId.toText();
    switch (blocks.get(blockKey)) {
      case (null) {
        let newBlock : Block = {
          blockId = blockKey;
          blockerUserId = caller;
          blockedUserId = targetUserId;
          blockedAt = Time.now();
        };
        blocks.add(blockKey, newBlock);
        #blockedSuccessfully(true);
      };
      case (?existingBlock) {
        if (existingBlock.blockerUserId == caller and existingBlock.blockedUserId == targetUserId) {
          blocks.remove(blockKey);
          #unblockedSuccessfully(true);
        } else {
          Runtime.trap("Unauthorized: Only the original blocker can unblock");
        };
      };
    };
  };

  public query ({ caller }) func isBlocked(user1 : Principal, user2 : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check block status");
    };
    if (caller != user1 and caller != user2) {
      Runtime.trap("Unauthorized: Can only check block status for yourself");
    };
    let blockKey1 = user1.toText() # "_" # user2.toText();
    let blockKey2 = user2.toText() # "_" # user1.toText();
    blocks.containsKey(blockKey1) or blocks.containsKey(blockKey2);
  };

  public query ({ caller }) func getBlockedUsers(userId : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view blocked users");
    };
    if (caller != userId) {
      Runtime.trap("Unauthorized: Can only view your own blocked users");
    };
    blocks.values().toArray().filter(func(b) { b.blockerUserId == caller }).map<Block, Principal>(func(b) { b.blockedUserId });
  };

  public query ({ caller }) func getBlockingUsers(userId : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view who blocked them");
    };
    if (caller != userId) {
      Runtime.trap("Unauthorized: Can only view who blocked you");
    };
    blocks.values().toArray().filter(func(b) { b.blockedUserId == caller }).map<Block, Principal>(func(b) { b.blockerUserId });
  };

  public shared ({ caller }) func createMessage(incomingMsg : ChatMessage, key : Text) : async {
    #message : ?
    {
      msgId : Text;
      matchId : Text;
      senderUserId : Principal;
      text : Text;
      sentAt : Time.Time;
    };
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    if (incomingMsg.senderUserId != caller) {
      Runtime.trap("Unauthorized: Cannot send messages as another user");
    };
    switch (matches.get(incomingMsg.matchId)) {
      case (?thisMatch) {
        if (thisMatch.user1 != caller and thisMatch.user2 != caller) {
          Runtime.trap("Unauthorized: You are not a participant in this match");
        };
        if (not thisMatch.isMatched) {
          Runtime.trap("Cannot send message - Match not accepted yet by both users");
        };
        let blocked = await isBlocked(thisMatch.user1, thisMatch.user2);
        if (blocked) {
          Runtime.trap("Cannot send message: users have blocked each other");
        };
        let receiverId = if (caller == thisMatch.user1) { thisMatch.user2 } else {
          thisMatch.user1;
        };
        if (not thisMatch.firstMessageSent) {
          let hoursSinceMatchCreated = (Time.now() - thisMatch.matchCreatedTime) / 3600_000_000_000;
          if (hoursSinceMatchCreated >= 24) {
            Runtime.trap("First message window has expired");
          };
          switch (userProfiles.get(caller)) {
            case (?senderProfile) {
              if (senderProfile.gender != "female") {
                Runtime.trap("First message must be sent by female user");
              };
            };
            case (null) {
              Runtime.trap("Sender profile not found");
            };
          };
        };
        let newChatMsg : ChatMessage = {
          msgId = key;
          matchId = incomingMsg.matchId;
          senderUserId = caller;
          text = incomingMsg.text;
          sentAt = Time.now();
        };
        let thisMatchUpdated = {
          thisMatch with firstMessageSent = true;
        };
        matches.add(incomingMsg.matchId, thisMatchUpdated);
        chatMessages.add(key, newChatMsg);
        #message(?newChatMsg);
      };
      case (null) { #message(null) };
    };
  };

  public shared ({ caller }) func deleteChat(matchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete chats");
    };
    switch (matches.get(matchId)) {
      case (?m) {
        if (m.user1 != caller and m.user2 != caller) {
          Runtime.trap("Unauthorized: You can only delete your own chats");
        };
      };
      case (null) {
        Runtime.trap("Match not found");
      };
    };
    let messagesToDelete = chatMessages.filter(func(_k, msg) { msg.matchId == matchId });
    for ((key, _) in messagesToDelete.entries()) {
      chatMessages.remove(key);
    };
    matches.remove(matchId);
  };

  public query ({ caller }) func getMessages(matchId : Text) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve messages");
    };
    switch (matches.get(matchId)) {
      case (?m) {
        if (m.user1 != caller and m.user2 != caller) {
          Runtime.trap("Unauthorized: You can only view messages from your own matches");
        };
      };
      case (null) {
        Runtime.trap("Match not found");
      };
    };
    var filteredMessages : [ChatMessage] = [];
    for ((key, message) in chatMessages.entries()) {
      if (message.matchId == matchId) {
        let messageArray : [ChatMessage] = [message];
        filteredMessages := filteredMessages.concat(messageArray);
      };
    };
    filteredMessages;
  };

  public shared ({ caller }) func reportUser(id : Text, reportedUserId : Principal, reportType : Text, details : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can report other users");
    };
    if (reportedUserId == caller) { Runtime.trap("Cannot report yourself") };
    let newReport : Report = {
      reportId = id;
      reporterUserId = caller;
      reportedUserId = reportedUserId;
      reason = reportType;
      details;
      reportedAt = Time.now();
      isReviewed = false;
    };
    reports.add(id, newReport);
  };

  public query ({ caller }) func getReports() : async [Report] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view reports");
    };
    reports.values().toArray();
  };

  public shared ({ caller }) func markReportReviewed(reportId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark reports reviewed");
    };
    switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report not found") };
      case (?existingReport) {
        let updatedReport = {
          existingReport with
          isReviewed = true;
        };
        reports.add(reportId, updatedReport);
      };
    };
  };

  func getCurrentUserReports(caller : Principal) : [Report] {
    reports.values().toArray().filter(func(r) { r.reporterUserId == caller });
  };

  func getCurrentUserBlocks(caller : Principal) : [Block] {
    blocks.values().toArray().filter(func(b) { b.blockerUserId == caller });
  };

  // ─── Chat Polling: get messages after a given timestamp ───────────────────
  public query ({ caller }) func getMessagesAfter(matchId : Text, afterTimestamp : Time.Time) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve messages");
    };
    switch (matches.get(matchId)) {
      case (?m) {
        if (m.user1 != caller and m.user2 != caller) {
          Runtime.trap("Unauthorized: You can only view messages from your own matches");
        };
      };
      case (null) {
        Runtime.trap("Match not found");
      };
    };
    var filteredMessages : [ChatMessage] = [];
    for ((key, message) in chatMessages.entries()) {
      if (message.matchId == matchId and message.sentAt > afterTimestamp) {
        let messageArray : [ChatMessage] = [message];
        filteredMessages := filteredMessages.concat(messageArray);
      };
    };
    filteredMessages;
  };

  // ─── Chat Themes: save per-user per-chat theme ────────────────────────────
  public shared ({ caller }) func saveChatTheme(matchId : Text, theme : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save chat themes");
    };
    let key = caller.toText() # "_" # matchId;
    chatThemeMap.add(key, theme);
  };

  // ─── Chat Themes: get all themes for current user ─────────────────────────
  public query ({ caller }) func getChatThemes() : async [(Text, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get chat themes");
    };
    let prefix = caller.toText() # "_";
    var result : [(Text, Text)] = [];
    for ((key, theme) in chatThemeMap.entries()) {
      if (key.startsWith(#text prefix)) {
        // Extract matchId by skipping prefix characters
        let prefixSize = prefix.size();
        var i = 0;
        var mid = "";
        for (c in key.chars()) {
          if (i >= prefixSize) {
            mid := mid # Text.fromChar(c);
          };
          i += 1;
        };
        if (mid != "") {
          let pair : [(Text, Text)] = [(mid, theme)];
          result := result.concat(pair);
        };
      };
    };
    result;
  };

};
