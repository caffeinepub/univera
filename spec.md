# Univera Advanced Chat & Personalization System

## Current State
Univers already has:
- Chat.tsx with themes (default/pink/purple/yellow/blue), AI reply button, emoji/sticker picker, safety menu (report/block/remove/delete)
- EmojiStickerPicker.tsx with emoji grid + 3 Unicode sticker packs (Love, Funny, BFF)
- AvatarBuilder.tsx with skin tone, hair style/color, outfit, accessory (no tabs, no eyes)
- ProfileViewer.tsx with photo display, ImgWithFallback component
- Motion animations on messages (fade+slide in)
- MockData with profiles containing photos[] array with url+caption fields

## Requested Changes (Diff)

### Add
- Generated image sticker packs: Love (9 stickers), BFF (9 stickers), Meme (9 stickers) — cute cartoon Gen-Z style PNGs
- Eyes customization category in AvatarBuilder
- Tabbed UI for AvatarBuilder: Face | Hair | Outfit | Accessories
- Enhanced AI reply suggestions panel with 4 specific prompt buttons: "Ask about hobbies", "Start conversation", "Flirty reply", "Funny reply" + optional free-form AI input
- Sticker send animation (bounce/pop effect with motion)
- Match confetti animation on new match
- Seen/delivered status on messages (✓ delivered, ✓✓ seen)
- Profile photo gallery: main photo at top + scrollable captions gallery in ProfileViewer

### Modify
- EmojiStickerPicker: Add Meme sticker tab ("Bruh 😐", "What?? 😳", "LOL 😂" etc.), upgrade sticker display to show image stickers where available with fallback to emoji
- AvatarBuilder: Reorganize into 4 tabs (Face/Hair/Outfit/Accessories), add Eyes options, keep live preview center
- Chat.tsx: Improve AI suggestions UI (4 contextual buttons + text field), add seen/delivered status, add per-message sticker animation
- Profile photos: Ensure photos[] mapping renders with captions, main profileImage shown at top, fallback to avatar/placeholder, lazy loading skeletons
- AppContext/mockData: Ensure profile.photos array is properly populated with url+caption objects

### Remove
- Nothing removed

## Implementation Plan
1. Update EmojiStickerPicker with Meme tab + image stickers from /assets/generated/stickers/ with emoji fallback
2. Refactor AvatarBuilder to use shadcn Tabs (Face | Hair | Outfit | Accessories); add Eyes category
3. Enhance Chat.tsx AI suggestions: replace single button with 4 contextual buttons (Ask about hobbies / Start conversation / Flirty reply / Funny reply) + optional AI input field
4. Add seen/delivered status rendering on messages (last sent message shows ✓✓ seen or ✓ delivered)
5. Add sticker bounce animation using motion.div with spring physics on sticker messages
6. Fix ProfileViewer to properly render profile.photos[] with url+caption, main photo at top, captions below, loading skeleton, onError fallback
7. Ensure mockData profiles all have photos[] with url+caption correctly populated
