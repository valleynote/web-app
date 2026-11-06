/** Client-safe writing action ids — keep free of process.env / server secrets. */

export const writingActions = [
  "continue",
  "rewrite",
  "shorten",
  "expand",
  "fix_grammar",
  "tone_formal",
  "tone_casual",
  "translate_fr",
  "translate_ar",
] as const;

export type WritingAction = (typeof writingActions)[number];
