export type AvatarData = {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  outfit: string;
  accessory: string;
  eyes: string;
};

export function getAvatarString(data: AvatarData | null): string {
  if (!data) return "🧑";
  return `${data.skinTone}${data.eyes}${data.hairStyle}${data.outfit}${data.accessory}`;
}

export const DEFAULT_AVATAR: AvatarData = {
  skinTone: "🧑🏽",
  hairStyle: "👱",
  hairColor: "🟤",
  outfit: "👕",
  accessory: "😎",
  eyes: "👁️",
};
