import { useEffect, type RefObject } from "react";

/** Duration of one half-turn of a cell. Exposed to CSS as `--flip`. */
export const FLIP_MS = 420;

/**
 * Turns `[data-blank]` cells over while the mouse is on them, by toggling
 * `data-flipped` (the animation itself is CSS).
 *
 * Plain `:hover` would reverse a cell the instant the pointer leaves it, so a
 * quick sweep only made cells twitch. Here a cell always finishes turning to
 * its hover colour before it turns back, which leaves a trail behind the mouse.
 * Touch is ignored: there is no "leave" to turn the cell back.
 */
export function useFlipOnHover(gridRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const flippedAt = new WeakMap<HTMLElement, number>();
    const pending = new Map<HTMLElement, number>();

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const cell = blankCell(event.target);
      if (!cell) return;
      window.clearTimeout(pending.get(cell));
      pending.delete(cell);
      if (!("flipped" in cell.dataset)) {
        cell.dataset.flipped = "";
        flippedAt.set(cell, performance.now());
      }
    };

    const onOut = (event: PointerEvent) => {
      const cell = blankCell(event.target);
      if (!cell || cell.contains(event.relatedTarget as Node | null)) return;
      const elapsed = performance.now() - (flippedAt.get(cell) ?? 0);
      const timer = window.setTimeout(
        () => {
          pending.delete(cell);
          delete cell.dataset.flipped;
        },
        Math.max(0, FLIP_MS - elapsed),
      );
      pending.set(cell, timer);
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
