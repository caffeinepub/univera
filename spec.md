# UNIVÈRA — Swipe-First Redesign

## Current State
- 5-tab bottom nav: Home (Netflix-style), Feed, Likes, Chat, Profile
- Default landing route ("/") is the login page
- After login, users go to /app (SwipeDeck)
- Feed tab (/feed) is a full post feed with create-post functionality
- Home tab (/home) is a Netflix-style homepage with hero carousel and horizontal rows
- Landing.tsx is a static form-based login page with motion fade-in (no animated background)
- Signup/Onboarding requires 6 photos minimum
- BottomNav has 5 tabs: Home, Feed, Likes, Chat, Profile

## Requested Changes (Diff)

### Add
- Animated background to the sign-in screen (Landing.tsx): floating particles or soft gradient pulse, UNIVÈRA branded, lightweight (CSS-only or minimal JS, no heavy libraries)
- Real-time ambient motion on login screen background (floating orbs, particles, or gradient shimmer)

### Modify
- BottomNav: change from 5 tabs (Home, Feed, Likes, Chat, Profile) to 4 tabs: Swipe (/app), Likes (/matches), Chat (/chat/m1), Profile (/profile)
- SwipeDeck (/app) becomes the primary landing after login — already is, just confirm nav reflects it
- Signup photo minimum: change from 6 required to 3 minimum, 6 maximum
- App.tsx: remove feedRoute and homeRoute from active routing (or keep routes but remove from nav)
- BottomNav active state: Swipe tab is active when on /app

### Remove
- Feed tab from BottomNav entirely
- Home tab from BottomNav entirely

## Implementation Plan
1. Update BottomNav.tsx: replace 5-tab array with 4-tab array [Swipe→/app, Likes→/matches, Chat→/chat/m1, Profile→/profile]; use Flame/Zap icon for Swipe
2. Update Landing.tsx: add animated background layer (floating gradient orbs using CSS keyframes + motion/react, lightweight — no canvas, no heavy libs); keep existing login form on top
3. Update Signup.tsx: find photo upload section and change minimum requirement from 6 to 3 (allow proceeding with 3+ photos instead of requiring 6)
4. App.tsx: keep all routes intact (don't break navigation) but BottomNav no longer shows Home or Feed
5. Validate build passes
