import { useEffect, type RefObject } from "react";

/** Duration of one half-turn of a cell. Exposed to CSS as `--flip`. */
export const FLIP_MS = 420;

/**
 * Turns `[data-blank]` cells over while the mouse is on them (the animation
 * itself is CSS). Two attributes per cell:
 * - `data-flipped`: the card turns to its hover colour;
 * - `data-open`: the cell shows the sea behind the card. It is set with
 *   `data-flipped` and cleared once the card has turned back flat, so the
 *   sea stays visible for the whole way back (and only then).
 *
 * Plain `:hover` would reverse a cell the instant the pointer leaves it, so a
 * quick sweep only made cells twitch. Here a cell always finishes turning to
 * its hover colour before it turns back, which leaves a trail behind the mouse.
 * Cells cut by the edge of the screen stay still. Touch is ignored: there is
 * no "leave" to turn the cell back.
 */
export function useFlipOnHover(gridRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const flippedAt = new WeakMap<HTMLElement, number>();
    const pending = new Map<HTMLElement, number>();

    const later = (cell: HTMLElement, delay: number, run: () => void) => {
      window.clearTimeout(pending.get(cell));
      pending.set(
        cell,
        window.setTimeout(() => {
          pending.delete(cell);
          run();
        }, delay),
      );
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const cell = blankCell(event.target);
      if (!cell || !isFullyOnScreen(cell)) return;
      window.clearTimeout(pending.get(cell));
      pending.delete(cell);
      if (!("flipped" in cell.dataset)) {
        cell.dataset.flipped = "";
        cell.dataset.open = "";
        flippedAt.set(cell, performance.now());
      }
    };

    const onOut = (event: PointerEvent) => {
      const cell = blankCell(event.target);
      if (!cell || !("flipped" in cell.dataset)) return;
      if (cell.contains(event.relatedTarget as Node | null)) return;
      const elapsed = performance.now() - (flippedAt.get(cell) ?? 0);
      later(cell, Math.max(0, FLIP_MS - elapsed), () => {
        delete cell.dataset.flipped;
        later(cell, FLIP_MS, () => delete cell.dataset.open);
      });
    };

    grid.addEventListener("pointerover", onOver);
    grid.addEventListener("pointerout", onOut);
    return () => {
      grid.removeEventListener("pointerover", onOver);
      grid.removeEventListener("pointerout", onOut);
      pending.forEach((timer) => window.clearTimeout(timer));
    };
  }, [gridRef]);
}

function blankCell(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>("[data-blank]") : null;
}

/** Half a pixel of slack for sub-pixel layout. */
const EDGE_TOLERANCE = 0.5;

function isFullyOnScreen(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.left >= -EDGE_TOLERANCE &&
    rect.top >= -EDGE_TOLERANCE &&
    rect.right <= window.innerWidth + EDGE_TOLERANCE &&
    rect.bottom <= window.innerHeight + EDGE_TOLERANCE
  );
}
