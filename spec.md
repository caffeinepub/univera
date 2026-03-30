# Univera – Real-Time Chat Persistence

## Current State

The app is a full-stack ICP dating app. The Motoko backend already has `createMessage`, `getMessages`, `createMatch`, `getMatches`, `deleteMatch`, `deleteChat`, `toggleBlock`, and `reportUser`. The frontend `Chat.tsx` stores messages entirely in React component state (volatile — lost on refresh). `AppContext.tsx` stores matches in local state seeded from `INITIAL_MATCHES` mock data. Chat themes are persisted to `localStorage`. The backend has no timestamp-based message filtering.

## Requested Changes (Diff)

### Add
- `getMessagesAfter(matchId, afterTimestamp)` Motoko query — returns only `ChatMessage` records with `sentAt > afterTimestamp`, enabling incremental polling
- `saveChatTheme(matchId, theme)` Motoko update — stores per-user, per-chat theme keyed by `callerPrincipal + matchId`
- `getChatThemes()` Motoko query — returns all `(matchId, theme)` pairs for the calling user
- `hooks/useChatPolling.ts` — React hook that polls `getMessagesAfter` every 2500ms, appending only new messages
- First-load banner: "New chat system activated 💬" shown once (keyed by `univera_chat_backend_activated` in localStorage)
- `univera_user_id` in localStorage — UUID generated on first app load, used as local display identity key

### Modify
- `main.mo` — add `chatThemeMap` storage, `getMessagesAfter`, `saveChatTheme`, `getChatThemes`
- `backend.d.ts` and declarations — add type signatures for the three new functions
- `Chat.tsx` — replace volatile state messages with backend-loaded messages; add polling; demo profiles bypass backend (use localStorage); wire send to `actor.createMessage()`
- `AppContext.tsx` — add `userId` (localStorage UUID); add `loadChatMessages`, `sendChatMessage`, `syncChatThemes` helpers
- `Matches.tsx` — call `getMatches()` on actor ready, merge with demo matches

### Remove
- Hard-coded `MESSAGES[match.id]` as the live chat source for non-demo profiles

## Implementation Plan

1. Add three functions to `main.mo` and add `chatThemeMap` storage
2. Update `backend.d.ts` and `declarations/` with new function signatures
3. Create `hooks/useChatPolling.ts`
4. Update `AppContext.tsx` with userId, loadChatMessages, sendChatMessage, syncChatThemes
5. Update `Chat.tsx` for demo/real split + polling + first-load banner
6. Update `Matches.tsx` to load backend matches and merge with demo matches
