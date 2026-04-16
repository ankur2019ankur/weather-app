"use client";

import styles from "../../dashboard.module.css";
import { useMemo } from "react";

type TopbarProps = {
  now: Date;
};

export default function Topbar({ now }: TopbarProps) {
  const clockText = useMemo(() => {
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s} IST`;
  }, [now]);

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
        <div className={styles.clock}>{clockText}</div>
      </div>
    </div>
  );
}
