export type VideoProvider = "youtube" | "vimeo" | "loom";

export type ParsedVideo = {
  provider: VideoProvider;
  id: string;
  embedUrl: string;
};

const YOUTUBE =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
const VIMEO =
  /(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/i;
const LOOM =
  /(?:https?:\/\/)?(?:www\.)?loom\.com\/(?:share|embed)\/([A-Za-z0-9]+)/i;

export function parseVideoUrl(raw: string): ParsedVideo | null {
  const url = raw.trim();
  if (!url) return null;

  const yt = url.match(YOUTUBE);
  if (yt?.[1]) {
    return {
      provider: "youtube",
      id: yt[1],
      embedUrl: `https://www.youtube.com/embed/${yt[1]}`,
    };
  }

  const vimeo = url.match(VIMEO);
  if (vimeo?.[1]) {
    return {
      provider: "vimeo",
      id: vimeo[1],
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}`,
    };
  }

  const loom = url.match(LOOM);
  if (loom?.[1]) {
    return {
      provider: "loom",
      id: loom[1],
      embedUrl: `https://www.loom.com/embed/${loom[1]}`,
    };
  }

  return null;
}

export function looksLikeVideoUrl(text: string): boolean {
  return parseVideoUrl(text) !== null;
}
