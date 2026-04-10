"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import styles from "./forecast.module.css";

const FORECAST_URL =
  "http://localhost:3005/api/hardcodedapi/forecast-of-day";

type ForecastDay = {
  day: string;
  weather: string;
  temperature: string;
  humidity: string;
};

type ForecastResponse = {
  message: string;
  data: {
    forecast: ForecastDay[];
  };
};

export default function Forecast() {
  const [days, setDays] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get<ForecastResponse>(FORECAST_URL, {
          headers: { Accept: "application/json" },
        });
        if (!cancelled) {
          setDays(data.data?.forecast ?? []);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load forecast.");
          setDays([]);
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
    <article className={styles.card} aria-label="Forecast">
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Forecast</h2>
        <p className={styles.cardKicker}>Next 5 days</p>
      </header>

      {loading && (
        <p className={styles.forecastDesc} aria-live="polite">
          Loading…
        </p>
      )}
      {error && !loading && (
        <p className={styles.forecastDesc} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className={styles.forecastList} role="list">
          {days.map((d) => (
            <div key={d.day} className={styles.forecastItem} role="listitem">
              <div className={styles.forecastDay}>{d.day}</div>
              <div className={styles.forecastDesc}>{d.weather}</div>
              <div className={styles.forecastTemps}>
                <span className={styles.forecastHi}>{d.temperature}</span>
                <span className={styles.forecastLo}>{d.humidity}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
