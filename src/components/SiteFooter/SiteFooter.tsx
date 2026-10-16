import Link from "next/link";
import { site } from "@/config/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.chip}>{site.tagline}</p>
      <div className={styles.group}>
        <p className={`${styles.chip} ${styles.hint}`}>
          <span className={styles.pointerOnly}>{site.hints.pointer}</span>
          <span className={styles.touchOnly}>{site.hints.touch}</span>
        </p>
        <Link href="/alphabet/" className={`${styles.chip} ${styles.link}`}>
          Alphabet
        </Link>
      </div>
    </footer>
  );
}
