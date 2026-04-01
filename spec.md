# UNIVÈRA — Stories, Home Tab, Edit Profile Fix, Swipe Changes

## Current State
- 4-tab bottom nav: Swipe (/app), Likes (/matches), Chat (/chat/:id), Profile (/profile)
- /home route exists but is an old unused Home.tsx (Netflix-style, deprecated)
- Profile.tsx has Edit button (line 319) with `onClick={() => setEditing(!editing)}` — currently unresponsive (likely a z-index/overlay or event bubble issue)
- SwipeDeck.tsx has 3 action buttons: Pass, Super Like, Like
- No stories feature exists
- consumeSuperLike() and superLikesLeft exposed in AppContext
- Demo profiles have 6 photos each (photos[] array in mockData)

## Requested Changes (Diff)

### Add
- **Stories backend**: createStory, getActiveStories, markStoryViewed, deleteStory, getStoryViewers Motoko functions
- **Home tab** (5th tab in BottomNav): path /home-feed, icon = Compass or Home
  - Top: horizontal stories row (circular avatars, gradient ring = new, grey ring = viewed)
  - Below: vertical feed of all demo profiles, each showing all 6 photos as scrollable cards with per-photo Super Like (rose reaction) button
- **StoryViewer component**: fullscreen viewer, tap right/left nav, 5s auto-advance (images), video full duration, mute toggle, viewer count, delete option (owner), story reply input
- **StoryUploader component**: photo/video file picker (max 10s video, 5MB), Canvas API filters (brightness/contrast/blur/warm), text overlay, location tag, YouTube music search via IFrame API, upload to blob-storage
- **Stories row** also accessible from Swipe tab header (small camera/story icon)

### Modify
- **BottomNav**: add 5th tab "Home" pointing to /home-feed between Swipe and Likes
- **Profile.tsx edit button**: trace and fix onClick — ensure no overlapping element is intercepting the click, ensure setEditing(true) triggers properly for both demo and real accounts
- **SwipeDeck.tsx**: remove Super Like button from action bar, keep only ❌ Pass and ❤️ Like
- **AppContext**: add stories state (storiesMap, addStory, deleteStory, markViewed), keep consumeSuperLike for Home feed use
- **App.tsx router**: add /home-feed route pointing to new HomeFeed page
- **Home.tsx**: completely replace with new HomeFeed component

### Remove
- Super Like button from SwipeDeck action bar
- Old Netflix-style Home.tsx content

## Implementation Plan
1. Generate Motoko backend with stories CRUD (createStory, getActiveStories, markStoryViewed, deleteStory, getStoryViewers)
2. Fix Profile.tsx edit button — wrap in stopPropagation, verify no CSS pointer-events blocking, ensure setEditing toggles correctly
3. Remove super like from SwipeDeck action bar (keep pass + like only)
4. Build HomeFeed page:
   - Stories row at top (horizontal scroll, demo + real user stories)
   - Profile feed below (each profile card shows all 6 photos with Super Like per photo)
5. Build StoryViewer component (fullscreen, tap nav, auto-advance, mute, viewers, delete, reply)
6. Build StoryUploader component (file pick, Canvas filters, text/location, YouTube music search)
7. Add stories row/icon to SwipeDeck header
8. Update BottomNav with 5th Home tab
9. Add /home-feed route in router
10. Wire stories state in AppContext
