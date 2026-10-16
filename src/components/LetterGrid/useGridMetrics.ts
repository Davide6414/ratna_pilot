import { useEffect, useState, type RefObject } from "react";

export interface GridMetrics {
  /** Rendered columns / rows. Always odd, so the centre cell is truly centred. */
  readonly cols: number;
  readonly rows: number;
  /** Distance (in cells from the centre) of the outermost cells that are at least partly on screen. */
  readonly reachCols: number;
  readonly reachRows: number;
  /** Distance of the outermost cells that are (almost) entirely on screen. */
  readonly fullCols: number;
  readonly fullRows: number;
  /** False until the browser has measured the viewport. */
  readonly measured: boolean;
}

/**
 * Used for the prerendered HTML: large enough to cover common screens, the
 * real size is computed as soon as the page hydrates.
 */
const PRERENDER_METRICS: GridMetrics = {
  cols: 15,
  rows: 13,
  reachCols: 7,
  reachRows: 6,
  fullCols: 0,
  fullRows: 0,
  measured: false,
};

/** A cell counts as "fully" visible when no more than this share of it is cut off. */
const FULL_TOLERANCE = 0.15;

/**
 * Works out how many cells are needed to cover the viewport.
 *
 * @param rootRef  element filling the viewport
 * @param pitchRef element whose width is one cell + one grid line
 */
export function useGridMetrics(
  rootRef: RefObject<HTMLElement | null>,
  pitchRef: RefObject<HTMLElement | null>,
): GridMetrics {
  const [metrics, setMetrics] = useState(PRERENDER_METRICS);

  useEffect(() => {
    const root = rootRef.current;
    const probe = pitchRef.current;
    if (!root || !probe) return;

    const observer = new ResizeObserver(() => {
      const pitch = probe.getBoundingClientRect().width;
      if (!pitch) return;
      const across = root.clientWidth / pitch;
      const down = root.clientHeight / pitch;
      const next: GridMetrics = {
        // A hair of margin so sub-pixel rounding never leaves an edge uncovered.
        cols: oddCeil(across + 0.1),
        rows: oddCeil(down + 0.1),
        reachCols: Math.ceil((across - 1) / 2),
        reachRows: Math.ceil((down - 1) / 2),
        fullCols: Math.floor((across - 1) / 2 + FULL_TOLERANCE),
        fullRows: Math.floor((down - 1) / 2 + FULL_TOLERANCE),
        measured: true,
      };
      setMetrics((prev) => (sameMetrics(prev, next) ? prev : next));
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef, pitchRef]);

  return metrics;
}

function oddCeil(value: number): number {
  const n = Math.ceil(value);
  return n % 2 === 1 ? n : n + 1;
}

function sameMetrics(a: GridMetrics, b: GridMetrics): boolean {
  return (Object.keys(a) as (keyof GridMetrics)[]).every((key) => a[key] === b[key]);
}
