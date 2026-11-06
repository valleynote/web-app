export const NOTE_COLOR_SWATCHES = [
  "#3745f1",
  "#2eb6ff",
  "#2f7a3e",
  "#b45309",
  "#7c3aed",
  "#db2777",
  "#eab308",
  "#0d9488",
] as const;

export type NoteColor = (typeof NOTE_COLOR_SWATCHES)[number];

/** `#rrggbb` only — used by note/folder color pickers and server actions. */
export const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: string): boolean {
  return HEX_COLOR_RE.test(value);
}

export function normalizeHexColor(value: string): string {
  return value.toLowerCase();
}

export function isPresetNoteColor(value: string | null): value is NoteColor {
  return (
    value !== null &&
    (NOTE_COLOR_SWATCHES as readonly string[]).includes(value)
  );
}

export function formatNoteUpdatedAt(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function previewNoteText(raw: string | null | undefined) {
  const text = (raw || "").replace(/\s+/g, " ").trim();
  if (!text) return "Empty note";
  return text.length > 90 ? `${text.slice(0, 90).trimEnd()}…` : text;
}

export const MEMO_TILTS = [
  "sticky-memo--tilt-1",
  "sticky-memo--tilt-2",
  "sticky-memo--tilt-3",
  "sticky-memo--tilt-4",
] as const;
