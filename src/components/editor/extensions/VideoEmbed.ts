import { Node, mergeAttributes } from "@tiptap/core";

export type VideoEmbedAttrs = {
  src: string;
  provider?: string;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (attrs: VideoEmbedAttrs) => ReturnType;
    };
  }
}

export const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      provider: { default: "generic" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-video-embed]",
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const src = el.getAttribute("data-src") || el.querySelector("iframe")?.getAttribute("src");
          if (!src) return false;
          return {
            src,
            provider: el.getAttribute("data-provider") || "generic",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = String(HTMLAttributes.src ?? "");
    const provider = String(HTMLAttributes.provider ?? "generic");
    return [
      "div",
      mergeAttributes({
        "data-video-embed": "",
        "data-src": src,
        "data-provider": provider,
        class: "video-embed",
      }),
      [
        "iframe",
        {
          src,
          title: "Embedded video",
          loading: "lazy",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          allowfullscreen: "true",
          frameborder: "0",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideoEmbed:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs,
          }),
    };
  },
});
