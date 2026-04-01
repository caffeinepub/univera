import { useNavigate } from "@tanstack/react-router";
import { Camera, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";
import { StoryUploader } from "../components/StoryUploader";
import { StoryViewer } from "../components/StoryViewer";
import { useApp } from "../context/AppContext";
import { PROFILES } from "../data/mockData";

export function HomeFeed() {
  const navigate = useNavigate();
  const {
    stories,
    viewedStories,
    addStory,
    deleteStory,
    markStoryViewed,
    user,
    consumeSuperLike,
    superLikesLeft,
    setShowUpgradeModal,
    setUpgradeReason,
  } = useApp();

  const [showUploader, setShowUploader] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [superLikedPhotos, setSuperLikedPhotos] = useState<
    Record<string, boolean>
  >({});

  const openStory = (index: number) => setViewerIndex(index);

  const handleSuperLike = (profileId: string, photoIndex: number) => {
    const key = `${profileId}_${photoIndex}`;
    if (superLikedPhotos[key]) return;
    if (superLikesLeft === 0) {
      setUpgradeReason("Get more Super Likes");
      setShowUpgradeModal(true);
      return;
    }
    const ok = consumeSuperLike();
    if (ok) {
      setSuperLikedPhotos((prev) => ({ ...prev, [key]: true }));
      toast.success("Super Liked! ⭐", { duration: 1500 });
    }
  };

  const currentUserProfile = {
    name: user?.name ?? "You",
    photo: user?.photoUrl ?? "/assets/generated/maya-portrait.dim_400x500.jpg",
  };

  return (
    <div className="app-shell bg-app flex flex-col h-[100dvh] overflow-hidden">
      {/* Header */}
      <header className="glass-dark px-5 py-4 flex items-center justify-between flex-shrink-0">
        <h1 className="font-display text-2xl font-black text-gradient-violet">
          UNIVÈRA
        </h1>
        <button
          type="button"
          onClick={() => setShowUploader(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform active:scale-90"
          style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
          data-ocid="home.upload_button"
        >
          <Camera size={18} />
        </button>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Stories Row */}
        <div className="px-4 pt-4 pb-3">
          <div
            className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Own story */}
            <StoryCircle
              name="Your Story"
              photo={currentUserProfile.photo}
              hasStory={false}
              isViewed={false}
              isAddButton
              onClick={() => setShowUploader(true)}
            />
            {/* Other stories */}
            {stories.map((story, i) => (
              <StoryCircle
                key={story.id}
                name={story.userName}
                photo={story.userPhoto}
                hasStory
                isViewed={viewedStories.includes(story.id)}
                onClick={() => openStory(i)}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-border/30 mb-4" />

        {/* Profile Feed */}
        <div className="px-4 pb-4 space-y-8">
          {PROFILES.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-3xl overflow-hidden"
              data-ocid={`home.item.${profile.id}`}
            >
              {/* Profile header */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-foreground">
                    {profile.name}, {profile.age}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {profile.major} · {profile.year}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      profile.onlineStatus === "online"
                        ? "bg-green-400"
                        : profile.onlineStatus === "away"
                          ? "bg-yellow-400"
                          : "bg-gray-500"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground capitalize">
                    {profile.onlineStatus}
                  </span>
                </div>
              </div>

              {/* 6 Photos */}
              <div className="px-3 space-y-3">
                {(
                  profile.photos ?? [
                    { url: profile.photo, caption: profile.bio },
                  ]
                ).map((photo, photoIdx) => {
                  const key = `${profile.id}_${photoIdx}`;
                  const isLiked = superLikedPhotos[key];
                  return (
                    <div
                      key={`p-${profile.id}-${photo.url.slice(-15)}`}
                      className="relative rounded-2xl overflow-hidden"
                      style={{ height: 280 }}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://picsum.photos/seed/${profile.id}_${photoIdx}/400/560`;
                        }}
                      />
                      {/* Gradient overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                        }}
                      />
                      {/* Caption */}
                      {photo.caption && (
                        <div className="absolute bottom-3 left-3 right-12">
                          <p
                            className="text-white text-sm font-medium"
                            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                          >
                            {photo.caption}
                          </p>
                        </div>
                      )}
                      {/* Super Like button */}
                      <motion.button
                        type="button"
                        onClick={() => handleSuperLike(profile.id, photoIdx)}
                        animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all"
                        style={{
                          background: isLiked
                            ? "linear-gradient(135deg, #F59E0B, #EF4444)"
                            : "rgba(0,0,0,0.45)",
                          border: isLiked
                            ? "none"
                            : "1px solid rgba(255,255,255,0.3)",
                        }}
                        data-ocid={`home.toggle.${photoIdx + 1}`}
                      >
                        <Star
                          size={18}
                          className={isLiked ? "text-white" : "text-white/80"}
                          fill={isLiked ? "white" : "none"}
                        />
                      </motion.button>
                    </div>
                  );
                })}
              </div>

              {/* Interests */}
              {profile.interests && (
                <div className="px-5 py-3 flex flex-wrap gap-2">
                  {profile.interests.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* View full profile */}
              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() =>
                    navigate({ to: "/profile/$id", params: { id: profile.id } })
                  }
                  className="w-full py-3 rounded-2xl font-semibold text-sm text-white transition-all active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  }}
                  data-ocid="home.secondary_button"
                >
                  View Full Profile
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer space */}
        <div className="h-4" />
      </div>

      <BottomNav />

      {/* Story Uploader */}
      <StoryUploader
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onUpload={addStory}
        currentUser={currentUserProfile}
      />

      {/* Story Viewer */}
      <AnimatePresence>
        {viewerIndex !== null && (
          <StoryViewer
            stories={stories}
            startIndex={viewerIndex}
            onClose={() => setViewerIndex(null)}
            onDelete={deleteStory}
            onMarkViewed={markStoryViewed}
            onReply={(_userId, text) => {
              toast.success(`Reply sent: ${text.slice(0, 30)}`);
            }}
            currentUserId={user ? `user_${user.name}` : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface StoryCircleProps {
  name: string;
  photo: string;
  hasStory: boolean;
  isViewed: boolean;
  isAddButton?: boolean;
  onClick: () => void;
}

function StoryCircle({
  name,
  photo,
  hasStory,
  isViewed,
  isAddButton,
  onClick,
}: StoryCircleProps) {
  const ringClass = hasStory && !isViewed ? "p-0.5" : "p-0.5";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
      data-ocid="home.link"
    >
      <div
        className={`${ringClass} rounded-full`}
        style={{
          background:
            hasStory && !isViewed
              ? "linear-gradient(135deg, #7C3AED, #EC4899)"
              : isViewed
                ? "rgba(107,114,128,0.5)"
                : "linear-gradient(135deg, #7C3AED, #EC4899)",
        }}
      >
        <div className="w-14 h-14 rounded-full overflow-hidden bg-muted border-2 border-background relative">
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://picsum.photos/seed/${name}/100/100`;
            }}
          />
          {isAddButton && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-white text-2xl font-light">+</span>
            </div>
          )}
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium max-w-[60px] text-center truncate">
        {isAddButton ? "Your Story" : name}
      </span>
    </button>
  );
}
