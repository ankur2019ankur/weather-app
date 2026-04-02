"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "./statepage.module.css";

type ApiState = {
  id: string;
  name: string;
  capital: string;
  temperature: string;
  season: string;
  gdp: string;
  population: string;
  area: string;
};

type StatesResponse = {
  states: ApiState[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3005";

export default function StatePage() {
  const [states, setStates] = useState<ApiState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => `${API_BASE_URL}/api/states`, []);

  const exportToCsv = useCallback(() => {
    const header = ["State", "Capital", "Temperature", "Season", "GDP", "Population", "Area"];
    const rows = states.map((s) => [
      s.name,
      s.capital,
      s.temperature,
      s.season,
      s.gdp,
      s.population,
      s.area,
    ]);

    const escapeCell = (value: string) => `"${value.replaceAll(`"`, `""`)}"`;
    const csv = [header, ...rows].map((r) => r.map(escapeCell).join(",")).join("\n");

    // Add BOM so Excel opens UTF-8 correctly (₹, etc.)
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const filename = `states-${yyyy}-${mm}-${dd}.csv`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }, [states]);

  const fetchStates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get<StatesResponse>(endpoint, {
        headers: { accept: "application/json" },
      });
      setStates(res.data.states ?? []);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const message =
          e.response?.data && typeof e.response.data === "string"
            ? e.response.data
            : e.message || "Failed to load states";
        setError(message);
      } else {
        setError("Failed to load states");
      }
      setStates([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void fetchStates();
  }, [fetchStates]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>States</h1>
          <p className={styles.subtitle}>
            Data source: <span className={styles.pill}>{endpoint}</span>
          </p>
        </div>

        <div className={styles.actions}>
          <div className={styles.pill}>
            {loading ? "Loading…" : `${states.length} state(s)`}
          </div>
          <button
            className={styles.exportButton}
            type="button"
            onClick={exportToCsv}
            disabled={loading || states.length === 0}
          >
            Export To CSV
          </button>
        </div>
      </header>

      {loading ? (
        <section className={styles.status} aria-live="polite">
          <h2 className={styles.statusTitle}>Loading states</h2>
          <p className={styles.statusText}>Fetching data from the API…</p>
        </section>
      ) : error ? (
        <section className={styles.status} role="alert">
          <h2 className={styles.statusTitle}>Couldn’t load states</h2>
          <p className={styles.statusText}>
            {error}
            <br />
            If your frontend is on a different port, make sure your backend allows CORS for it.
          </p>
          <button className={styles.retryButton} type="button" onClick={() => void fetchStates()}>
            Retry
          </button>
        </section>
      ) : (
        <section className={styles.tableSection} aria-label="States table">
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th scope="col">State</th>
                  <th scope="col">Capital</th>
                  <th scope="col">Temperature</th>
                  <th scope="col">Season</th>
                  <th scope="col">GDP</th>
                  <th scope="col">Population</th>
                  <th scope="col">Area</th>
                </tr>
              </thead>
              <tbody>
                {states.map((s) => (
                  <tr key={s.id} className={styles.row}>
                    <th scope="row" className={styles.stateCell}>
                      {s.name}
                    </th>
                    <td>{s.capital}</td>
                    <td className={styles.mono}>{s.temperature}</td>
                    <td>{s.season}</td>
                    <td className={styles.mono}>{s.gdp}</td>
                    <td className={styles.mono}>{s.population}</td>
                    <td className={styles.mono}>{s.area}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}