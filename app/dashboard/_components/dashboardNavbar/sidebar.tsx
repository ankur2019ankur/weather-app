"use client";

import styles from "../../dashboard.module.css";

export type TabKey = "overview" | "security" | "appdb" | "infra" | "service";

type SidebarProps = {
  tab: TabKey;
  setTab: (tab: TabKey) => void;
};

export default function Sidebar({ tab, setTab }: SidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Sidebar navigation">
      <div className={styles.sidebarSectionLabel}>Quick Jump</div>
      <div
        className={`${styles.sidebarItem} ${tab === "overview" ? styles.sidebarItemActive : ""}`}
        onClick={() => setTab("overview")}
        role="button"
        tabIndex={0}
      >
        <div className={styles.sidebarItemLeft}>
          <span className={`${styles.sDot} ${styles.sDotG}`} />
          Overview
        </div>
      </div>
     
      <div
        className={`${styles.sidebarItem} ${tab === "service" ? styles.sidebarItemActive : ""}`}
        onClick={() => setTab("service")}
        role="button"
        tabIndex={0}
      >
        <div className={styles.sidebarItemLeft}>
          <span className={`${styles.sDot} ${styles.sDotR}`} />
          Service Mgmt
        </div>
      </div>
    </aside>
  );
}
