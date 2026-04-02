import Link from "next/link";
import styles from "../simple-page.module.css";

export default function LoginPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.subtitle}>Placeholder page (you can wire auth later).</p>

        <div className={styles.actions}>
          <Link className={styles.primary} href="/">
            Back to dashboard
          </Link>
          <Link className={styles.secondary} href="/registration">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

