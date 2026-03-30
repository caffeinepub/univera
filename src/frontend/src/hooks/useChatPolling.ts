import { useCallback, useEffect, useRef, useState } from "react";
import type { backendInterface } from "../backend";
import type { ChatMessage } from "../backend.d";

// Extended actor type that includes methods declared in backend.d.ts but absent from backend.ts
type ActorWithPolling = backendInterface & {
  getMessagesAfter(
    matchId: string,
    afterTimestamp: bigint,
  ): Promise<Array<ChatMessage>>;
};

interface UseChatPollingOptions {
  actor: backendInterface | null;
  matchId: string;
  isDemo: boolean;
  enabled: boolean;
  afterTimestamp?: bigint;
}

interface UseChatPollingResult {
  newMessages: ChatMessage[];
  resetPolling: () => void;
}

export function useChatPolling({
  actor,
  matchId,
  isDemo,
  enabled,
  afterTimestamp = 0n,
}: UseChatPollingOptions): UseChatPollingResult {
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]);
  const lastTimestampRef = useRef<bigint>(afterTimestamp);

  // When afterTimestamp prop increases (set once after initial load), advance the ref
  useEffect(() => {
    if (afterTimestamp > lastTimestampRef.current) {
      lastTimestampRef.current = afterTimestamp;
    }
  }, [afterTimestamp]);

  // Reset state when matchId changes so stale messages from prior chat don't leak
  // biome-ignore lint/correctness/useExhaustiveDependencies: matchId is the intended trigger; ref mutation is the side-effect
  useEffect(() => {
    setNewMessages([]);
    lastTimestampRef.current = 0n;
  }, [matchId]);

  const resetPolling = useCallback(() => {
    setNewMessages([]);
  }, []);

  useEffect(() => {
    if (!enabled || isDemo || !actor) return;

    // Cast to extended type — getMessagesAfter exists at runtime (declared in backend.d.ts)
    const extActor = actor as ActorWithPolling;

    const poll = async () => {
      try {
        const msgs = await extActor.getMessagesAfter(
          matchId,
          lastTimestampRef.current,
        );
        if (msgs.length > 0) {
          const maxTs = msgs.reduce(
            (max, m) => (m.sentAt > max ? m.sentAt : max),
            lastTimestampRef.current,
          );
          lastTimestampRef.current = maxTs;
          setNewMessages((prev) => [...prev, ...msgs]);
        }
      } catch {
        // Ignore polling errors
      }
    };

    const intervalId = setInterval(poll, 2500);
    return () => clearInterval(intervalId);
  }, [actor, matchId, isDemo, enabled]);

  return { newMessages, resetPolling };
}
