import { LETTERS, type Letter } from "@/lib/glyphs/alphabet";
import { hash2, pick } from "@/lib/random";

export type Tone = "muted" | "accent";

export interface Face {
  /** `null` renders an empty cell (a typed space). */
  readonly letter: Letter | null;
  readonly tone: Tone;
}

export interface TileState extends Face {
  /** The face being flipped away from; only present while the flip animation runs. */
  readonly from?: Face;
  /** Incremented on every flip: restarts the animation and lets stale events be ignored. */
  readonly seq: number;
  /** Pinned tiles (typed text) are left alone by hover and the ambient animation. */
  readonly pinned: boolean;
}

export type TileMap = Readonly<Record<string, TileState>>;

/**
 * Who asked for a flip:
 * - `ambient`: background animation, only touches idle tiles;
 * - `hover`: pointer interaction, skips pinned tiles and tiles already flipping;
 * - `user`: typing, always applied.
 */
export type FlipSource = "ambient" | "hover" | "user";

export type TileAction =
  | { type: "flip"; id: string; face: Face; source: FlipSource; pinned?: boolean }
  | { type: "settle"; id: string; seq: number }
  | { type: "fade"; id: string };

export function cellId(col: number, row: number): string {
  return `${col},${row}`;
}

const initialCache = new Map<string, TileState>();

/**
 * The state of a tile nobody has touched yet. Derived from its position so the
 * prerendered HTML and the hydrated page agree, and cached so memoised tiles
 * keep receiving the same object.
 */
export function initialTile(id: string): TileState {
  let tile = initialCache.get(id);
  if (!tile) {
    const [col, row] = id.split(",").map(Number);
    tile = { letter: pick(LETTERS, hash2(col, row)), tone: "muted", seq: 0, pinned: false };
    initialCache.set(id, tile);
  }
  return tile;
}

export function tileReducer(tiles: TileMap, action: TileAction): TileMap {
  const current = tiles[action.id] ?? initialTile(action.id);

  switch (action.type) {
    case "flip": {
      if (
        action.source === "ambient" &&
        (current.pinned || current.from || current.tone === "accent")
      ) {
        return tiles;
      }
      if (action.source === "hover" && (current.pinned || current.from)) {
        return tiles;
      }
      const pinned = action.pinned ?? false;
      if (action.face.letter === current.letter && action.face.tone === current.tone) {
        return current.pinned === pinned
          ? tiles
          : { ...tiles, [action.id]: { ...current, pinned } };
      }
      return {
        ...tiles,
        [action.id]: {
          ...action.face,
          from: { letter: current.letter, tone: current.tone },
          seq: current.seq + 1,
          pinned,
        },
      };
    }

    case "settle": {
      if (current.seq !== action.seq || !current.from) return tiles;
      return { ...tiles, [action.id]: { ...current, from: undefined } };
    }

    case "fade": {
      if (current.pinned || current.tone === "muted") return tiles;
      return { ...tiles, [action.id]: { ...current, tone: "muted" } };
    }
  }
}
