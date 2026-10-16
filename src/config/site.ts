/**
 * Site-wide copy and metadata.
 *
 * Kept in one place so collaborators can review/edit wording without touching
 * components. When a CMS or API is introduced, this is the module to replace.
 */
export const site = {
  name: "RATNA",
  description: "RATNA — a geometric alphabet, one letter per cell.",
  /** Absolute URL of the deployed site, injected at build time by the deploy workflow. */
  url: process.env.SITE_URL ?? "http://localhost:3000",
  tagline: "Coming soon",
  hints: {
    pointer: "Hover to flip · Type to write",
    touch: "Tap a letter to flip it",
  },
} as const;
