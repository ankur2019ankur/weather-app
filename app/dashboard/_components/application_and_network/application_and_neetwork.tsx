import { Line } from "react-chartjs-2";

type Props = {
  styles: Record<string, string>;
  datasets: {
    overviewApm: unknown;
    overviewWan: unknown;
  };
  baseMiniLineOptions: unknown;
};

export default function ApplicationAndNetwork({ styles, datasets, baseMiniLineOptions }: Props) {
  return (
    <div className={styles.gapSection}>
      <div className={styles.secLabel}>Application &amp; Network</div>
      <div className={styles.g2}>
        <article className={`${styles.card} ${styles.cardClickable}`} aria-label="APM widget">
          <div className={styles.cardTitle}>
            APM <span className={`${styles.badge} ${styles.badgeOk}`}>Healthy</span>
          </div>
          <div className={styles.cardSub}>Response time trend</div>
          <div className={styles.chartWrap} style={{ height: 90 }}>
            <Line data={datasets.overviewApm as any} options={baseMiniLineOptions as any} />
          </div>
          <div className={styles.rows}>
            <div className={styles.tr}>
              <span className={styles.tk}>Avg Response</span>
              <span className={styles.tv}>218ms</span>
            </div>
            <div className={styles.tr}>
              <span className={styles.tk}>Apdex</span>
              <span className={`${styles.tv} ${styles.tvG}`}>0.94</span>
            </div>
          </div>
        </article>

        <article className={`${styles.card} ${styles.cardClickable}`} aria-label="WAN widget">
          <div className={styles.cardTitle}>
            WAN <span className={`${styles.badge} ${styles.badgeWarn}`}>Degraded</span>
          </div>
          <div className={styles.cardSub}>Links available</div>
          <div className={styles.chartWrap} style={{ height: 90 }}>
            <Line data={datasets.overviewWan as any} options={baseMiniLineOptions as any} />
          </div>
          <div className={styles.rows}>
            <div className={styles.tr}>
              <span className={styles.tk}>Remote links</span>
              <span className={`${styles.tv} ${styles.tvY}`}>1,204 / 1,218</span>
            </div>
            <div className={styles.tr}>
              <span className={styles.tk}>Links down</span>
              <span className={`${styles.tv} ${styles.tvR}`}>14</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}