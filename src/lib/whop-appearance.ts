import type { Appearance } from "@whop/elements";

/**
 * Neutral Whop Elements theme — light, gray accent, no brand purple flash.
 * Matches ValleyNote ink/surface tones rather than Whop defaults.
 */
export const valleynoteWhopAppearance: Appearance = {
  theme: {
    appearance: "light",
    accentColor: "gray",
    grayColor: "sand",
    dangerColor: "red",
    successColor: "green",
    infoColor: "sky",
  },
  variables: {
    "--radius": "14px",
    "--font-family":
      '"Switzer", "Inter Tight", system-ui, -apple-system, sans-serif',
  },
};
