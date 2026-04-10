"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import styles from "./currentcondition.module.css";

const CURRENT_WEATHER_URL =
  "http://localhost:3005/api/hardcodedapi/current-weather";

type CurrentWeatherData = {
  temperature: string;
  feelsLike: string;
  weather: string;
  humidity: string;
  wind: string;
  uv: string;
};

type CurrentWeatherResponse = {
  message: string;
  data: CurrentWeatherData;
};

export default function CurrentCondition() {
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get<CurrentWeatherResponse>(
          CURRENT_WEATHER_URL,
          { headers: { Accept: "application/json" } },
        );
        if (!cancelled) {
          if (data.data) {
            setWeather(data.data);
          } else {
            setError("Could not load current conditions.");
            setWeather(null);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Could not load current conditions.");
          setWeather(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <article className={`${styles.card} ${styles.cardPrimary}`} aria-label="Current conditions">
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Current conditions</h2>
        <p className={styles.cardKicker}>Today • Local time</p>
      </header>

      {loading && (
        <p className={styles.tempMeta} aria-live="polite">
          Loading…
        </p>
      )}
      {error && !loading && (
        <p className={styles.tempMeta} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && weather && (
        <div className={styles.currentRow}>
          <div className={styles.tempBlock}>
            <div className={styles.tempValue}>{weather.temperature}</div>
            <div className={styles.tempMeta}>
              Feels like {weather.feelsLike} • {weather.weather}
            </div>
          </div>

          <div className={styles.pills} aria-label="Quick metrics">
            <div className={styles.pill}>
              <div className={styles.pillLabel}>Humidity</div>
              <div className={styles.pillValue}>{weather.humidity}</div>
            </div>
            <div className={styles.pill}>
              <div className={styles.pillLabel}>Wind</div>
              <div className={styles.pillValue}>{weather.wind}</div>
            </div>
            <div className={styles.pill}>
              <div className={styles.pillLabel}>UV</div>
              <div className={styles.pillValue}>{weather.uv}</div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
