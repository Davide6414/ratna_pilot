import Link from "next/link";
import { Specimen } from "@/components/Specimen/Specimen";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <h1 className="visually-hidden">Page not found</h1>
      <Specimen letters={["L", "O", "S", "T"]} className={styles.word} />
      <Link href="/" className={styles.link}>
        Back to home
      </Link>
    </main>
  );
}
