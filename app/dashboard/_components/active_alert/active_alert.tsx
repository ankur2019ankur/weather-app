import styles from "../../dashboard.module.css";

export type ActiveAlertKind = "critical" | "warning";

export type ActiveAlertItem = {
  kind: ActiveAlertKind;
  title: string;
  detail: string;
  time: string;
};

export default function ActiveAlert({ activeAlerts }: { activeAlerts: ActiveAlertItem[] }) {
  return (
    <div className={styles.gapSection}>
      <div className={styles.secLabel}>Active Alerts</div>
      <div className={styles.alertList} role="list" aria-label="Active alerts">
        {activeAlerts.map((a) => (
          <button key={`${a.kind}-${a.time}-${a.title}`} type="button" className={styles.alertItem}>
            <span
              className={`${styles.alertIcon} ${a.kind === "critical" ? styles.alertIconCrit : styles.alertIconWarn}`}
              aria-hidden="true"
            >
              {a.kind === "critical" ? "⚠" : "△"}
            </span>
            <span className={styles.alertMsg}>
              <span className={styles.alertTitle}>{a.title}</span>
              <span className={styles.alertDetail}>{a.detail}</span>
            </span>
            <span className={styles.alertTime}>{a.time}</span>
          </button>
        ))}
      </div>
    </div>
  );
}