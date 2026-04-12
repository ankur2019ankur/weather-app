"use client";

import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

import dashboardStyles from "../../dashboard.module.css";
import styles from "./infrastructure_and_network.module.css";

type MiniLineData = ChartData<"line", (number | null)[], unknown>;
type MiniLineOptions = ChartOptions<"line">;

// 3. Wind (Speed & Direction)
// 5 km/h → Light breeze
// 20 km/h → Noticeable wind
// 60 km/h → Strong wind (trees sway)

const windSpeedData = [
  {
    label: "Light breeze",
    percentage: 50,
    unit: "km/h",
  },
  {
    label: "Noticeable wind",
    percentage: 30,
    unit: "km/h",
  },
  {
    label: "Strong wind (trees sway)",
    percentage: 20,
    unit: "km/h",
  },
];

const windSpeedBarFillClasses = [
  dashboardStyles.pfGreen,
  dashboardStyles.pfAmber,
  dashboardStyles.pfBlue,
] as const;

export default function InfrastructureAndNetwork(props: {
  datasets: { overviewWan: MiniLineData; dewWindPoints: MiniLineData };
  baseMiniLineOptions: MiniLineOptions;
  /** Relative column widths for Wind vs Dew (e.g. `[2, 1]` → first column twice as wide). */
  widgetColumnRatio?: readonly [number, number];
}) {
  const { datasets, baseMiniLineOptions, widgetColumnRatio = [1, 1] } = props;
  const [windFr, dewFr] = widgetColumnRatio;
  const dominantWind = windSpeedData.reduce((best, row) =>
    row.percentage > best.percentage ? row : best
  );

  return (
    <div className={dashboardStyles.gapSection}>
      <div className={dashboardStyles.secLabel}>Wind &amp; Cloud Monitoring</div>
      <div
        className={dashboardStyles.g2Ratio}
        style={{ gridTemplateColumns: `${windFr}fr ${dewFr}fr` }}
      >
        <article
          className={`${dashboardStyles.card} ${dashboardStyles.cardClickable}`}
          aria-label="Wind Speed widget"
        >
          <div className={dashboardStyles.cardTitle}>
            Wind Speed{" "}
            <span className={`${dashboardStyles.badge} ${dashboardStyles.badgeOk}`}>{dominantWind.label}</span>
          </div>
          <div className={dashboardStyles.cardSub}>Site health overview</div>

          {windSpeedData.map((row, index) => (
            <div
              key={row.label}
              className={`${dashboardStyles.prog} ${index === 0 ? styles.progTop : ""}`.trim()}
            >
              <div className={dashboardStyles.progLbl}>
                <span>{row.label}</span>
                <span>{row.percentage}%</span>
              </div>
              <div className={dashboardStyles.progBar}>
                <div
                  className={`${dashboardStyles.progFill} ${windSpeedBarFillClasses[index % windSpeedBarFillClasses.length]}`}
                  style={{ width: `${row.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </article>

        <article
          className={`${dashboardStyles.card} ${dashboardStyles.cardClickable}`}
          aria-label="Networking BSNL widget"
        >
          <div className={dashboardStyles.cardTitle}>
            Dew Point{" "}
            <span className={`${dashboardStyles.badge} ${dashboardStyles.badgeWarn}`}>Dry and comfortable</span>
          </div>
          <div className={dashboardStyles.cardSub}>Site health overview</div>
          <div className={`${dashboardStyles.chartWrap} ${styles.wanChart}`}>
            <Line data={datasets.dewWindPoints} options={baseMiniLineOptions} />
          </div>
          <div className={dashboardStyles.rows}>
            <div className={`${dashboardStyles.tr} ${styles.firstRowTight}`}>
              <span className={dashboardStyles.tk}>Snowfall in mountains</span>
              <span className={`${dashboardStyles.tv} ${dashboardStyles.tvY}`}>10 cm</span>
            </div>
            <div className={dashboardStyles.tr}>
              <span className={dashboardStyles.tk}>Hail during thunderstorms</span>
              <span className={`${dashboardStyles.tv} ${dashboardStyles.tvR}`}>2 cm</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}