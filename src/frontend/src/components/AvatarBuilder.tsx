import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type AvatarData, getAvatarString } from "../types/avatar";

const SKIN_TONES = [
  { emoji: "🧑🏻", label: "Light" },
  { emoji: "🧑🏼", label: "Medium Light" },
  { emoji: "🧑🏽", label: "Medium" },
  { emoji: "🧑🏾", label: "Medium Dark" },
  { emoji: "🧑🏿", label: "Dark" },
];

const EYES_OPTIONS = [
  { emoji: "👁️", label: "Normal" },
  { emoji: "😍", label: "Heart Eyes" },
  { emoji: "🤩", label: "Star Eyes" },
  { emoji: "😎", label: "Cool" },
  { emoji: "🥹", label: "Teary" },
];

const HAIR_STYLES = [
  { emoji: "👱", label: "Straight" },
  { emoji: "🧑\u200d🦱", label: "Curly" },
  { emoji: "🧑\u200d🦰", label: "Red" },
  { emoji: "🧑\u200d🦳", label: "Silver" },
  { emoji: "🧑\u200d🦲", label: "Bald" },
  { emoji: "👩\u200d🦱", label: "Wavy" },
];

const HAIR_COLORS = [
  { emoji: "🟤", label: "Brown" },
  { emoji: "⚫", label: "Black" },
  { emoji: "🟡", label: "Blonde" },
  { emoji: "🔴", label: "Red" },
];

const OUTFITS = [
  { emoji: "👔", label: "Formal" },
  { emoji: "👗", label: "Dress" },
  { emoji: "🧥", label: "Coat" },
  { emoji: "👕", label: "Casual" },
  { emoji: "🥻", label: "Traditional" },
];

const ACCESSORIES = [
  { emoji: "😎", label: "Sunglasses" },
  { emoji: "🎓", label: "Grad Cap" },
  { emoji: "📿", label: "Necklace" },
  { emoji: "🧢", label: "Cap" },
];

interface CategoryRowProps {
  label: string;
  options: { emoji: string; label: string }[];
  selected: string;
  onSelect: (emoji: string) => void;
}

function CategoryRow({ label, options, selected, onSelect }: CategoryRowProps) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.emoji}
            type="button"
            onClick={() => onSelect(opt.emoji)}
            title={opt.label}
            className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
              selected === opt.emoji
                ? "ring-2 ring-violet-500 bg-violet-500/15"
                : "bg-white/5 hover:bg-white/10"
            }`}
            data-ocid={`avatar.${label.toLowerCase().replace(/\s/g, "_")}.toggle`}
          >
            {opt.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

interface AvatarBuilderProps {
  value: AvatarData;
  onChange: (data: AvatarData) => void;
}

export function AvatarBuilder({ value, onChange }: AvatarBuilderProps) {
  const preview = getAvatarString(value);

  const update = (key: keyof AvatarData, emoji: string) =>
    onChange({ ...value, [key]: emoji });

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div
        className="flex flex-col items-center justify-center py-4 rounded-2xl mb-2"
        style={{
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))",
          border: "1.5px solid rgba(139,92,246,0.25)",
        }}
      >
        <div className="text-5xl mb-2 select-none">{preview}</div>
        <p className="text-xs text-muted-foreground">Avatar Preview</p>
      </div>

      <Tabs defaultValue="face">
        <TabsList className="w-full rounded-xl bg-white/5 h-9">
          <TabsTrigger value="face" className="flex-1 text-xs rounded-lg">
            Face
          </TabsTrigger>
          <TabsTrigger value="hair" className="flex-1 text-xs rounded-lg">
            Hair
          </TabsTrigger>
          <TabsTrigger value="outfit" className="flex-1 text-xs rounded-lg">
            Outfit
          </TabsTrigger>
          <TabsTrigger
            value="accessories"
            className="flex-1 text-xs rounded-lg"
          >
            Accessories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="face" className="mt-4 space-y-0">
          <CategoryRow
            label="Skin Tone"
            options={SKIN_TONES}
            selected={value.skinTone}
            onSelect={(e) => update("skinTone", e)}
          />
          <CategoryRow
            label="Eyes"
            options={EYES_OPTIONS}
            selected={value.eyes}
            onSelect={(e) => update("eyes", e)}
          />
        </TabsContent>

        <TabsContent value="hair" className="mt-4 space-y-0">
          <CategoryRow
            label="Hair Style"
            options={HAIR_STYLES}
            selected={value.hairStyle}
            onSelect={(e) => update("hairStyle", e)}
          />
          <CategoryRow
            label="Hair Color"
            options={HAIR_COLORS}
            selected={value.hairColor}
            onSelect={(e) => update("hairColor", e)}
          />
        </TabsContent>

        <TabsContent value="outfit" className="mt-4 space-y-0">
          <CategoryRow
            label="Outfit"
            options={OUTFITS}
            selected={value.outfit}
            onSelect={(e) => update("outfit", e)}
          />
        </TabsContent>

        <TabsContent value="accessories" className="mt-4 space-y-0">
          <CategoryRow
            label="Accessory"
            options={ACCESSORIES}
            selected={value.accessory}
            onSelect={(e) => update("accessory", e)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
