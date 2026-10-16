/**
 * Deterministic pseudo-random helpers.
 *
 * The first render happens at build time (static export) and again in the
 * browser during hydration: both must pick the same letters, so anything
 * random in the initial markup has to be derived from a stable seed.
 */

/** Hashes two integers into a float in [0, 1). */
export function hash2(x: number, y: number, seed = 0): number {
  let h = (Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(seed, 0x9e3779b9)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function pick<T>(items: readonly T[], t: number): T {
  return items[Math.floor(t * items.length) % items.length];
}

export function randomItem<T>(items: readonly T[]): T {
  return pick(items, Math.random());
}
