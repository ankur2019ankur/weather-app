import styles from "./recommentation.module.css";

export default function Recommentation() {
  return (
    <article className={styles.card} aria-label="Tips">
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Recommendations</h2>
        <p className={styles.cardKicker}>Based on current conditions</p>
      </header>

      <ul className={styles.tips}>
        <li className={styles.tipItem}>
          <span className={styles.tipDot} aria-hidden="true" />
          Bring sunglasses — UV is moderate.
        </li>
        <li className={styles.tipItem}>
          <span className={styles.tipDot} aria-hidden="true" />
          Light jacket in the evening (low ~18°).
        </li>
        <li className={styles.tipItem}>
          <span className={styles.tipDot} aria-hidden="true" />
          Best outdoor window: 12:00–16:00.
        </li>
      </ul>
    </article>
  );
}
