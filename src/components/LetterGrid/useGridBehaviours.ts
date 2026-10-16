import { useCallback, useEffect, useRef, type Dispatch } from "react";
import { isLetter, LETTERS, type Letter } from "@/lib/glyphs/alphabet";
import { findLogoCell } from "@/lib/glyphs/logo";
import { randomItem } from "@/lib/random";
import { cellId, type TileAction } from "./tileState";
import type { GridMetrics } from "./useGridMetrics";

/** Delay between two ambient flips. */
const AMBIENT_INTERVAL_MS = 700;
/** Roughly one ambient flip per tick for every this many visible tiles. */
const AMBIENT_TILES_PER_FLIP = 60;
/** How long a hovered / tapped letter stays highlighted. */
const ACCENT_HOLD_MS = 2400;
/** First row (counted from the centre) used for typed text: right below the logo. */
const WRITE_FROM_ROW = 2;

/** Random visible tiles flip on their own, like a departure board. */
export function useAmbientFlips(
  dispatch: Dispatch<TileAction>,
  metrics: GridMetrics,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled || !metrics.measured) return;
    const { reachCols, reachRows } = metrics;
    const visibleTiles = (reachCols * 2 + 1) * (reachRows * 2 + 1);
    const perTick = Math.max(1, Math.round(visibleTiles / AMBIENT_TILES_PER_FLIP));

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      for (let i = 0; i < perTick; i++) {
        const col = randomInt(-reachCols, reachCols);
        const row = randomInt(-reachRows, reachRows);
        if (findLogoCell(col, row)) continue;
        dispatch({
          type: "flip",
          id: cellId(col, row),
          face: { letter: randomItem(LETTERS), tone: "muted" },
          source: "ambient",
        });
      }
    }, AMBIENT_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [dispatch, metrics, enabled]);
}

/** Returns a callback that flips a tile to a highlighted letter, fading back after a while. */
export function useAccentFlip(dispatch: Dispatch<TileAction>) {
  const timers = useRef(new Map<string, number>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return useCallback(
    (id: string) => {
      dispatch({
        type: "flip",
        id,
        face: { letter: randomItem(LETTERS), tone: "accent" },
        source: "hover",
      });
      window.clearTimeout(timers.current.get(id));
      timers.current.set(
        id,
        window.setTimeout(() => {
          timers.current.delete(id);
          dispatch({ type: "fade", id });
        }, ACCENT_HOLD_MS),
      );
    },
    [dispatch],
  );
}

/**
 * Typing A–Z writes on the grid, starting right below the logo. When the
 * visible cells run out the text scrolls left, departure-board style.
 * Space leaves a blank cell, Backspace deletes, Escape clears everything.
 */
export function useTyping(dispatch: Dispatch<TileAction>, metrics: GridMetrics) {
  useEffect(() => {
    if (!metrics.measured) return;
    const slots = writingSlots(metrics);
    if (slots.length === 0) return;
    let text: (Letter | null)[] = [];

    /** Flips every slot to match `text`, releasing the ones that are no longer used. */
    const render = (next: (Letter | null)[]) => {
      slots.forEach((id, i) => {
        if (i < next.length) {
          dispatch({
            type: "flip",
            id,
            face: { letter: next[i], tone: "accent" },
            source: "user",
            pinned: true,
          });
        } else if (i < text.length) {
          dispatch({
            type: "flip",
            id,
            face: { letter: randomItem(LETTERS), tone: "muted" },
            source: "user",
          });
        }
      });
      text = next;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isEditable(event.target)) return;
      const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;

      if (isLetter(key) || key === " ") {
        event.preventDefault();
        render([...text, key === " " ? null : key].slice(-slots.length));
      } else if (key === "Backspace") {
        render(text.slice(0, -1));
      } else if (key === "Escape") {
        render([]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      // The layout is changing (resize) or the grid is going away: start over.
      render([]);
    };
  }, [dispatch, metrics]);
}

/** Fully visible cells below the logo, in reading order. */
function writingSlots({ fullCols, fullRows }: GridMetrics): string[] {
  const slots: string[] = [];
  for (let row = WRITE_FROM_ROW; row <= fullRows; row++) {
    for (let col = -fullCols; col <= fullCols; col++) slots.push(cellId(col, row));
  }
  return slots;
}

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
