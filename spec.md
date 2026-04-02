# Univera — Edit Profile Fix

## Current State

`src/frontend/src/pages/Profile.tsx` has full edit mode logic:
- `editing` state toggles via a top-right "Edit" button in the header
- Profile picture click opens file upload only when `editing === true`
- Bio, interests, prompts, captions — all conditionally editable in edit mode
- Photo grid add/replace/delete buttons appear only in edit mode
- Save button appears at bottom when `editing === true`

Known bugs:
1. **Edit button not reliably triggering edit mode** — the header has layered absolute elements (cover image, gradient overlay, floating orbs). Some of these may intercept pointer events even on the Edit button. The overlay div uses `pointerEvents: 'none'` but the cover image behind it may intercept touch events on mobile.
2. **No visible, always-accessible "Edit Profile" button** — in view mode, there's only a small top-right glass button. Users may not discover or reach it reliably, especially on mobile.
3. **Profile picture has no edit affordance in view mode** — the camera icon overlay only appears when `editing === true`, meaning there is no persistent visual cue telling users how to change their photo.
4. **Photo grid empty slots are non-interactive in view mode** — correctly disabled, but grid should remain visually clear about what happens in edit mode.
5. **Save does not show loading state per-field** — only a toast after `updateUserPhotos` completes.

## Requested Changes (Diff)

### Add
- A persistent, clearly visible **"Edit Profile"** floating action button or a prominent button below the profile picture that is always visible (not hidden behind overlays)
- A **camera/pencil edit icon badge** always visible on the profile picture (not just in edit mode), that enters edit mode + opens file picker on tap
- **Edit mode indicator**: when editing is active, show a colored top banner or border indicating "Editing" mode so users always know their state
- Photo grid empty slots: when NOT in edit mode, show a subtle "+ Add in edit mode" placeholder; when in edit mode make them tappable and clearly call-to-action

### Modify
- Fix the Edit button z-index / pointer-events: ensure the button in the header has explicit `z-index: 50` and `position: relative` so it is always tappable above the cover image and gradient overlays
- Profile picture: show edit pencil icon badge always (not just when editing), tapping it auto-enters edit mode and opens file picker
- Bio textarea: auto-focus when edit mode is entered
- Interest chips: in view mode show selected interests only; in edit mode show all available tags with toggle; no change to existing logic
- Prompts: ghost prompts should work in both view and edit mode (clicking a ghost prompt auto-enters edit mode)
- Save button: show spinner during save, disable during upload
- Cancel button: resets all local state (bio, interests, promptCards, photos) back to `user` values, exits edit mode

### Remove
- No features removed

## Implementation Plan

1. **Fix z-index on Edit button** — add `style={{ zIndex: 50, position: 'relative' }}` to the Edit toggle button in the header; ensure no sibling absolute element has higher z-index without `pointer-events: none`
2. **Always-visible edit affordance on profile picture** — show a small pink camera badge (bottom-right of profile pic) at all times; tapping it calls `setEditing(true)` then `fileInputRef.current?.click()`
3. **Persistent Edit Profile button** — add a visible "Edit Profile" button row below the stats pills (always in view, not hidden), which toggles edit mode. When in edit mode, show "Save Changes" and "Cancel" buttons in that same row.
4. **Edit mode banner** — when `editing === true`, show a slim neon top bar "✏️ Editing Profile" so users always know they're in edit mode
5. **Cancel resets state** — on cancel, restore `bio`, `interests`, `promptCards`, `photos` from `user` object
6. **Fix photo grid empty slot interaction** — make empty slots always visible; in edit mode they are tappable to open addPhotoInputRef
7. **Bio auto-focus** — useEffect to focus bio textarea when editing becomes true
