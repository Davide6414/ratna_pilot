import type { CSSProperties } from "react";
import type { GlyphShape } from "@/lib/glyphs/alphabet";
import styles from "./Glyph.module.css";

interface GlyphProps {
  shape: GlyphShape | null;
  className?: string;
}

/** A single glyph as inline SVG. Inherits its colour from `color`. */
export function Glyph({ shape, className }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className ? `${styles.glyph} ${className}` : styles.glyph}
      aria-hidden="true"
      focusable="false"
    >
      {shape?.backdrop && <path d={shape.backdrop} className={styles.backdrop} />}
      {shape && <GlyphPaths shape={shape} />}
    </svg>
  );
}

const EXTRUSION_LAYERS = 6;

/**
 * A glyph with fake depth: copies of the shape are stacked between the base
 * (anchored to the grid) and the face, which is offset by `--extrude-x/y`.
 * Moving those two custom properties is enough to make the letter look like a
 * block seen from a different angle.
 */
export function ExtrudedGlyph({ shape, className }: GlyphProps) {
  if (!shape) return <Glyph shape={null} className={className} />;
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${styles.glyph} ${styles.extruded} ${className ?? ""}`}
      aria-hidden="true"
      focusable="false"
    >
      {shape.backdrop && <path d={shape.backdrop} className={styles.backdrop} />}
      {Array.from({ length: EXTRUSION_LAYERS }, (_, i) => (
        <g key={i} className={styles.side} style={{ "--k": i / EXTRUSION_LAYERS } as CSSProperties}>
          <GlyphPaths shape={shape} />
        </g>
      ))}
      <g className={styles.face}>
        <GlyphPaths shape={shape} />
      </g>
    </svg>
  );
}

function GlyphPaths({ shape }: { shape: GlyphShape }) {
  const fillRule = shape.evenOdd ? "evenodd" : undefined;
  return shape.paths.map((d) => <path key={d} d={d} fill="currentColor" fillRule={fillRule} />);
}
