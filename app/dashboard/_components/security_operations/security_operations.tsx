"use client";

import { Bar, Doughnut } from "react-chartjs-2";

type SecurityOperationsProps = {
  styles: Record<string, string>;
  datasets: any;
  baseMiniBarOptions: any;
  /** Grouped bar chart: city lows vs highs with visible axes. */
  temperatureBarOptions: any;
  baseMiniLineOptions: any;
  /** Relative column widths for SOC vs SIEM (e.g. `[3, 2]`). */
  widgetColumnRatio?: readonly [number, number];
};

export default function SecurityOperations({
  styles,
  datasets,
  baseMiniBarOptions,
  temperatureBarOptions,
  widgetColumnRatio = [1, 1],
}: SecurityOperationsProps) {
  const [socFr, siemFr] = widgetColumnRatio;
  return (
    <div className={styles.gapSection}>
      <div className={styles.secLabel}>
        temperature and humidity monitoring
      </div>
      <div
        className={styles.g2Ratio}
        style={{ gridTemplateColumns: `${socFr}fr ${siemFr}fr` }}
      >
        <article className={`${styles.card} ${styles.cardClickable}`} aria-label="SOC widget">
          <div className={styles.cardTitle}>
            Temperature (Highest and Lowest) <span className={`${styles.badge} ${styles.badgeOk}`}>Nominal</span>
          </div>
          <div className={styles.cardSub}>Sample daily range (°C) across metros</div>
          <div className={styles.chartWrap} style={{ height: 168 }}>
            <Bar data={datasets.overviewSoc} options={temperatureBarOptions} />
          </div>
          <div className={styles.rows}>
            <div className={styles.tr}>
              <span className={styles.tk}>Cities</span>
              <span className={styles.tv}>5</span>
            </div>
            <div className={styles.tr}>
              <span className={styles.tk}>Peak today</span>
              <span className={`${styles.tv} ${styles.tvG}`}>Delhi 39°C</span>
            </div>
          </div>
        </article>

        <article className={`${styles.card} ${styles.cardClickable}`} aria-label="SIEM widget">
          <div className={styles.cardTitle}>
            Humidity <span className={`${styles.badge} ${styles.badgeWarn}`}>Reviewing</span>
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

      </div>
    </div>
  );
}