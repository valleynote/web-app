/** ValleyNote mark from favicon.svg — tinted by notebook/folder color */
function ValleyMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1500 1500"
      fill="currentColor"
      aria-hidden
    >
      <path d="M640.227 1387.121c20.066 32.137-3.036 73.824-40.946 73.824H87.328C60.672 1460.945 39.051 1439.324 39.051 1412.668V593.504c0-48.5 63.531-66.715 89.226-25.621zM1412.668 39.051H234.16c-37.91 0-61.012 41.687-40.945 73.824l461.375 738.234c21.621 34.652 73.824 28.434 86.707-10.293l181.414-544.16c6.59-19.695 25.027-33.023 45.758-33.023h210.511c32.95 0 56.2 32.281 45.762 63.531L867.992 1397.414c-10.441 31.25 12.809 63.531 45.758 63.531h498.844c26.656 0 48.277-21.621 48.277-48.277V87.328c.074-26.656-21.547-48.277-48.203-48.277z" />
    </svg>
  );
}

const tones = {
  muted: "bg-[#e8e6e3] text-[#8a8680]",
  danger: "bg-red-50 text-red-600",
} as const;

export default function NotebookIcon({
  color,
  size = 28,
  tone = "muted",
}: {
  id?: string;
  color?: string;
  size?: number;
  tone?: keyof typeof tones;
}) {
  const iconSize = Math.max(12, Math.round(size * 0.5));
  const tint = color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : null;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[10px] ${
        tint ? "" : tones[tone]
      }`}
      style={{
        width: size,
        height: size,
        ...(tint
          ? {
              background: `color-mix(in srgb, ${tint} 18%, white)`,
              color: tint,
            }
          : null),
      }}
    >
      <ValleyMark size={iconSize} />
    </span>
  );
}
