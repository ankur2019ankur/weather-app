"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

const OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast";
const SAMPLE_EVERY_H = 4;
const KOLKATA_LAT = 22.57;
const KOLKATA_LON = 88.36;

type OpenMeteoHourly = {
  time: string[];
  relative_humidity_2m?: (number | null)[];
  temperature?: (number | null)[];
  windspeed?: (number | null)[];
  temperature_2m?: (number | null)[];
  windspeed_10m?: (number | null)[];
};

type OpenMeteoResponse = {
  hourly?: OpenMeteoHourly;
};

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 0 → "12 am", 3 → "3 am", 12 → "12 pm", 15 → "3 pm" */
function formatHour12(hour24: number): string {
  if (hour24 === 0) return "12 am";
  if (hour24 < 12) return `${hour24} am`;
  if (hour24 === 12) return "12 pm";
  return `${hour24 - 12} pm`;
}

function hourLabelFromIso(iso: string | undefined): string {
  if (!iso || iso.length < 13) return "—";
  const hour = parseInt(iso.slice(11, 13), 10);
  if (Number.isNaN(hour)) return "—";
  return formatHour12(hour);
}

function pickEveryNthHour(
  hourly: OpenMeteoHourly,
  stepHours: number,
): { labels: string[]; values: number[] } {
  const { time, relative_humidity_2m = [] } = hourly;
  const labels: string[] = [];
  const values: number[] = [];
  for (let i = 0; i < time.length; i += stepHours) {
    const v = relative_humidity_2m[i];
    if (v == null) continue;
    labels.push(hourLabelFromIso(time[i]));
    values.push(v);
  }
  return { labels, values };
}

function pickEveryNthHourDual(
  time: string[],
  firstSeries: (number | null)[],
  secondSeries: (number | null)[],
  stepHours: number,
): { labels: string[]; firstValues: number[]; secondValues: number[] } {
  const labels: string[] = [];
  const firstValues: number[] = [];
  const secondValues: number[] = [];
  const max = Math.min(time.length, firstSeries.length, secondSeries.length);
  for (let i = 0; i < max; i += stepHours) {
    const a = firstSeries[i];
    const b = secondSeries[i];
    if (a == null || b == null) continue;
    labels.push(hourLabelFromIso(time[i]));
    firstValues.push(a);
    secondValues.push(b);
  }
  return { labels, firstValues, secondValues };
}

const humidityBarOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      backgroundColor: "#161b22",
      borderColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
      titleColor: "#e6edf3",
      bodyColor: "#8b949e",
      padding: 8,
      callbacks: {
        label(ctx: TooltipItem<"bar">) {
          const v = ctx.parsed.y;
          if (v == null || Number.isNaN(v)) return "";
          return `${v}%`;
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: { display: false },
      ticks: { color: "#8b949e", font: { size: 9 } },
    },
    y: {
      display: true,
      min: 0,
      max: 100,
      grid: { color: "rgba(255,255,255,0.06)" },
      ticks: {
        color: "#8b949e",
        font: { size: 9 },
        callback: (value: string | number) => `${value}%`,
      },
    },
  },
  animation: { duration: 600 },
};

const humidityPieSliceColors = [
  "rgba(210,153,34,0.88)",
  "rgba(249,115,22,0.88)",
  "rgba(234,179,8,0.88)",
  "rgba(132,204,22,0.88)",
  "rgba(34,197,94,0.88)",
  "rgba(56,189,248,0.88)",
  "rgba(99,102,241,0.88)",
  "rgba(168,85,247,0.88)",
];

const humidityPieOptions: ChartOptions<"pie"> = {
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 4, bottom: 4, left: 4, right: 4 } },
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: {
        color: "#8b949e",
        boxWidth: 8,
        font: { size: 8 },
        padding: 4,
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: "#161b22",
      borderColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
      titleColor: "#e6edf3",
      bodyColor: "#8b949e",
      padding: 8,
      callbacks: {
        label(ctx: TooltipItem<"pie">) {
          const raw = ctx.raw;
          const v = typeof raw === "number" ? raw : Number(raw);
          if (Number.isNaN(v)) return "";
          return ` ${v}% RH`;
        },
      },
    },
  },
  animation: { duration: 600 },
};

const weatherBarOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: { color: "#8b949e", boxWidth: 10, font: { size: 10 } },
    },
    tooltip: {
      enabled: true,
      backgroundColor: "#161b22",
      borderColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
      titleColor: "#e6edf3",
      bodyColor: "#8b949e",
      padding: 8,
    },
  },
  scales: {
    x: {
      display: true,
      grid: { display: false },
      ticks: { color: "#8b949e", font: { size: 9 } },
    },
    y: {
      display: true,
      beginAtZero: true,
      grid: { color: "rgba(255,255,255,0.06)" },
      ticks: { color: "#8b949e", font: { size: 9 } },
    },
  },
  animation: { duration: 600 },
};

type SecurityOperationsProps = {
  styles: Record<string, string>;
  datasets: { overviewSoc: ChartData<"bar"> };
  /** Grouped bar chart: city lows vs highs with visible axes. */
  temperatureBarOptions: ChartOptions<"bar">;
  /** Relative column widths for SOC vs SIEM (e.g. `[3, 2]`). */
  widgetColumnRatio?: readonly [number, number];
};

export default function SecurityOperations({
  styles,
  datasets,
  temperatureBarOptions,
  widgetColumnRatio = [1, 1],
}: SecurityOperationsProps) {
  const [socFr, siemFr] = widgetColumnRatio;
  const [weatherState, setWeatherState] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [weatherChart, setWeatherChart] = useState<ChartData<"bar"> | null>(null);
  const [weatherSummary, setWeatherSummary] = useState<{
    peakTemp: number;
    peakWind: number;
  } | null>(null);
  const [humidityState, setHumidityState] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [humidityChart, setHumidityChart] = useState<ChartData<"bar"> | null>(null);
  const [humidityPieChart, setHumidityPieChart] = useState<ChartData<"pie"> | null>(null);
  const [humiditySummary, setHumiditySummary] = useState<{
    peak: number;
    low: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const date = toIsoDate(new Date());

    async function load() {
      setWeatherState("loading");
      try {
        const [temperatureRes, windRes] = await Promise.all([
          axios.get<OpenMeteoResponse>(OPEN_METEO_FORECAST, {
            params: {
              latitude: KOLKATA_LAT,
              longitude: KOLKATA_LON,
              hourly: "temperature",
              start_date: date,
              end_date: date,
            },
          }),
          axios.get<OpenMeteoResponse>(OPEN_METEO_FORECAST, {
            params: {
              latitude: KOLKATA_LAT,
              longitude: KOLKATA_LON,
              hourly: "windspeed",
              start_date: date,
              end_date: date,
            },
          }),
        ]);
        if (cancelled) return;
        const temperatureHourly = temperatureRes.data.hourly;
        const windHourly = windRes.data.hourly;
        const time = temperatureHourly?.time ?? windHourly?.time ?? [];
        const tempSeries = temperatureHourly?.temperature ?? temperatureHourly?.temperature_2m ?? [];
        const windSeries = windHourly?.windspeed ?? windHourly?.windspeed_10m ?? [];
        if (!time.length || !tempSeries.length || !windSeries.length) {
          setWeatherState("error");
          setWeatherChart(null);
          setWeatherSummary(null);
          return;
        }
        const { labels, firstValues: temps, secondValues: winds } = pickEveryNthHourDual(
          time,
          tempSeries,
          windSeries,
          SAMPLE_EVERY_H,
        );
        if (!temps.length || !winds.length) {
          setWeatherState("error");
          setWeatherChart(null);
          setWeatherSummary(null);
          return;
        }
        setWeatherChart({
          labels,
          datasets: [
            {
              label: "Temperature (°C)",
              data: temps,
              backgroundColor: "rgba(249,115,22,0.70)",
              borderRadius: 3,
              borderSkipped: false,
            },
            {
              label: "Wind speed (km/h)",
              data: winds,
              backgroundColor: "rgba(59,130,246,0.70)",
              borderRadius: 3,
              borderSkipped: false,
            },
          ],
        });
        setWeatherSummary({
          peakTemp: Math.max(...temps),
          peakWind: Math.max(...winds),
        });
        setWeatherState("ok");
      } catch {
        if (!cancelled) {
          setWeatherState("error");
          setWeatherChart(null);
          setWeatherSummary(null);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const date = toIsoDate(new Date());

    async function load() {
      setHumidityState("loading");
      try {
        const { data } = await axios.get<OpenMeteoResponse>(OPEN_METEO_FORECAST, {
          params: {
            latitude: KOLKATA_LAT,
            longitude: KOLKATA_LON,
            hourly: "relative_humidity_2m",
            start_date: date,
            end_date: date,
          },
        });
        if (cancelled) return;
        const hourly = data.hourly;
        if (!hourly?.time?.length || !hourly.relative_humidity_2m?.length) {
          setHumidityState("error");
          setHumidityChart(null);
          setHumidityPieChart(null);
          setHumiditySummary(null);
          return;
        }
        const { labels, values } = pickEveryNthHour(hourly, SAMPLE_EVERY_H);
        if (!values.length) {
          setHumidityState("error");
          setHumidityChart(null);
          setHumidityPieChart(null);
          setHumiditySummary(null);
          return;
        }
        setHumidityChart({
          labels,
          datasets: [
            {
              label: "Relative humidity",
              data: values,
              backgroundColor: "rgba(210,153,34,0.65)",
              borderRadius: 3,
              borderSkipped: false,
            },
          ],
        });
        setHumidityPieChart({
          labels,
          datasets: [
            {
              label: "Relative humidity",
              data: values,
              backgroundColor: values.map(
                (_, i) => humidityPieSliceColors[i % humidityPieSliceColors.length],
              ),
              borderColor: "rgba(13,17,23,0.95)",
              borderWidth: 1,
            },
          ],
        });
        setHumiditySummary({
          peak: Math.max(...values),
          low: Math.min(...values),
        });
        setHumidityState("ok");
      } catch {
        if (!cancelled) {
          setHumidityState("error");
          setHumidityChart(null);
          setHumidityPieChart(null);
          setHumiditySummary(null);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const weatherStatus = useMemo(() => {
    if (weatherState === "loading") return "Loading…";
    if (weatherState === "error") return "Unavailable";
    return "Live";
  }, [weatherState]);

  const humidityStatus = useMemo(() => {
    if (humidityState === "loading") return "Loading…";
    if (humidityState === "error") return "Unavailable";
    return "Live";
  }, [humidityState]);

  return (
    <div className={styles.gapSection}>
      <div className={styles.secLabel}>
        temperature and humidity monitoring
      </div>
      <div
        className={styles.g2Ratio}
        style={{
          gridTemplateColumns: `${socFr}fr ${siemFr}fr`,
          width: "100%",
          marginInline: "auto",
        }}
      >
        <article className={`${styles.card} ${styles.cardClickable}`} aria-label="SOC widget">
          <div className={styles.cardTitle}>
            Wind speed and temperature{" "}
            <span className={`${styles.badge} ${styles.badgeWarn}`}>{weatherStatus}</span>
          </div>
          <div className={styles.cardSub}>Kolkata every 4 h (Open-Meteo)</div>
          <div className={styles.chartWrap} style={{ height: 168 }}>
            {weatherChart ? (
              <Bar data={weatherChart} options={weatherBarOptions} />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8b949e",
                  fontSize: 12,
                }}
              >
                {weatherState === "error"
                  ? "Could not load weather."
                  : "Loading weather…"}
              </div>
            )}
          </div>
          <div className={styles.rows}>
            <div className={styles.tr}>
              <span className={styles.tk}>Intervals</span>
              <span className={styles.tv}>Every 4 h</span>
            </div>
            <div className={styles.tr}>
              <span className={styles.tk}>Peak today</span>
              <span className={`${styles.tv} ${styles.tvG}`}>
                {weatherSummary
                  ? `${weatherSummary.peakTemp.toFixed(1)}°C | ${weatherSummary.peakWind.toFixed(
                      1,
                    )} km/h`
                  : "—"}
              </span>
            </div>
          </div>
        </article>

        <article className={`${styles.card} ${styles.cardClickable}`} aria-label="SIEM widget">
          <div className={styles.cardTitle}>
            Humidity <span className={`${styles.badge} ${styles.badgeWarn}`}>{humidityStatus}</span>
          </div>
          <div className={styles.cardSub}>Relative humidity every 4 h (Open-Meteo, Kolkata area)</div>
          <div className={styles.chartWrap} style={{ height: 168 }}>
            {humidityChart ? (
              <Bar data={humidityChart} options={humidityBarOptions} />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8b949e",
                  fontSize: 12,
                }}
              >
                {humidityState === "error"
                  ? "Could not load humidity."
                  : "Loading humidity…"}
              </div>
            )}
          </div>
          <div className={styles.chartWrap} style={{ height: 152, marginTop: 8 }}>
            {humidityPieChart ? (
              <Pie data={humidityPieChart} options={humidityPieOptions} />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8b949e",
                  fontSize: 12,
                }}
              >
                {humidityState === "error"
                  ? "Could not load humidity."
                  : "Loading humidity…"}
              </div>
            )}
          </div>
        </article>

      </div>
    </div>
  );
}
