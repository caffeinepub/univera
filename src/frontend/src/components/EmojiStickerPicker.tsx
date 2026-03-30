import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EMOJIS = [
  "😀",
  "😂",
  "🥹",
  "😍",
  "🥰",
  "😘",
  "😎",
  "🤩",
  "🥳",
  "😭",
  "😅",
  "🤣",
  "❤️",
  "💜",
  "💛",
  "💙",
  "🔥",
  "✨",
  "💯",
  "🎉",
  "👍",
  "🙌",
  "💪",
  "🤝",
  "😊",
  "🫶",
  "💕",
  "😏",
  "🤭",
  "😴",
  "🙄",
  "😤",
  "🫠",
  "🥺",
  "😇",
  "🤗",
  "😆",
  "🥲",
  "😋",
  "😌",
];

const IMAGE_STICKER_PACKS = {
  love: [
    {
      src: "/assets/generated/sticker-love-hey-cutie-transparent.dim_512x512.png",
      label: "Hey cutie 👀",
      fallback: "👀",
    },
    {
      src: "/assets/generated/sticker-love-miss-you-transparent.dim_512x512.png",
      label: "Miss you ❤️",
      fallback: "❤️",
    },
    {
      src: "/assets/generated/sticker-love-heart-transparent.dim_512x512.png",
      label: "💕 Kiss",
      fallback: "💕",
    },
  ],
  bff: [
    {
      src: "/assets/generated/sticker-bff-lets-chill-transparent.dim_512x512.png",
      label: "Let's chill 😎",
      fallback: "😎",
    },
    {
      src: "/assets/generated/sticker-bff-bestie-transparent.dim_512x512.png",
      label: "Bestie 🤝",
      fallback: "🤝",
    },
    {
      src: "/assets/generated/sticker-bff-party-transparent.dim_512x512.png",
      label: "Party! 🎉",
      fallback: "🎉",
    },
  ],
  meme: [
    {
      src: "/assets/generated/sticker-meme-bruh-transparent.dim_512x512.png",
      label: "Bruh 😐",
      fallback: "😐",
    },
    {
      src: "/assets/generated/sticker-meme-what-transparent.dim_512x512.png",
      label: "What?? 😳",
      fallback: "😳",
    },
    {
      src: "/assets/generated/sticker-meme-lol-transparent.dim_512x512.png",
      label: "LOL 😂",
      fallback: "😂",
    },
  ],
};

interface EmojiStickerPickerProps {
  onSelect: (text: string) => void;
  onClose: () => void;
}

interface StickerButtonProps {
  src: string;
  label: string;
  fallback: string;
  onSelect: (val: string) => void;
}

function StickerButton({ src, label, fallback, onSelect }: StickerButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(src)}
      className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-all hover:scale-110 active:scale-95 w-full"
      data-ocid="chat.toggle"
    >
      <img
        src={src}
        alt={label}
        className="w-16 h-16 object-contain"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const next = target.nextElementSibling as HTMLElement | null;
          if (next) next.style.display = "flex";
        }}
      />
      <span
        className="text-3xl hidden items-center justify-center w-16 h-16"
        aria-hidden="true"
      >
        {fallback}
      </span>
      <span className="text-[9px] text-white/60 text-center leading-tight line-clamp-1 w-full">
        {label}
      </span>
    </button>
  );
}

export function EmojiStickerPicker({
  onSelect,
  onClose,
}: EmojiStickerPickerProps) {
  const handleSelect = (text: string) => {
    onSelect(text);
    onClose();
  };

  return (
    <div
      className="absolute bottom-full left-0 mb-2 w-80 rounded-2xl overflow-hidden z-50 shadow-xl"
      style={{
        background: "#1a1030",
        border: "1px solid rgba(139,92,246,0.3)",
      }}
      data-ocid="chat.popover"
    >
      <Tabs defaultValue="emoji">
        <TabsList className="w-full rounded-none border-b border-white/10 bg-transparent h-10">
          <TabsTrigger value="emoji" className="flex-1 text-xs">
            😀 Emoji
          </TabsTrigger>
          <TabsTrigger value="love" className="flex-1 text-xs">
            ❤️ Love
          </TabsTrigger>
          <TabsTrigger value="bff" className="flex-1 text-xs">
            🤝 BFF
          </TabsTrigger>
          <TabsTrigger value="meme" className="flex-1 text-xs">
            😂 Meme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emoji" className="p-3 m-0">
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => handleSelect(e)}
                className="w-8 h-8 text-lg flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                data-ocid="chat.toggle"
              >
                {e}
              </button>
            ))}
          </div>
        </TabsContent>

        {(["love", "bff", "meme"] as const).map((pack) => (
          <TabsContent key={pack} value={pack} className="p-3 m-0">
            <div className="grid grid-cols-3 gap-2">
              {IMAGE_STICKER_PACKS[pack].map((s) => (
                <StickerButton
                  key={s.src}
                  src={s.src}
                  label={s.label}
                  fallback={s.fallback}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
