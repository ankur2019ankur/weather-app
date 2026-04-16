"use client";

import styles from "../../dashboard.module.css";
import { useMemo } from "react";
import Clock from "@/app/_component/Clock";

type TopbarProps = {
  now: Date;
};

export default function Topbar() {

  return (
    <div className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <div className={styles.logo}>DOP</div>
        <div>
          <div className={styles.appName}>Weather Dashboard</div>
          <div className={styles.appSub}>Live operational view</div>
        </div>
      </div>
      <div className={styles.topbarRight}>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          Live
        </div>
        <div className={styles.clock}><Clock /></div>
      </div>
    </div>
  );
}
