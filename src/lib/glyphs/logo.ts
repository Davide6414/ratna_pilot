import type { GlyphShape } from "./alphabet";

/**
 * The RATNA mark: five glyphs laid out on the grid.
 *
 *   R A .
 *   T N .
 *   . . A
 *
 * Positions are relative to the N, which always sits on the centre cell of the
 * page grid. Geometry is traced from the master artwork (100 units = 1 cell),
 * so it differs slightly from the generic alphabet (e.g. the first A hugs the
 * right edge, the N has a white plate behind it).
 */
export interface LogoCell {
  readonly id: string;
  readonly col: number;
  readonly row: number;
  readonly shape: GlyphShape;
}

export const LOGO_CELLS: readonly LogoCell[] = [
  {
    id: "R",
    col: -1,
    row: -1,
    shape: { paths: ["M0 6 H68 A24 24 0 0 1 68 54 H46 L92 100 H0 Z"] },
  },
  {
    id: "A1",
    col: 0,
    row: -1,
    shape: { paths: ["M6 100 L100 6 V100 Z"] },
  },
  {
    id: "T",
    col: -1,
    row: 0,
    shape: { paths: ["M0 6 H93 V36 H59 V100 H29 V36 H0 Z"] },
  },
  {
    id: "N",
    col: 0,
    row: 0,
    shape: {
      backdrop: "M5 8 H97 V100 H5 Z",
      paths: ["M5 8 L51 54 V100 H5 Z", "M51 8 H97 V100 L51 54 Z"],
    },
  },
  {
    id: "A2",
    col: 1,
    row: 1,
    shape: { paths: ["M0 6 V100 H94 Z"] },
  },
];

export function findLogoCell(col: number, row: number): LogoCell | undefined {
  return LOGO_CELLS.find((cell) => cell.col === col && cell.row === row);
}
