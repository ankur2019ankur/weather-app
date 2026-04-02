import Link from "next/link";
import styles from "../simple-page.module.css";

export default function RegistrationPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Registration</h1>
        <p className={styles.subtitle}>Placeholder page (you can wire auth later).</p>

        <div className={styles.actions}>
          <Link className={styles.primary} href="/">
            Back to dashboard
          </Link>
          <Link className={styles.secondary} href="/login">
            I already have an account
          </Link>
        </div>
      </div>
    </div>
  );
}

