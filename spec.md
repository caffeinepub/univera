# Univera — Profile Page UI/UX Hinge Redesign

## Current State
The Profile page (`src/frontend/src/pages/Profile.tsx`) exists at ~1272 lines. It has:
- A small edit toggle in the header (easy to miss)
- Profile completion bar
- Verification banner
- A photo grid (functional but not visually engaging)
- Prompts section (already wired)
- Interests as tags
- Bio field
- Avatar builder, selfie verification, boost button
- Help Center, Admin Panel, Logout buttons scattered in the main flow
- Online status toggle

## Requested Changes (Diff)

### Add
- Large hero profile header: full-width rounded photo + name/age/course overlay + verified badge + prominent "Edit Profile" button
- 2x3 photo grid section with add/delete/reorder controls; empty state CTA "Add Photos"
- Hinge-style prompts section with 3 default prompts ("My simple pleasure is...", "Dating me is like...", "Biggest green flag...") editable inline
- "Preview Profile" button that opens swipe card UI modal
- Actionable profile completion tips ("Add photos to get more matches") as a dismissible card
- Settings/Utility section at the bottom: Help Center, Admin Panel, Logout grouped cleanly
- Smooth card layout animations (framer-motion)

### Modify
- Profile header: replace small header with a large hero photo card with gradient overlay, name/age/course text, verified badge, and a clear visible "Edit Profile" CTA button
- Interests: already shown as chips/tags — keep but clean up spacing
- Edit mode: make it a clear full-width button rather than a tiny icon in header
- Move Help Center / Admin Panel / Logout to a bottom "Settings" card section
- Completion tips: convert to actionable card with specific tips, not just a progress bar

### Remove
- Help Center / Admin / Logout from scattered positions — consolidate to bottom settings section
- Excessive empty space between sections

## Implementation Plan
1. Redesign the top section as a large hero photo card (aspect-ratio 3:4, rounded-3xl, gradient overlay at bottom) showing name, age, major, verified badge, and an "Edit Profile" button overlaid
2. Below hero: Profile Completion card with actionable tips (icon + text per tip)
3. Photos Section: 2x3 grid with add/delete/replace controls; empty state with upload CTA
4. Prompts Section: 3 Hinge-style prompt cards, each editable on tap; add new prompt flow
5. About + Interests: bio text + interest chips — compact, no wasted space
6. Preview Profile: full-width button that opens a modal showing the swipe card view of the user's own profile
7. Settings Section: grouped card at bottom with Help Center, Admin Panel, Logout, Theme toggle, Online Status
8. Apply framer-motion animations: card entrance, editing transitions, photo add/remove
