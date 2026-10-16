/**
 * Site-wide copy and metadata.
 *
 * Kept in one place so collaborators can review/edit wording without touching
 * components. When a CMS or API is introduced, this is the module to replace.
 */
export const site = {
  name: "RATNA",
  description: "RATNA — website coming soon.",
  /** Absolute URL of the deployed site, injected at build time by the deploy workflow. */
  url: process.env.SITE_URL ?? "http://localhost:3000",
} as const;
