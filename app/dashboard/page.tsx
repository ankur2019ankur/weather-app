"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./dashboard.module.css";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

import InfrastructureAndNetwork from "./_components/infrastructure/infrastructure_and_network";
import ActiveAlert from "./_components/active_alert/active_alert";
import SecurityOperations from "./_components/security_operations/security_operations";
import ApplicationAndNetwork from "./_components/application_and_network/application_and_neetwork";
import Topbar from "./_components/dashboardNavbar/topbar";
import BottomNavbar from "./_components/dashboardNavbar/bottomNavbar";
import Sidebar, { type TabKey } from "./_components/dashboardNavbar/sidebar";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
);

const HRS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

function useClock() {
  const [ts, setTs] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTs(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return ts;
}

const baseMiniLineOptions = {
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
    },
  },
  scales: { x: { display: false }, y: { display: false } },
  elements: { point: { radius: 0 } },
  animation: { duration: 600 },
} as const;

const baseMiniBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: baseMiniLineOptions.plugins,
  scales: { x: { display: false }, y: { display: false } },
  animation: { duration: 600 },
} as const;

type AlertKind = "critical" | "warning";

export default function DashboardPage() {
  const now = useClock();
  const [tab, setTab] = useState<TabKey>("overview");

  const clockText = useMemo(() => {
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s} IST`;
  }, [now]);

  const refreshText = useMemo(() => {
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    return `Last refreshed: ${h}:${m}:${s}`;
  }, [now]);

  const datasets = useMemo(() => {
    const overviewSoc = {
      labels: HRS,
      datasets: [
        {
          data: [120, 180, 247, 310, 260, 200, 247],
          backgroundColor: "rgba(56,139,253,0.6)",
          borderRadius: 3,
          borderSkipped: false as const,
        },
      ],
    };
    const overviewSiem = {
      labels: HRS,
      datasets: [
        {
          data: [200, 320, 410, 380, 290, 340, 280],
          backgroundColor: "rgba(210,153,34,0.6)",
          borderRadius: 3,
          borderSkipped: false as const,
        },
      ],
    };
    const overviewApm = {
      labels: HRS,
      datasets: [
        {
          data: [190, 200, 215, 230, 225, 220, 218],
          borderColor: "#3fb950",
          borderWidth: 1.5,
          tension: 0.4,
          fill: true,
          backgroundColor: "rgba(63,185,80,0.12)",
        },
      ],
    };
    const overviewWan = {
      labels: HRS,
      datasets: [
        {
          data: [1218, 1216, 1212, 1208, 1206, 1204, 1204],
          borderColor: "#ff7b72",
          borderWidth: 1.5,
          tension: 0.35,
          fill: true,
          backgroundColor: "rgba(248,81,73,0.12)",
        },
      ],
    };
    /** Dew point (°C) + wind speed (km/h) mini sparklines — same hourly labels as WAN/APm. */
    const dewWindPoints = {
      labels: HRS,
      datasets: [
        {
          label: "Dew point (°C)",
          data: [6, 8, 10, 12, 11, 9, 8],
          borderColor: "#58a6ff",
          borderWidth: 1.5,
          tension: 0.35,
          fill: true,
          backgroundColor: "rgba(88,166,255,0.12)",
        },
        {
          label: "Wind (km/h)",
          data: [8, 12, 18, 22, 20, 14, 10],
          borderColor: "#a371f7",
          borderWidth: 1.5,
          tension: 0.35,
          fill: false,
        },
      ],
    };
    const vmMix = {
      labels: ["Running", "Stopped", "Error"],
      datasets: [
        {
          data: [336, 3, 1],
          backgroundColor: ["#3fb950", "#d29922", "#f85149"],
          borderWidth: 0,
        },
      ],
    };

    return { overviewSoc, overviewSiem, overviewApm, overviewWan, dewWindPoints, vmMix };
  }, []);

  const activeAlerts = useMemo(
    () =>
      [
        {
          kind: "critical" as const,
          title: "Rain / Heavy Rain Alert",
          detail: "Heavy rainfall expected in the next 24 hours. Avoid low-lying areas and stay indoors.",
          time: "14:28 IST",
        },
        {
          kind: "critical" as const,
          title: "Storm / Thunderstorm Alert",
          detail: "Storm / Thunderstorm expected in the next 24 hours. Avoid low-lying areas and stay indoors.",
          time: "13:51 IST",
        },
        {
          kind: "warning" as const,
          title: "Heatwave Alert",
          detail: "Heatwave expected in the next 24 hours. Avoid outdoor activities and stay indoors.",
          time: "12:14 IST",
        },
      ] satisfies Array<{ kind: AlertKind; title: string; detail: string; time: string }>,
    [],
  );

  return (
    <div className={styles.shell}>
      <Topbar clockText={clockText} />

      <BottomNavbar tab={tab} setTab={setTab} />

      <div className={styles.layout}>
        <Sidebar tab={tab} setTab={setTab} />

        <section className={styles.main} aria-label="Dashboard main content">
          {tab === "overview" ? (
            <>
              <SecurityOperations
                styles={styles}
                datasets={datasets}
                baseMiniBarOptions={baseMiniBarOptions}
                baseMiniLineOptions={baseMiniLineOptions}
              />

              <InfrastructureAndNetwork datasets={datasets} baseMiniLineOptions={baseMiniLineOptions} />

              <ActiveAlert activeAlerts={activeAlerts} />
            </>
          ) : (
            <div className={styles.card} aria-label="Tab placeholder">
              <div className={styles.cardTitle}>
                {tab === "security"
                  ? "Security Ops"
                  : tab === "appdb"
                    ? "Application & DB"
                    : tab === "infra"
                      ? "Infrastructure & Network"
                      : "Service Management"}{" "}
                <span className={`${styles.badge} ${styles.badgeWarn}`}>Coming soon</span>
              </div>
              <div className={styles.cardSub}>
                This tab is ready for more widgets (charts, tables, and live data) just like the wireframe.
              </div>
              <div className={styles.rows}>
                <div className={styles.tr}>
                  <span className={styles.tk}>Next</span>
                  <span className={styles.tv}>Add more widget cards + charts</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <footer className={styles.footer}>
        <span>Weather Dashboard v1</span>
        <span>{refreshText}</span>
        <span>Data source: OpenWeatherMap API</span>
      </footer>
    </div>
  );
}

