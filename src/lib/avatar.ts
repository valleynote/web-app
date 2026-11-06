/** DiceBear avatar URLs — https://www.dicebear.com/ */

export type AvatarStyle =
  | "notionists-neutral"
  | "notionists"
  | "big-ears-neutral"
  | "glass"
  | "lorelei"
  | "thumbs"
  | "shapes";

export const AVATAR_PRESET_SEEDS = [
  "valley-1",
  "valley-2",
  "valley-3",
  "valley-4",
  "valley-5",
  "valley-6",
  "valley-7",
  "valley-8",
] as const;

export function dicebearAvatar(
  seed: string,
  options?: {
    style?: AvatarStyle;
    size?: number;
  },
) {
  const style = options?.style ?? "notionists-neutral";
  const size = options?.size ?? 128;
  const params = new URLSearchParams({
    seed: seed || "valleynote",
    size: String(size),
    backgroundColor: "ffffff",
  });

  return `https://api.dicebear.com/9.x/${style}/svg?${params.toString()}`;
}

export function resolveAvatarSrc(
  image: string | null | undefined,
  seed: string,
  size = 128,
) {
  if (image) return image;
  return dicebearAvatar(seed, { size, style: "notionists-neutral" });
}
