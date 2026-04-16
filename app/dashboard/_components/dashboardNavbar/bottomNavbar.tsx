"use client";

import styles from "../../dashboard.module.css";

type TabKey = "overview" | "security" | "appdb" | "infra" | "service";

type BottomNavbarProps = {
  tab: TabKey;
  setTab: React.Dispatch<React.SetStateAction<TabKey>>;
};

export default function BottomNavbar({ tab, setTab }: BottomNavbarProps) {
  return (
    <>

      <div className={styles.kpiBar} aria-label="Key performance indicators">
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Online Users</div>
          <div className={styles.kpiValue}>12,840</div>
          <div className={`${styles.kpiTrend} ${styles.trendUp}`}>▲ 4.2% vs yesterday</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Business Volume</div>
          <div className={styles.kpiValue}>₹2.41Cr</div>
          <div className={`${styles.kpiTrend} ${styles.trendUp}`}>▲ 1.8% today</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Avg Response Time</div>
          <div className={styles.kpiValue}>218ms</div>
          <div className={`${styles.kpiTrend} ${styles.trendWarn}`}>▲ 12ms spike</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Open Tickets</div>
          <div className={styles.kpiValue}>47</div>
          <div className={`${styles.kpiTrend} ${styles.trendDn}`}>▲ 6 new today</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>SLA Compliance</div>
          <div className={styles.kpiValue}>96.4%</div>
          <div className={`${styles.kpiTrend} ${styles.trendUp}`}>▲ 0.4% this week</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Active Alerts</div>
          <div className={`${styles.kpiValue} ${styles.kpiValueRed}`}>3</div>
          <div className={`${styles.kpiTrend} ${styles.trendDn}`}>2 critical · 1 warning</div>
        </div>
      </div>
    </>
  );
}