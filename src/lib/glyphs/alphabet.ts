/**
 * The RATNA geometric alphabet.
 *
 * Every glyph is drawn on a 100 × 100 cell and follows the rules of the logo:
 * - letters sit on the baseline (y = 100) and against the left edge (x = 0),
 *   leaving a small gap at the top and on the right (box: x 0–94, y 6–100);
 * - shapes are built from bars (30 units thick), 45° diagonals and circles;
 * - no outlines: everything is a solid fill.
 */

export interface GlyphShape {
  /** Solid shapes, painted with the current text colour. */
  readonly paths: readonly string[];
  /** Optional plate painted underneath in the "paper" colour (the white square behind the logo's N). */
  readonly backdrop?: string;
  /** Shapes with holes (O, Q) use the even-odd fill rule. */
  readonly evenOdd?: boolean;
}

const RING_OUTER = "M47 6 A47 47 0 1 1 47 100 A47 47 0 1 1 47 6 Z";
const RING_INNER = "M47 36 A17 17 0 1 0 47 70 A17 17 0 1 0 47 36 Z";

export const ALPHABET = {
  A: { paths: ["M0 100 L94 6 V100 Z"] },
  B: { paths: ["M0 6 H70.5 A23.5 23.5 0 0 1 70.5 53 A23.5 23.5 0 0 1 70.5 100 H0 Z"] },
  C: { paths: ["M94 6 H47 A47 47 0 0 0 47 100 H94 V70 H47 A17 17 0 0 1 47 36 H94 Z"] },
  D: { paths: ["M0 6 H47 A47 47 0 0 1 47 100 H0 Z"] },
  E: { paths: ["M0 6 H94 V28 H30 V42 H76 V64 H30 V78 H94 V100 H0 Z"] },
  F: { paths: ["M0 6 H94 V28 H30 V42 H76 V64 H30 V100 H0 Z"] },
  G: { paths: ["M94 6 H47 A47 47 0 0 0 47 100 H94 V53 H60 V70 H47 A17 17 0 0 1 47 36 H94 Z"] },
  H: { paths: ["M0 6 H30 V40 H64 V6 H94 V100 H64 V66 H30 V100 H0 Z"] },
  I: { paths: ["M32 6 H62 V100 H32 Z"] },
  J: { paths: ["M64 6 H94 V53 A47 47 0 0 1 0 53 H30 A17 17 0 0 0 64 53 Z"] },
  K: { paths: ["M0 6 H30 V40 L64 6 H94 L47 53 L94 100 H64 L30 66 V100 H0 Z"] },
  L: { paths: ["M0 6 H30 V70 H94 V100 H0 Z"] },
  M: { paths: ["M0 6 L47 53 L94 6 V100 H64 V72 H30 V100 H0 Z"] },
  N: { paths: ["M0 6 L47 53 V100 H0 Z", "M47 6 H94 V100 L47 53 Z"] },
  O: { paths: [`${RING_OUTER} ${RING_INNER}`], evenOdd: true },
  P: { paths: ["M0 6 H68 A23.5 23.5 0 0 1 68 53 H30 V100 H0 Z"] },
  Q: { paths: [`${RING_OUTER} ${RING_INNER}`, "M56 62 L94 100 H56 Z"], evenOdd: true },
  R: { paths: ["M0 6 H68 A24 24 0 0 1 68 54 H46 L92 100 H0 Z"] },
  S: {
    paths: [
      "M94 6 H23.5 A23.5 23.5 0 0 0 23.5 53 H40 V30 H94 Z",
      "M0 76 H54 V53 H70.5 A23.5 23.5 0 0 1 70.5 100 H0 Z",
    ],
  },
  T: { paths: ["M0 6 H93 V36 H59 V100 H29 V36 H0 Z"] },
  U: { paths: ["M0 6 H30 V53 A17 17 0 0 0 64 53 V6 H94 V53 A47 47 0 0 1 0 53 Z"] },
  V: { paths: ["M0 6 H30 V40 L47 57 L64 40 V6 H94 V53 L47 100 L0 53 Z"] },
  W: { paths: ["M0 6 H30 V34 H64 V6 H94 V100 L47 53 L0 100 Z"] },
  X: {
    paths: [
      "M0 6 H17 L47 36 L77 6 H94 V23 L64 53 L94 83 V100 H77 L47 70 L17 100 H0 V83 L30 53 L0 23 Z",
    ],
  },
  Y: { paths: ["M0 6 H20 L47 33 L74 6 H94 V26 L62 58 V100 H32 V58 L0 26 Z"] },
  Z: { paths: ["M0 6 H94 V36 L60 70 H94 V100 H0 V70 L34 36 H0 Z"] },
} as const satisfies Record<string, GlyphShape>;

export type Letter = keyof typeof ALPHABET;

export const LETTERS = Object.keys(ALPHABET) as Letter[];

export function isLetter(value: string): value is Letter {
  return Object.hasOwn(ALPHABET, value);
}
