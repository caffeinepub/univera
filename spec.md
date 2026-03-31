# Univera — Hinge-Style Profile View Improvements

## Current State
- ProfilePage.tsx exists at `/profile/$id` with photos displayed as aspect-ratio cards (rounded-2xl)
- Photos may appear edge-to-edge on some screen sizes — user reports full-screen feel
- Bottom action bar always shows Pass / Super Like / Like regardless of match status
- Online status is a static boolean (`online: boolean`) in mockData.ts — no tri-state, no user control
- No online status toggle in Profile.tsx (settings screen)
- Demo profiles have `interests: string[]` already populated
- SwipeDeck uses a dedicated "View Profile" button (Eye icon) — card tap does NOT navigate (correct)
- Matches tab taps: unknown if it navigates to ProfilePage

## Requested Changes (Diff)

### Add
- Tri-state `onlineStatus: "online" | "away" | "offline"` field to Profile interface and all 8 demo profiles in mockData.ts
- Online status toggle/selector in Profile.tsx settings section (user can set their own status)
- `currentUserOnlineStatus` state in AppContext persisted to localStorage
- "Send Message" button in ProfilePage bottom bar when the viewed user is already matched (replaces Pass/SuperLike/Like)
- Matches page: tapping a match card navigates to `/profile/$id` (not chat)

### Modify
- ProfilePage.tsx PhotoBlock: ensure photos have horizontal padding (mx-4 or similar) and are NOT edge-to-edge — clearly card-style with visible margins on sides, like Hinge
- ProfilePage.tsx header: show tri-state online status dot (green=online, yellow=away, grey=offline) with text label
- mockData.ts: replace `online: boolean` with `onlineStatus: "online" | "away" | "offline"` across all 8 profiles

### Remove
- `online: boolean` field from Profile interface (replaced by onlineStatus string)

## Implementation Plan
1. Update Profile interface in mockData.ts: replace `online: boolean` → `onlineStatus: "online" | "away" | "offline"`
2. Update all 8 demo profiles with appropriate onlineStatus values
3. Update ProfilePage.tsx:
   - PhotoBlock: add `mx-4` padding so photos are NOT edge-to-edge (Hinge-style card look)
   - Header: show colored dot + status text based on `onlineStatus`
   - Bottom bar: if `isMatched` (check matches array from context), show "Send Message" button → navigate to `/chat/$id`
4. Add `currentUserOnlineStatus` to AppContext with localStorage persistence
5. Profile.tsx: add "Online Status" setting with 3 options (Online / Away / Offline) above the log out section
6. Matches.tsx: ensure tapping a match navigates to `/profile/$id`
