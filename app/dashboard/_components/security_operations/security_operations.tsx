"use client";

import { Bar, Doughnut } from "react-chartjs-2";

type SecurityOperationsProps = {
  styles: Record<string, string>;
  datasets: any;
  baseMiniBarOptions: any;
  baseMiniLineOptions: any;
};

export default function SecurityOperations({
  styles,
  datasets,
  baseMiniBarOptions,
  baseMiniLineOptions,
}: SecurityOperationsProps) {
  return (
    <div className={styles.gapSection}>
      <div className={styles.secLabel}>Security Operations</div>
      <div className={styles.g3}>
        <article className={`${styles.card} ${styles.cardClickable}`} aria-label="SOC widget">
          <div className={styles.cardTitle}>
            SOC PITG <span className={`${styles.badge} ${styles.badgeOk}`}>Nominal</span>
          </div>
          <div className={styles.cardSub}>Real-time events</div>
          <div className={styles.chartWrap} style={{ height: 64 }}>
            <Bar data={datasets.overviewSoc} options={baseMiniBarOptions} />
          </div>
          <div className={styles.rows}>
            <div className={styles.tr}>
              <span className={styles.tk}>Events/hr</span>
              <span className={styles.tv}>247</span>
            </div>
            <div className={styles.tr}>
              <span className={styles.tk}>Blocked</span>
              <span className={`${styles.tv} ${styles.tvG}`}>1,082</span>
            </div>
          </div>
        </article>

        <article className={`${styles.card} ${styles.cardClickable}`} aria-label="SIEM widget">
          <div className={styles.cardTitle}>
            SIEM <span className={`${styles.badge} ${styles.badgeWarn}`}>Reviewing</span>
          </div>
          <div className={styles.cardSub}>Security correlation</div>
          <div className={styles.chartWrap} style={{ height: 64 }}>
            <Bar data={datasets.overviewSiem} options={baseMiniBarOptions} />
          </div>
          <div className={styles.rows}>
            <div className={styles.tr}>
              <span className={styles.tk}>Total events</span>
              <span className={styles.tv}>1,842</span>
            </div>
            <div className={styles.tr}>
              <span className={styles.tk}>Unresolved</span>
              <span className={`${styles.tv} ${styles.tvY}`}>8</span>
            </div>
          </div>
        </article>

        <article className={`${styles.card} ${styles.cardClickable}`} aria-label="VM widget">
          <div className={styles.cardTitle}>
            VM / Compute <span className={`${styles.badge} ${styles.badgeOk}`}>Running</span>
          </div>
          <div className={styles.cardSub}>Fleet composition</div>
          <div className={styles.chartWrap} style={{ height: 110 }}>
            <Doughnut
              data={datasets.vmMix}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: "right", labels: { color: "#8b949e" } },
                  tooltip: baseMiniLineOptions.plugins.tooltip,
                },
                cutout: "68%",
              }}
            />
          </div>
          <div className={styles.rows}>
            <div className={styles.tr}>
              <span className={styles.tk}>Running</span>
              <span className={`${styles.tv} ${styles.tvG}`}>336</span>
            </div>
            <div className={styles.tr}>
              <span className={styles.tk}>Stopped</span>
              <span className={`${styles.tv} ${styles.tvY}`}>3</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}