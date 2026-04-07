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

type TabKey = "overview" | "security" | "appdb" | "infra" | "service";

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

    return { overviewSoc, overviewSiem, overviewApm, overviewWan, vmMix };
  }, []);

  const activeAlerts = useMemo(
    () =>
      [
        {
          kind: "critical" as const,
          title: "Database latency spike detected",
          detail: "ClickHouse query time >2s · Affecting 14 slow queries · DB team notified",
          time: "14:28 IST",
        },
        {
          kind: "critical" as const,
          title: "2 remote WAN links down",
          detail: "Escalated to DOP NI L2 · Locations: Dehradun, Srinagar",
          time: "13:51 IST",
        },
        {
          kind: "warning" as const,
          title: "NGC DC storage utilization at 78%",
          detail: "Threshold approaching 80% · Capacity review scheduled",
          time: "12:14 IST",
        },
      ] satisfies Array<{ kind: AlertKind; title: string; detail: string; time: string }>,
    [],
  );

  return (
    <div className={styles.shell}>
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

      <div className={styles.nav} role="tablist" aria-label="Dashboard tabs">
        <button
          type="button"
          className={`${styles.navTab} ${tab === "overview" ? styles.navTabActive : ""}`}
          onClick={() => setTab("overview")}
          role="tab"
          aria-selected={tab === "overview"}
        >
          <span className={styles.navDot} style={{ background: "var(--blue)" }} />
          Overview
        </button>
        <button
          type="button"
          className={`${styles.navTab} ${tab === "security" ? styles.navTabActive : ""}`}
          onClick={() => setTab("security")}
          role="tab"
          aria-selected={tab === "security"}
        >
          <span className={styles.navDot} style={{ background: "var(--amber)" }} />
          Security Ops
        </button>
        <button
          type="button"
          className={`${styles.navTab} ${tab === "appdb" ? styles.navTabActive : ""}`}
          onClick={() => setTab("appdb")}
          role="tab"
          aria-selected={tab === "appdb"}
        >
          <span className={styles.navDot} style={{ background: "var(--teal)" }} />
          Application &amp; DB
        </button>
        <button
          type="button"
          className={`${styles.navTab} ${tab === "infra" ? styles.navTabActive : ""}`}
          onClick={() => setTab("infra")}
          role="tab"
          aria-selected={tab === "infra"}
        >
          <span className={styles.navDot} style={{ background: "var(--green)" }} />
          Infrastructure &amp; NW
        </button>
        <button
          type="button"
          className={`${styles.navTab} ${tab === "service" ? styles.navTabActive : ""}`}
          onClick={() => setTab("service")}
          role="tab"
          aria-selected={tab === "service"}
        >
          <span className={styles.navDot} style={{ background: "var(--red)" }} />
          Service Management
        </button>
      </div>

      <div className={styles.kpiBar} aria-label="Key performance indicators">
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Online Users</div>
          <div className={styles.kpiValue}>12,840</div>
          <div className={`${styles.kpiTrend} ${styles.trendUp}`}>▲ 4.2% vs yesterday</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Business Volume</div>
          <div className={styles.kpiValue}>₹2.41Cr</div>
          <div className={`${styles.kpiTrend} ${styles.trendUp}`}>▲ 1.8% today</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Avg Response Time</div>
          <div className={styles.kpiValue}>218ms</div>
          <div className={`${styles.kpiTrend} ${styles.trendWarn}`}>▲ 12ms spike</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Open Tickets</div>
          <div className={styles.kpiValue}>47</div>
          <div className={`${styles.kpiTrend} ${styles.trendDn}`}>▲ 6 new today</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>SLA Compliance</div>
          <div className={styles.kpiValue}>96.4%</div>
          <div className={`${styles.kpiTrend} ${styles.trendUp}`}>▲ 0.4% this week</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Active Alerts</div>
          <div className={`${styles.kpiValue} ${styles.kpiValueRed}`}>3</div>
          <div className={`${styles.kpiTrend} ${styles.trendDn}`}>2 critical · 1 warning</div>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Sidebar navigation">
          <div className={styles.sidebarSectionLabel}>Quick Jump</div>
          <div
            className={`${styles.sidebarItem} ${tab === "overview" ? styles.sidebarItemActive : ""}`}
            onClick={() => setTab("overview")}
            role="button"
            tabIndex={0}
          >
            <div className={styles.sidebarItemLeft}>
              <span className={`${styles.sDot} ${styles.sDotG}`} />
              Overview
            </div>
          </div>
          <div
            className={`${styles.sidebarItem} ${tab === "security" ? styles.sidebarItemActive : ""}`}
            onClick={() => setTab("security")}
            role="button"
            tabIndex={0}
          >
            <div className={styles.sidebarItemLeft}>
              <span className={`${styles.sDot} ${styles.sDotY}`} />
              Security Ops
            </div>
          </div>
          <div
            className={`${styles.sidebarItem} ${tab === "appdb" ? styles.sidebarItemActive : ""}`}
            onClick={() => setTab("appdb")}
            role="button"
            tabIndex={0}
          >
            <div className={styles.sidebarItemLeft}>
              <span className={`${styles.sDot} ${styles.sDotG}`} />
              Application &amp; DB
            </div>
          </div>
          <div
            className={`${styles.sidebarItem} ${tab === "infra" ? styles.sidebarItemActive : ""}`}
            onClick={() => setTab("infra")}
            role="button"
            tabIndex={0}
          >
            <div className={styles.sidebarItemLeft}>
              <span className={`${styles.sDot} ${styles.sDotG}`} />
              Infrastructure
            </div>
          </div>
          <div
            className={`${styles.sidebarItem} ${tab === "service" ? styles.sidebarItemActive : ""}`}
            onClick={() => setTab("service")}
            role="button"
            tabIndex={0}
          >
            <div className={styles.sidebarItemLeft}>
              <span className={`${styles.sDot} ${styles.sDotR}`} />
              Service Mgmt
            </div>
          </div>
        </aside>

        <section className={styles.main} aria-label="Dashboard main content">
          {tab === "overview" ? (
            <>
              <SecurityOperations
                styles={styles}
                datasets={datasets}
                baseMiniBarOptions={baseMiniBarOptions}
                baseMiniLineOptions={baseMiniLineOptions}
              />

              <div className={styles.gapSection}>
                <div className={styles.secLabel}>Application &amp; Network</div>
                <div className={styles.g2}>
                  <article className={`${styles.card} ${styles.cardClickable}`} aria-label="APM widget">
                    <div className={styles.cardTitle}>
                      APM <span className={`${styles.badge} ${styles.badgeOk}`}>Healthy</span>
                    </div>
                    <div className={styles.cardSub}>Response time trend</div>
                    <div className={styles.chartWrap} style={{ height: 90 }}>
                      <Line data={datasets.overviewApm} options={baseMiniLineOptions} />
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
                      <Line data={datasets.overviewWan} options={baseMiniLineOptions} />
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

