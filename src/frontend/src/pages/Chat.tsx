import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, Send, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { ICEBREAKERS, MESSAGES, PROFILES } from "../data/mockData";

const AI_REPLY_SUGGESTIONS = [
  "Okay but now I need to know your coffee order ☕",
  "That's actually really cool, tell me more!",
  "lol same energy, we should link up on campus",
  "Wait are you also in CS?? Small world 👀",
  "Okay your vibe is immaculate honestly",
  "Haha I was literally thinking the same thing",
  "Campus library 6pm, be there 😂",
  "This convo is going places ngl 😭",
  "Okay but have you tried the dhaba near block C?",
  "You sound exactly like my kind of person fr",
];

export function Chat() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { matches } = useApp();

  const match = matches.find((m) => m.id === id) ?? matches[0];
  const profile =
    PROFILES.find((p) => p.id === match?.profileId) ?? PROFILES[2];

  const [messages, setMessages] = useState(
    MESSAGES[match?.id ?? "m1"] ?? MESSAGES.m1,
  );
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const msg = {
      id: String(Date.now()),
      matchId: match?.id ?? "m1",
      senderId: "me",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((p) => [...p, msg]);
    setInput("");
    // Simulate reply
    setTimeout(() => {
      const replies = [
        "That's so cool! 😊",
        "Haha yes exactly!",
        "We should definitely hang out!",
        "Tell me more about that 👀",
        "Same here honestly 😂",
      ];
      const reply = {
        id: String(Date.now() + 1),
        matchId: match?.id ?? "m1",
        senderId: profile.id,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((p) => [...p, reply]);
    }, 1200);
  };

  const askAiReply = () => {
    setAiLoading(true);
    setTimeout(() => {
      const suggestion =
        AI_REPLY_SUGGESTIONS[
          Math.floor(Math.random() * AI_REPLY_SUGGESTIONS.length)
        ];
      setInput(suggestion);
      setAiLoading(false);
    }, 600);
  };

  return (
    <div className="app-shell bg-app flex flex-col h-[100dvh]">
      {/* Header */}
      <header className="glass-dark px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => navigate({ to: "/matches" })}
          className="text-muted-foreground hover:text-foreground"
          data-ocid="chat.cancel_button"
        >
          <ChevronLeft size={24} />
        </button>
        <img
          src={profile.photo}
          alt={profile.name}
          className="w-10 h-10 rounded-full object-cover neon-border-violet"
        />
        <div className="flex-1">
          <div className="font-bold text-foreground text-sm">
            {profile.name}, {profile.age}
          </div>
          <div className="text-xs text-green-400">
            {profile.online ? "Online Now" : "Active recently"}
          </div>
        </div>
        <div className="text-xs text-primary font-bold">
          {profile.compatibility}% match
        </div>
      </header>

      {/* Icebreakers */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 no-scrollbar">
        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
          <Sparkles size={12} className="text-primary" /> AI
        </div>
        {ICEBREAKERS.slice(0, 3).map((q, i) => (
          <button
            type="button"
            key={q}
            onClick={() => send(q)}
            className="flex-shrink-0 px-3 py-1.5 glass-dark rounded-full text-xs text-foreground hover:bg-primary/20 transition-colors"
            data-ocid={`chat.item.${i + 1}`}
          >
            {q.slice(0, 30)}…
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === "me";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i < 5 ? 0 : 0.1 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              data-ocid={`chat.item.${i + 1}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isMe
                    ? "text-white rounded-br-sm"
                    : "glass-card text-foreground rounded-bl-sm"
                }`}
                style={
                  isMe
                    ? {
                        background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                      }
                    : {}
                }
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 glass-dark flex flex-col gap-2 flex-shrink-0">
        {/* Ask AI row */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={askAiReply}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.25))",
              border: "1px solid rgba(139,92,246,0.4)",
              color: "#c4b5fd",
            }}
            data-ocid="chat.toggle"
          >
            <Sparkles size={12} className={aiLoading ? "animate-pulse" : ""} />
            {aiLoading ? "Thinking..." : "Ask AI"}
          </button>
          <span className="text-xs text-muted-foreground">— reply idea</span>
        </div>

        {/* Message input + send */}
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            data-ocid="chat.input"
          />
          <button
            type="button"
            onClick={() => send(input)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
            data-ocid="chat.submit_button"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
