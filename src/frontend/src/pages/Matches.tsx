import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Heart, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { AdBanner } from "../components/AdBanner";
import { BottomNav } from "../components/BottomNav";
import { MatchModal } from "../components/MatchModal";
import { ProfileViewer } from "../components/ProfileViewer";
import { useApp } from "../context/AppContext";
import { PROFILES } from "../data/mockData";
import type { Profile } from "../data/mockData";

export function Matches() {
  const navigate = useNavigate();
  const { matches, user, likesReceived, dismissLike, acceptLike } = useApp();
  const [tab, setTab] = useState<"matches" | "likes">("matches");
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [viewingMatchId, setViewingMatchId] = useState<string | null>(null);
  const [viewingIsMatched, setViewingIsMatched] = useState(false);

  const matchProfiles = matches
    .map((m) => ({
      match: m,
      profile: PROFILES.find((p) => p.id === m.profileId),
    }))
    .filter(
      (x): x is { match: (typeof matches)[0]; profile: (typeof PROFILES)[0] } =>
        !!x.profile,
    );

  const openMatchProfile = (matchId: string, profile: Profile) => {
    setViewingMatchId(matchId);
    setViewingProfile(profile);
    setViewingIsMatched(true);
  };

  const openLikerProfile = (profile: Profile) => {
    setViewingMatchId(null);
    setViewingProfile(profile);
    setViewingIsMatched(false);
  };

  const closeViewer = () => {
    setViewingProfile(null);
    setViewingMatchId(null);
  };

  return (
    <div className="app-shell bg-app flex flex-col h-[100dvh]">
      <header className="glass-dark px-5 py-4 flex-shrink-0">
        <h1 className="font-display text-2xl font-black text-gradient-violet mb-3">
          Matches
        </h1>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl mb-3"
          style={{ background: "rgba(139,92,246,0.08)" }}
        >
          <button
            type="button"
            onClick={() => setTab("matches")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === "matches" ? "text-white shadow-sm" : "text-purple-400"
            }`}
            style={
              tab === "matches"
                ? { background: "linear-gradient(135deg, #7C3AED, #EC4899)" }
                : {}
            }
            data-ocid="matches.tab"
          >
            Matches
          </button>
          <button
            type="button"
            onClick={() => setTab("likes")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === "likes" ? "text-white shadow-sm" : "text-purple-400"
            }`}
            style={
              tab === "likes"
                ? { background: "linear-gradient(135deg, #7C3AED, #EC4899)" }
                : {}
            }
            data-ocid="matches.tab"
          >
            Likes You
            {likesReceived.length > 0 && (
              <span
                className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{
                  background:
                    tab === "likes" ? "rgba(255,255,255,0.3)" : "#EC4899",
                  color: "white",
                }}
              >
                {likesReceived.length}
              </span>
            )}
          </button>
        </div>

        {tab === "matches" && (
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              placeholder="Search matches..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              data-ocid="matches.search_input"
            />
          </div>
        )}
      </header>

      {/* Ad banner for free users */}
      {!user?.isPro && tab === "matches" && (
        <div className="px-4 pt-3 flex-shrink-0">
          <AdBanner />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {tab === "matches" ? (
          matchProfiles.length === 0 ? (
            <div className="text-center py-16" data-ocid="matches.empty_state">
              <div className="text-5xl mb-4">💜</div>
              <p className="text-muted-foreground">
                No matches yet. Keep swiping!
              </p>
            </div>
          ) : (
            matchProfiles.map(({ match, profile }, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => openMatchProfile(match.id, profile)}
                data-ocid={`matches.item.${i + 1}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="w-14 h-14 rounded-full object-cover neon-border-violet"
                  />
                  {profile.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-background" />
                  )}
                  {profile.isVerified && (
                    <div className="absolute top-0 right-0">
                      <CheckCircle
                        size={14}
                        className="text-blue-500"
                        fill="#3b82f6"
                        color="white"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-foreground">
                      {profile.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {match.matchedAt}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {match.lastMessage}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs font-bold text-primary">
                    {profile.compatibility}%
                  </span>
                  {match.unread > 0 && (
                    <span
                      className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                      style={{ background: "#EC4899" }}
                    >
                      {match.unread}
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )
        ) : // Likes You Tab
        likesReceived.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">❤️</div>
            <p className="text-muted-foreground">No pending likes right now.</p>
            <p className="text-xs text-muted-foreground mt-1">
              When someone likes your photo or prompt, they'll appear here.
            </p>
          </div>
        ) : (
          likesReceived.map((like, i) => {
            const likerProfile = PROFILES.find((p) => p.id === like.profileId);
            if (!likerProfile) return null;
            return (
              <motion.div
                key={like.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl p-4"
                data-ocid={`matches.like.${i + 1}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <button
                    type="button"
                    className="relative flex-shrink-0 cursor-pointer"
                    onClick={() => openLikerProfile(likerProfile)}
                  >
                    <img
                      src={likerProfile.photo}
                      alt={likerProfile.name}
                      className="w-14 h-14 rounded-full object-cover"
                      style={{ border: "2px solid rgba(236,72,153,0.4)" }}
                    />
                    {likerProfile.isVerified && (
                      <div className="absolute top-0 right-0">
                        <CheckCircle
                          size={14}
                          className="text-blue-500"
                          fill="#3b82f6"
                          color="white"
                        />
                      </div>
                    )}
                  </button>
                  <div className="flex-1">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 mb-0.5 hover:opacity-80 transition-opacity"
                      onClick={() => openLikerProfile(likerProfile)}
                    >
                      <span className="font-bold text-foreground text-sm">
                        {likerProfile.name}, {likerProfile.age}
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {likerProfile.compatibility}%
                      </span>
                    </button>
                    <p className="text-xs text-muted-foreground">
                      {like.likedCard === "photo"
                        ? "📸 Liked your photo"
                        : `✨ Liked your prompt: "${like.promptText}"`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {like.timestamp}
                    </p>
                  </div>
                </div>

                {like.comment ? (
                  <div
                    className="rounded-xl px-3 py-2.5 mb-3 text-sm"
                    style={{
                      background: "rgba(139,92,246,0.07)",
                      border: "1px solid rgba(139,92,246,0.15)",
                      color: "#4B5563",
                    }}
                  >
                    <span className="text-purple-400 mr-1">"</span>
                    {like.comment}
                    <span className="text-purple-400 ml-1">"</span>
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => dismissLike(like.id)}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
                    style={{ background: "rgba(0,0,0,0.06)", color: "#888" }}
                    data-ocid={`matches.pass.${i + 1}`}
                  >
                    <X size={14} /> Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => acceptLike(like)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                    }}
                    data-ocid={`matches.match.${i + 1}`}
                  >
                    <Heart size={14} fill="white" /> Match
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav />
      <MatchModal />

      {/* Profile Viewer */}
      <ProfileViewer
        profile={viewingProfile}
        isOpen={!!viewingProfile}
        onClose={closeViewer}
        onSwipe={closeViewer}
        isMatched={viewingIsMatched}
        onMessage={
          viewingMatchId
            ? () => {
                closeViewer();
                navigate({ to: `/chat/${viewingMatchId}` });
              }
            : undefined
        }
      />
    </div>
  );
}
