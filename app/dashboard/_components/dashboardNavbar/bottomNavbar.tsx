"use client";

import { useAppSelector } from "@/lib/hooks";
import styles from "../../dashboard.module.css";
import type { TabKey } from "./sidebar";

type BottomNavbarProps = {
  tab: TabKey;
  setTab: (tab: TabKey) => void;
};

export default function BottomNavbar({ tab, setTab }: BottomNavbarProps) {
  const { count, status } = useAppSelector((s) => s.resources);

  const resourcesCountLabel =
    status === "loading" && count === 0
      ? "…"
      : status === "failed" && count === 0
        ? "—"
        : count.toLocaleString();

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
          <div className={styles.kpiValue}>{resourcesCountLabel}</div>
          <div className={`${styles.kpiTrend} ${styles.trendUp}`}>▲ No of Resources</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Api 2</div>
          <div className={styles.kpiValue}>0</div>
          <div className={`${styles.kpiTrend} ${styles.trendUp}`}>▲ Api 2 Calls</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Api 3</div>
          <div className={styles.kpiValue}>0</div>
          <div className={`${styles.kpiTrend} ${styles.trendWarn}`}>▲ Api 3 Calls</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Api 4</div>
          <div className={styles.kpiValue}>0</div>
          <div className={`${styles.kpiTrend} ${styles.trendDn}`}>▲ Api 4 Calls</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Api 5</div>
          <div className={styles.kpiValue}>0</div>
          <div className={`${styles.kpiTrend} ${styles.trendUp}`}>▲ Api 5 Calls</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Api 6</div>
          <div className={`${styles.kpiValue} ${styles.kpiValueRed}`}>0</div>
          <div className={`${styles.kpiTrend} ${styles.trendDn}`}>▲ Api 6 Calls</div>
        </div>
      </div>
    </>
  );
}