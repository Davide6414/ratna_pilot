import type { Metadata } from "next";
import Link from "next/link";
import { Specimen } from "@/components/Specimen/Specimen";
import { LETTERS } from "@/lib/glyphs/alphabet";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Alphabet",
  description: "The full RATNA geometric alphabet.",
};

export default function AlphabetPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← Back
        </Link>
        <h1 className={styles.title}>Alphabet</h1>
        <p className={styles.lead}>
          Twenty-six letters built from the rules of the logo: bars, 45° diagonals and circles, each
          sitting on the baseline of its cell.
        </p>
      </header>
      <Specimen letters={LETTERS} labelled />
    </main>
  );
}
