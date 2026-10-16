import { useEffect, type CSSProperties, type RefObject } from "react";

/**
 * Timings of the hover flip. CSS reads them from the custom properties below
 * (see `flipTimings`), so this file is the single place to tune them.
 */
const PEEK_MS = 200; // passing over a cell: it tilts part of the way
const DWELL_MS = 320; // staying on it this long completes the flip
const FULL_MS = 380; // from the tilt to fully turned
const BACK_MS = 320; // back to flat once the mouse has left

export const flipTimings = {
  "--flip-peek": `${PEEK_MS}ms`,
  "--flip-full": `${FULL_MS}ms`,
  "--flip-back": `${BACK_MS}ms`,
} as CSSProperties;

type FlipState = "peek" | "full" | "back";

/**
 * Turns `[data-blank]` cells under the mouse by setting `data-flip`:
 * - `peek`: the mouse is passing over the cell, which tilts part of the way;
 * - `full`: the mouse stayed on it, the cell turns all the way to light blue;
 * - `back`: the mouse left, the cell turns back to flat (then the attribute
 *   is removed, so idle cells carry no transform at all).
 *
 * A cell always reaches its tilt before turning back, so even a quick sweep
 * leaves a visible ripple. Touch is ignored: there is no "leave" on touch.
 */
export function useFlipOnHover(gridRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const enteredAt = new WeakMap<HTMLElement, number>();
    const timers = new Map<HTMLElement, number>();

    const schedule = (cell: HTMLElement, delay: number, run: () => void) => {
      window.clearTimeout(timers.get(cell));
      timers.set(
        cell,
        window.setTimeout(() => {
          timers.delete(cell);
          run();
        }, delay),
      );
    };
    const setState = (cell: HTMLElement, state: FlipState) => {
      cell.dataset.flip = state;
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const cell = blankCell(event.target);
      if (!cell || cell.contains(event.relatedTarget as Node | null)) return;
      enteredAt.set(cell, performance.now());
      setState(cell, "peek");
      schedule(cell, DWELL_MS, () => setState(cell, "full"));
    };

    const onOut = (event: PointerEvent) => {
      const cell = blankCell(event.target);
      if (!cell || cell.contains(event.relatedTarget as Node | null)) return;
      const elapsed = performance.now() - (enteredAt.get(cell) ?? 0);
      schedule(cell, Math.max(0, PEEK_MS - elapsed), () => {
        setState(cell, "back");
        schedule(cell, BACK_MS, () => delete cell.dataset.flip);
      });
    };

    grid.addEventListener("pointerover", onOver);
    grid.addEventListener("pointerout", onOut);
    return () => {
      grid.removeEventListener("pointerover", onOver);
      grid.removeEventListener("pointerout", onOut);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [gridRef]);
}

function blankCell(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>("[data-blank]") : null;
}
