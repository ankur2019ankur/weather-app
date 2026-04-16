"use client";

import styles from "./HighlightOfDay.module.css";
import { useHighlightOfDay, type HighlightOfDayData } from "./useHighlightOfDay";

const EMPTY: HighlightOfDayData = {
  visibility: "—",
  drivingConditions: "—",
  pressure: "—",
  stability: "—",
  sunrise: "—",
  sunset: "—",
  airQuality: "—",
  airQualityStatus: "—",
};

const LOADING: HighlightOfDayData = {
  visibility: "…",
  drivingConditions: "…",
  pressure: "…",
  stability: "…",
  sunrise: "…",
  sunset: "…",
  airQuality: "…",
  airQualityStatus: "…",
};

function HighlightOfDayView() {
  const { data, loading, error } = useHighlightOfDay();
  const d = loading ? LOADING : (data ?? EMPTY);
  console.log(data);

  return (
    <article className={styles.card} aria-label="Highlights">
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Highlights</h2>
        <p className={styles.cardKicker}>
          {error && !loading ? (
            <span className={styles.loadError} role="status">
              Could not refresh highlights ({error})
            </span>
          ) : (
            "What matters right now"
          )}
        </p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Visibility</div>
          <div className={styles.statValue}>{d.visibility}</div>
          <div className={styles.statHint}>{d.drivingConditions} driving conditions</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Pressure</div>
          <div className={styles.statValue}>{d.pressure}</div>
          <div className={styles.statHint}>{d.stability}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Sunrise</div>
          <div className={styles.statValue}>{d.sunrise}</div>
          <div className={styles.statHint}>Sunset {d.sunset}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Air quality</div>
          <div className={styles.statValue}>{d.airQuality}</div>
          <div className={styles.statHint}>{d.airQualityStatus}</div>
        </div>
      </div>
    </article>
  );
}

export default HighlightOfDayView;
