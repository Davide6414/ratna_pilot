"use client";

import { memo, useMemo, useRef, type CSSProperties } from "react";
import { Glyph } from "@/components/Glyph/Glyph";
import { findLogoCell, LOGO_CELLS, type LogoCell } from "@/lib/glyphs/logo";
import { useGridMetrics } from "./useGridMetrics";
import styles from "./LogoGrid.module.css";

interface Cell {
  readonly id: string;
  readonly logo?: LogoCell;
}

/**
 * Full-screen ruled grid with the RATNA logo on the centre cells; every other
 * cell is left blank.
 *
 * Purely decorative (`aria-hidden`): the page provides the accessible name.
 */
export function LogoGrid() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pitchRef = useRef<HTMLDivElement>(null);

  const { cols, rows } = useGridMetrics(rootRef, pitchRef);
  const cells = useMemo(() => buildCells(cols, rows), [cols, rows]);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <div ref={pitchRef} className={styles.pitch} />
      <div className={styles.grid} style={{ "--cols": cols } as CSSProperties}>
        {cells.map((cell) =>
          cell.logo ? (
            <LogoTile key={cell.id} logo={cell.logo} />
          ) : (
            <div key={cell.id} className={styles.cell} />
          ),
        )}
      </div>
    </div>
  );
}

const LogoTile = memo(function LogoTile({ logo }: { logo: LogoCell }) {
  // Letters turn over one by one, in reading order: R, A, T, N, A.
  const delay = 150 + LOGO_CELLS.indexOf(logo) * 110;
  return (
    <div className={`${styles.cell} ${styles.logoTile}`}>
      <div className={styles.intro} style={{ "--intro-delay": `${delay}ms` } as CSSProperties}>
        <Glyph shape={logo.shape} />
      </div>
    </div>
  );
});

function buildCells(cols: number, rows: number): Cell[] {
  const halfCols = (cols - 1) / 2;
  const halfRows = (rows - 1) / 2;
  const cells: Cell[] = [];
  for (let row = -halfRows; row <= halfRows; row++) {
    for (let col = -halfCols; col <= halfCols; col++) {
      cells.push({ id: `${col},${row}`, logo: findLogoCell(col, row) });
    }
  }
  return cells;
}
