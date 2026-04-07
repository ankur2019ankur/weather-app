"use client";

import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

import dashboardStyles from "../../dashboard.module.css";
import styles from "./infrastructure_and_network.module.css";

type MiniLineData = ChartData<"line", (number | null)[], unknown>;
type MiniLineOptions = ChartOptions<"line">;

export default function InfrastructureAndNetwork(props: {
  datasets: { overviewWan: MiniLineData };
  baseMiniLineOptions: MiniLineOptions;
}) {
  const { datasets, baseMiniLineOptions } = props;

  return (
    <div className={dashboardStyles.gapSection}>
      <div className={dashboardStyles.secLabel}>Infrastructure &amp; Network</div>
      <div className={dashboardStyles.g2}>
        <article
          className={`${dashboardStyles.card} ${dashboardStyles.cardClickable}`}
          aria-label="NGC DC and DR widget"
        >
          <div className={dashboardStyles.cardTitle}>
            NGC DC &amp; DR <span className={`${dashboardStyles.badge} ${dashboardStyles.badgeOk}`}>Healthy</span>
          </div>
          <div className={dashboardStyles.cardSub}>Site health overview</div>

          <div className={`${dashboardStyles.prog} ${styles.progTop}`}>
            <div className={dashboardStyles.progLbl}>
              <span>Server utilization</span>
              <span>62%</span>
            </div>
            <div className={dashboardStyles.progBar}>
              <div className={`${dashboardStyles.progFill} ${dashboardStyles.pfGreen}`} style={{ width: "62%" }} />
            </div>
          </div>
          <div className={dashboardStyles.prog}>
            <div className={dashboardStyles.progLbl}>
              <span>Storage utilization</span>
              <span>78%</span>
            </div>
            <div className={dashboardStyles.progBar}>
              <div className={`${dashboardStyles.progFill} ${dashboardStyles.pfAmber}`} style={{ width: "78%" }} />
            </div>
          </div>
          <div className={dashboardStyles.prog}>
            <div className={dashboardStyles.progLbl}>
              <span>Network I/O</span>
              <span>44%</span>
            </div>
            <div className={dashboardStyles.progBar}>
              <div className={`${dashboardStyles.progFill} ${dashboardStyles.pfBlue}`} style={{ width: "44%" }} />
            </div>
          </div>

          <div className={dashboardStyles.rows}>
            <div className={dashboardStyles.tr}>
              <span className={dashboardStyles.tk}>DC uptime</span>
              <span className={`${dashboardStyles.tv} ${dashboardStyles.tvG}`}>99.97%</span>
            </div>
            <div className={dashboardStyles.tr}>
              <span className={dashboardStyles.tk}>DR last tested</span>
              <span className={dashboardStyles.tv}>14 Mar 2026</span>
            </div>
          </div>
        </article>

        <article
          className={`${dashboardStyles.card} ${dashboardStyles.cardClickable}`}
          aria-label="Networking BSNL widget"
        >
          <div className={dashboardStyles.cardTitle}>
            Networking BSNL{" "}
            <span className={`${dashboardStyles.badge} ${dashboardStyles.badgeWarn}`}>Degraded</span>
          </div>
          <div className={dashboardStyles.cardSub}>WAN / SD-WAN status</div>
          <div className={`${dashboardStyles.chartWrap} ${styles.wanChart}`}>
            <Line data={datasets.overviewWan} options={baseMiniLineOptions} />
          </div>
          <div className={dashboardStyles.rows}>
            <div className={`${dashboardStyles.tr} ${styles.firstRowTight}`}>
              <span className={dashboardStyles.tk}>Remote WAN links</span>
              <span className={`${dashboardStyles.tv} ${dashboardStyles.tvY}`}>1,204 / 1,218</span>
            </div>
            <div className={dashboardStyles.tr}>
              <span className={dashboardStyles.tk}>Links down</span>
              <span className={`${dashboardStyles.tv} ${dashboardStyles.tvR}`}>14</span>
            </div>
            <div className={dashboardStyles.tr}>
              <span className={dashboardStyles.tk}>Backhaul utilization</span>
              <span className={`${dashboardStyles.tv} ${dashboardStyles.tvY}`}>71%</span>
            </div>
            <div className={dashboardStyles.tr}>
              <span className={dashboardStyles.tk}>MPLS Mysuru ↔ NGC</span>
              <span className={`${dashboardStyles.badge} ${dashboardStyles.badgeOk}`}>Up</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}