import { Glyph } from "@/components/Glyph/Glyph";
import { ALPHABET, type Letter } from "@/lib/glyphs/alphabet";
import styles from "./Specimen.module.css";

interface SpecimenProps {
  letters: readonly (Letter | null)[];
  /** Show the letter name under each cell. */
  labelled?: boolean;
  className?: string;
}

/** A static row of glyph cells, laid out on the same ruled grid as the landing page. */
export function Specimen({ letters, labelled = false, className }: SpecimenProps) {
  return (
    <ul className={className ? `${styles.specimen} ${className}` : styles.specimen}>
      {letters.map((letter, index) => (
        <li key={`${letter}-${index}`} className={styles.cell}>
          <Glyph shape={letter ? ALPHABET[letter] : null} />
          {labelled && letter && <span className={styles.label}>{letter}</span>}
        </li>
      ))}
    </ul>
  );
}
