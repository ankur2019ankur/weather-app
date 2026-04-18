"use client";

import styles from "../../dashboard.module.css";
import type { TabKey } from "./sidebar";

type BottomNavbarProps = {
  tab: TabKey;
  setTab: (tab: TabKey) => void;
};

export default function BottomNavbar({ tab, setTab }: BottomNavbarProps) {
  return (
    <>

      <div className={styles.kpiBar} aria-label="Key performance indicators">
        <div
          className={`${styles.kpiCard} ${tab === "resources" ? styles.kpiCardActive : ""}`}
          onClick={() => setTab("resources")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setTab("resources");
            }
          }}
          aria-pressed={tab === "resources"}
          aria-label="Resources — show resources list"
        >
          <div className={styles.kpiLabel}>Resources</div>
          <div className={styles.kpiValue}>12,840</div>
          <div className={`${styles.kpiTrend} ${styles.trendUp}`}>▲ No of Resources</div>
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