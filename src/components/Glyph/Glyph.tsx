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

function GlyphPaths({ shape }: { shape: GlyphShape }) {
  const fillRule = shape.evenOdd ? "evenodd" : undefined;
  return shape.paths.map((d) => <path key={d} d={d} fill="currentColor" fillRule={fillRule} />);
}
