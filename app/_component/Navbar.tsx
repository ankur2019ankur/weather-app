import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.brand}>
          Weather App
        </Link>

        <div className={styles.spacer} />

        <ul className={styles.links}>
          <li>
            <Link href="/state" className={styles.link}>
              State
            </Link>
          </li>
          <li>
            <Link href="/login" className={styles.link}>
              Login
            </Link>
          </li>
          <li>
            <Link href="/registration" className={styles.link}>
              Registration
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}