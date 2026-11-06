/**
 * TipTap/ProseMirror attrs often use null-prototype objects.
 * Server Actions / some serializers drop those attrs (image src, link href,
 * highlight color, textStyle color/fontSize, video src, …).
 * Always plain-clone before sending JSON over the wire or into Prisma.
 */
export function plainCloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
