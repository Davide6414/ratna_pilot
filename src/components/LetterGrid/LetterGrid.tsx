"use client";

import {
  memo,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  type AnimationEvent,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { ExtrudedGlyph, Glyph } from "@/components/Glyph/Glyph";
import { ALPHABET, type Letter } from "@/lib/glyphs/alphabet";
import { findLogoCell, type LogoCell } from "@/lib/glyphs/logo";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cellId, initialTile, tileReducer, type Face, type TileState } from "./tileState";
import { useAccentFlip, useAmbientFlips, useTyping } from "./useGridBehaviours";
import { useGridMetrics } from "./useGridMetrics";
import { usePointerDepth } from "./usePointerDepth";
import styles from "./LetterGrid.module.css";

interface Cell {
  readonly id: string;
  readonly col: number;
  readonly row: number;
  readonly logo?: LogoCell;
}

/**
 * Full-screen grid of letters with the RATNA logo on the centre cells.
 *
 * Purely decorative (`aria-hidden`): the page provides the accessible name.
 */
export function LetterGrid() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pitchRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const metrics = useGridMetrics(rootRef, pitchRef);
  const reducedMotion = usePrefersReducedMotion();
  const [tiles, dispatch] = useReducer(tileReducer, {});
  const cells = useMemo(() => buildCells(metrics.cols, metrics.rows), [metrics.cols, metrics.rows]);

  usePointerDepth(gridRef, !reducedMotion);
  useAmbientFlips(dispatch, metrics, !reducedMotion);
  useTyping(dispatch, metrics);
  const accentFlip = useAccentFlip(dispatch);

  const lastHovered = useRef<string | undefined>(undefined);
  const onPointerOver = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const id = tileIdFrom(event.target);
    if (id === lastHovered.current) return;
    lastHovered.current = id;
    if (id) accentFlip(id);
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse") return;
    const id = tileIdFrom(event.target);
    if (id) accentFlip(id);
  };

  const settle = useCallback(
    (id: string, seq: number) => dispatch({ type: "settle", id, seq }),
    [],
  );

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <div ref={pitchRef} className={styles.pitch} />
      <div
        ref={gridRef}
        className={styles.grid}
        style={{ "--cols": metrics.cols } as CSSProperties}
        onPointerOver={onPointerOver}
        onPointerDown={onPointerDown}
        onPointerLeave={() => (lastHovered.current = undefined)}
      >
        {cells.map((cell) =>
          cell.logo ? (
            <LogoTile key={cell.id} logo={cell.logo} delay={introDelay(cell)} />
          ) : (
            <Tile
              key={cell.id}
              id={cell.id}
              state={tiles[cell.id] ?? initialTile(cell.id)}
              delay={introDelay(cell)}
              onSettle={settle}
            />
          ),
        )}
      </div>
    </div>
  );
}

/* ---- Tiles ------------------------------------------------------------- */

interface TileProps {
  id: string;
  state: TileState;
  delay: number;
  onSettle: (id: string, seq: number) => void;
}

/**
 * A split-flap tile. At rest it shows a single glyph; while flipping it shows
 * four halves: the new top and old bottom stay put, while the old top falls
 * forward and the new bottom swings down after it.
 */
const Tile = memo(function Tile({ id, state, delay, onSettle }: TileProps) {
  const { from, seq } = state;

  if (from) {
    const onFlapEnd = (event: AnimationEvent) => {
      if (!event.pseudoElement) onSettle(id, seq);
    };
    return (
      <div className={styles.tile} data-tile={id}>
        <div key={seq} className={styles.flip}>
          <Half face={state} className={styles.top} />
          <Half face={from} className={styles.bottom} />
          <Half face={from} className={styles.flapTop} />
          <Half face={state} className={styles.flapBottom} onAnimationEnd={onFlapEnd} />
        </div>
      </div>
    );
  }

  const intro = seq === 0;
  return (
    <div className={styles.tile} data-tile={id}>
      <div
        className={intro ? `${styles.face} ${styles.intro}` : styles.face}
        data-tone={state.tone}
        style={intro ? introStyle(delay) : undefined}
      >
        <Glyph shape={shapeOf(state.letter)} />
      </div>
    </div>
  );
});

function Half({
  face,
  className,
  onAnimationEnd,
}: {
  face: Face;
  className: string;
  onAnimationEnd?: (event: AnimationEvent) => void;
}) {
  return (
    <div
      className={`${styles.half} ${className}`}
      data-tone={face.tone}
      onAnimationEnd={onAnimationEnd}
    >
      <Glyph shape={shapeOf(face.letter)} />
    </div>
  );
}

const LogoTile = memo(function LogoTile({ logo, delay }: { logo: LogoCell; delay: number }) {
  return (
    <div className={`${styles.tile} ${styles.logoTile}`}>
      <div className={`${styles.face} ${styles.intro}`} style={introStyle(delay)}>
        <ExtrudedGlyph shape={logo.shape} />
      </div>
    </div>
  );
});

/* ---- Helpers ----------------------------------------------------------- */

function buildCells(cols: number, rows: number): Cell[] {
  const halfCols = (cols - 1) / 2;
  const halfRows = (rows - 1) / 2;
  const cells: Cell[] = [];
  for (let row = -halfRows; row <= halfRows; row++) {
    for (let col = -halfCols; col <= halfCols; col++) {
      cells.push({ id: cellId(col, row), col, row, logo: findLogoCell(col, row) });
    }
  }
  return cells;
}

/** Tiles turn over in a ripple starting from the logo. */
function introDelay({ col, row }: Cell): number {
  return Math.round(100 + Math.hypot(col, row) * 70);
}

function introStyle(delay: number): CSSProperties {
  return { "--intro-delay": `${delay}ms` } as CSSProperties;
}

function shapeOf(letter: Letter | null) {
  return letter ? ALPHABET[letter] : null;
}

function tileIdFrom(target: EventTarget): string | undefined {
  return target instanceof Element
    ? target.closest<HTMLElement>("[data-tile]")?.dataset.tile
    : undefined;
}
