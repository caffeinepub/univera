# UNIVÈRA

## Current State
- Home tab has Netflix-style layout with hero carousel and horizontal profile rows
- Hero carousel auto-advances every 4s; Like and View Profile buttons are visible
- Likes from Home tab call `consumeLike()` locally but do NOT call backend `likePost` / persist anything
- No swipe gesture on the hero carousel

## Requested Changes (Diff)

### Add
- Drag/swipe gesture on the hero carousel card: swipe right = like (triggers same flow as Like button), swipe left = pass (advance to next profile)
- Wire like actions from the hero carousel Like button AND swipe-right to backend: call `likePost(profileId)` so the action persists
- Wire like actions from horizontal row profile cards to backend as well

### Modify
- `handleLike` in Home.tsx: after `consumeLike()` succeeds, also call `actor.likePost(profile.id)` (fire-and-forget, no blocking UI)
- Hero carousel: wrap the hero image area in a drag-enabled motion.div that tracks x-axis drag; on release, if deltaX > 80 trigger like, if deltaX < -80 trigger pass (advance heroIndex)

### Remove
- Nothing removed

## Implementation Plan
1. In Home.tsx, import `useBackend` (or however the actor is called in AppContext) to get the backend actor
2. Update `handleLike` to also call `actor.likePost(profile.id)` after `consumeLike()`
3. Add drag gesture to the hero carousel using framer-motion `drag="x"` with `dragConstraints`, `onDragEnd` handler: if offset.x > 80 → like, if offset.x < -80 → pass
4. Show a brief visual feedback: green glow on swipe right, red glow on swipe left
