import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { StoryItem } from "../context/AppContext";
import { useUploadPhoto } from "../hooks/useUploadPhoto";

const YT_API_KEY = "AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFl6oA";

interface FilterSettings {
  brightness: number;
  contrast: number;
  blur: number;
  warm: number;
}

interface YTResult {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    story: Omit<StoryItem, "id" | "createdAt" | "viewerCount" | "isOwnStory">,
  ) => Promise<void>;
  currentUser: { name: string; photo: string };
}

export function StoryUploader({
  isOpen,
  onClose,
  onUpload,
  currentUser,
}: Props) {
  const { uploadFile } = useUploadPhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 1,
    contrast: 1,
    blur: 0,
    warm: 0,
  });
  const [overlayText, setOverlayText] = useState("");
  const [location, setLocation] = useState("");
  const [ytQuery, setYtQuery] = useState("");
  const [ytResults, setYtResults] = useState<YTResult[]>([]);
  const [ytSearching, setYtSearching] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<YTResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState<"pick" | "edit">("pick");

  const filterStyle = `brightness(${filters.brightness}) contrast(${filters.contrast}) blur(${filters.blur}px) saturate(${1 + filters.warm})`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB allowed.");
      return;
    }
    const video = file.type.startsWith("video/");
    setIsVideo(video);
    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
    setStep("edit");
    e.target.value = "";
  };

  // Apply Canvas filters for image export
  const applyFiltersToCanvas = useCallback(async (): Promise<Blob | null> => {
    if (!mediaPreview || isVideo || !canvasRef.current || !imgRef.current)
      return null;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    canvas.width = img.naturalWidth || 400;
    canvas.height = img.naturalHeight || 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Apply CSS-equivalent filter on canvas
    ctx.filter = filterStyle;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";

    // Warm tint overlay
    if (filters.warm > 0) {
      ctx.globalAlpha = filters.warm * 0.3;
      ctx.fillStyle = "rgba(255, 160, 60, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    // Overlay text
    if (overlayText.trim()) {
      ctx.font = `bold ${Math.floor(canvas.width * 0.07)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.12);
      ctx.fillStyle = "#fff";
      ctx.fillText(overlayText, canvas.width / 2, canvas.height * 0.83);
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.82);
    });
  }, [mediaPreview, isVideo, filterStyle, filters.warm, overlayText]);

  const searchYouTube = async () => {
    if (!ytQuery.trim()) return;
    setYtSearching(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(ytQuery)}&key=${YT_API_KEY}`,
      );
      const data = await res.json();
      if (data.items) {
        setYtResults(
          data.items.map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.default.url,
          })),
        );
      }
    } catch {
      toast.error("Music search failed. Try again.");
    } finally {
      setYtSearching(false);
    }
  };

  const handleUpload = async () => {
    if (!mediaFile && !mediaPreview) return;
    setUploading(true);
    setUploadProgress(10);
    try {
      let mediaUrl = mediaPreview ?? "";
      if (mediaFile) {
        if (!isVideo) {
          // Apply canvas filters and upload
          const blob = await applyFiltersToCanvas();
          const fileToUpload = blob
            ? new File([blob], "story.jpg", { type: "image/jpeg" })
            : mediaFile;
          setUploadProgress(40);
          mediaUrl = await uploadFile(fileToUpload);
        } else {
          setUploadProgress(40);
          mediaUrl = await uploadFile(mediaFile);
        }
      }
      setUploadProgress(80);
      await onUpload({
        storyType: isVideo ? "video" : "image",
        userId: "current_user",
        userName: currentUser.name,
        userPhoto: currentUser.photo,
        mediaUrl,
        overlayText: overlayText || undefined,
        location: location || undefined,
        youtubeVidId: selectedMusic?.videoId,
        youtubeTtitle: selectedMusic?.title,
      });
      setUploadProgress(100);
      toast.success("Story posted! ✨");
      resetState();
      onClose();
    } catch {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetState = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setIsVideo(false);
    setFilters({ brightness: 1, contrast: 1, blur: 0, warm: 0 });
    setOverlayText("");
    setLocation("");
    setYtQuery("");
    setYtResults([]);
    setSelectedMusic(null);
    setStep("pick");
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: resetState is stable
  useEffect(() => {
    if (!isOpen) resetState();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: "rgba(0,0,0,0.92)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-white font-bold text-lg">Add Story</h2>
          {step === "edit" && (
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
              data-ocid="story.submit_button"
            >
              {uploading ? `${uploadProgress}%` : "Post"}
            </Button>
          )}
          {step === "pick" && <div className="w-12" />}
        </div>

        {step === "pick" ? (
          /* File Picker */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
            <button
              type="button"
              className="w-full rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 py-16 cursor-pointer active:scale-95 transition-transform"
              onClick={() => fileInputRef.current?.click()}
              data-ocid="story.dropzone"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                }}
              >
                <span className="text-4xl">📸</span>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-lg">
                  Add Photo or Video
                </p>
                <p className="text-white/40 text-sm mt-1">
                  Max 5MB · Videos up to 10s
                </p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="story.upload_button"
            />
          </div>
        ) : (
          /* Edit Step */
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Preview */}
            <div
              className="relative mx-4 rounded-3xl overflow-hidden"
              style={{ height: 280 }}
            >
              {isVideo ? (
                <video
                  src={mediaPreview ?? undefined}
                  className="w-full h-full object-cover"
                  style={{ filter: filterStyle }}
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <img
                  ref={imgRef}
                  src={mediaPreview ?? undefined}
                  className="w-full h-full object-cover"
                  style={{ filter: filterStyle }}
                  alt="Story preview"
                  crossOrigin="anonymous"
                />
              )}
              {/* Canvas for processing (hidden) */}
              <canvas ref={canvasRef} className="hidden" />
              {/* Overlay text preview */}
              {overlayText && (
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="bg-black/50 text-white font-bold px-3 py-1 rounded-lg text-sm">
                    {overlayText}
                  </span>
                </div>
              )}
              {location && (
                <div className="absolute top-3 left-3">
                  <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    📍 {location}
                  </span>
                </div>
              )}
            </div>

            {/* Filters (images only) */}
            {!isVideo && (
              <div className="px-5 mt-4 space-y-3">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                  Filters
                </p>
                <FilterSlider
                  label="Brightness"
                  value={filters.brightness}
                  min={0.5}
                  max={2}
                  step={0.05}
                  onChange={(v) => setFilters((f) => ({ ...f, brightness: v }))}
                />
                <FilterSlider
                  label="Contrast"
                  value={filters.contrast}
                  min={0.5}
                  max={2}
                  step={0.05}
                  onChange={(v) => setFilters((f) => ({ ...f, contrast: v }))}
                />
                <FilterSlider
                  label="Blur"
                  value={filters.blur}
                  min={0}
                  max={10}
                  step={0.5}
                  onChange={(v) => setFilters((f) => ({ ...f, blur: v }))}
                />
                <FilterSlider
                  label="Warm Tone"
                  value={filters.warm}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(v) => setFilters((f) => ({ ...f, warm: v }))}
                />
              </div>
            )}

            {/* Text Overlay */}
            <div className="px-5 mt-4">
              <Input
                placeholder="Add text overlay..."
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value.slice(0, 50))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                data-ocid="story.textarea"
              />
            </div>

            {/* Location */}
            <div className="px-5 mt-3">
              <Input
                placeholder="📍 Add location (e.g. DBS Campus)"
                value={location}
                onChange={(e) => setLocation(e.target.value.slice(0, 30))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                data-ocid="story.input"
              />
            </div>

            {/* YouTube Music */}
            <div className="px-5 mt-4 mb-2">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                🎵 Music
              </p>
              {selectedMusic ? (
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                  <img
                    src={selectedMusic.thumbnail}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {selectedMusic.title}
                    </p>
                    <p className="text-white/40 text-xs">YouTube</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMusic(null)}
                    className="text-white/50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for a song..."
                    value={ytQuery}
                    onChange={(e) => setYtQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchYouTube()}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 flex-1"
                    data-ocid="story.search_input"
                  />
                  <Button
                    size="sm"
                    onClick={searchYouTube}
                    disabled={ytSearching}
                    variant="outline"
                    className="border-white/20 text-white"
                  >
                    {ytSearching ? "..." : "Search"}
                  </Button>
                </div>
              )}
              {ytResults.length > 0 && !selectedMusic && (
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {ytResults.map((r) => (
                    <button
                      key={r.videoId}
                      type="button"
                      onClick={() => {
                        setSelectedMusic(r);
                        setYtResults([]);
                      }}
                      className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-2.5 text-left transition-colors"
                    >
                      <img
                        src={r.thumbnail}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <span className="text-white text-sm font-medium line-clamp-2">
                        {r.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-8" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function FilterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/60 text-xs w-24 flex-shrink-0">{label}</span>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="flex-1"
      />
      <span className="text-white/40 text-xs w-8 text-right">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
