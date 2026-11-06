"use client";

import { dicebearAvatar, type AvatarStyle } from "@/lib/avatar";

export default function UserAvatar({
  seed,
  name,
  image,
  size = 32,
  avatarStyle = "notionists-neutral",
  className = "",
}: {
  seed: string;
  name?: string;
  image?: string | null;
  size?: number;
  avatarStyle?: AvatarStyle;
  className?: string;
}) {
  const src =
    image ||
    dicebearAvatar(seed, { size: size * 2, style: avatarStyle });

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name ? `${name} avatar` : "User avatar"}
      width={size}
      height={size}
      className={`rounded-full border border-solid border-bg-border bg-white object-cover ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
}
