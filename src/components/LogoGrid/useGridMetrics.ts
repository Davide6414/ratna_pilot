import { useEffect, useState, type RefObject } from "react";

export interface GridMetrics {
  /** Rendered columns / rows. Always odd, so the centre cell is truly centred. */
  readonly cols: number;
  readonly rows: number;
}

/**
 * Used for the prerendered HTML: large enough to cover common screens, the
 * real size is computed as soon as the page hydrates.
 */
const PRERENDER_METRICS: GridMetrics = { cols: 15, rows: 13 };

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
      // A hair of margin so sub-pixel rounding never leaves an edge uncovered.
      const cols = oddCeil(root.clientWidth / pitch + 0.1);
      const rows = oddCeil(root.clientHeight / pitch + 0.1);
      setMetrics((prev) => (prev.cols === cols && prev.rows === rows ? prev : { cols, rows }));
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
