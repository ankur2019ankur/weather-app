import styles from "./page.module.css";
import HomeLoginForm from "./_component/HomeLoginForm";

export default function Home() {
  return (
    <div className={styles.shell}>
      <section className={styles.hero} aria-label="Dashboard header">
        <div className={styles.heroText}>
          <h1 className={styles.title}>Privileged Access Manager</h1>
          <p className={styles.subtitle}>
            Manage and control access to privileged resources.
          </p>
        </div>
      </section>

      <section className={`${styles.grid} ${styles.gridCenter}`} aria-label="Dashboard content">
        <HomeLoginForm />
      </section>
    </div>
  );
}
