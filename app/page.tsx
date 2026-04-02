import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.shell}>
      <section className={styles.hero} aria-label="Dashboard header">
        <div className={styles.heroText}>
          <h1 className={styles.title}>Weather Dashboard</h1>
          <p className={styles.subtitle}>
            Search a city to view current conditions, forecasts, and key stats.
          </p>
        </div>

        <form className={styles.search} action="#" role="search" aria-label="Search city">
          <label className={styles.srOnly} htmlFor="city">
            City
          </label>
          <input
            id="city"
            name="city"
            className={styles.searchInput}
            placeholder="Search city (e.g., London, Tokyo, Lagos)"
            autoComplete="off"
          />
          <button className={styles.searchButton} type="button">
            Search
          </button>
        </form>
      </section>

      <section className={styles.grid} aria-label="Dashboard content">
        <article className={`${styles.card} ${styles.cardPrimary}`} aria-label="Current conditions">
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Current conditions</h2>
            <p className={styles.cardKicker}>Today • Local time</p>
          </header>

          <div className={styles.currentRow}>
            <div className={styles.tempBlock}>
              <div className={styles.tempValue}>24°</div>
              <div className={styles.tempMeta}>Feels like 26° • Partly cloudy</div>
            </div>

            <div className={styles.pills} aria-label="Quick metrics">
              <div className={styles.pill}>
                <div className={styles.pillLabel}>Humidity</div>
                <div className={styles.pillValue}>62%</div>
              </div>
              <div className={styles.pill}>
                <div className={styles.pillLabel}>Wind</div>
                <div className={styles.pillValue}>11 km/h</div>
              </div>
              <div className={styles.pill}>
                <div className={styles.pillLabel}>UV</div>
                <div className={styles.pillValue}>Moderate</div>
              </div>
            </div>
          </div>

          <footer className={styles.cardFooter}>
            <button className={styles.secondaryButton} type="button">
              View details
            </button>
            <button className={styles.ghostButton} type="button">
              Change units
            </button>
          </footer>
        </article>

        <article className={styles.card} aria-label="Forecast">
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Forecast</h2>
            <p className={styles.cardKicker}>Next 5 days</p>
          </header>

          <div className={styles.forecastList} role="list">
            {[
              { day: "Mon", hi: 26, lo: 18, desc: "Sunny" },
              { day: "Tue", hi: 25, lo: 17, desc: "Cloudy" },
              { day: "Wed", hi: 23, lo: 16, desc: "Rain" },
              { day: "Thu", hi: 24, lo: 16, desc: "Showers" },
              { day: "Fri", hi: 27, lo: 19, desc: "Clear" },
            ].map((d) => (
              <div key={d.day} className={styles.forecastItem} role="listitem">
                <div className={styles.forecastDay}>{d.day}</div>
                <div className={styles.forecastDesc}>{d.desc}</div>
                <div className={styles.forecastTemps}>
                  <span className={styles.forecastHi}>{d.hi}°</span>
                  <span className={styles.forecastLo}>{d.lo}°</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.card} aria-label="Highlights">
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Highlights</h2>
            <p className={styles.cardKicker}>What matters right now</p>
          </header>

          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Visibility</div>
              <div className={styles.statValue}>9.8 km</div>
              <div className={styles.statHint}>Good driving conditions</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Pressure</div>
              <div className={styles.statValue}>1016 hPa</div>
              <div className={styles.statHint}>Stable</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Sunrise</div>
              <div className={styles.statValue}>06:21</div>
              <div className={styles.statHint}>Sunset 19:44</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Air quality</div>
              <div className={styles.statValue}>42</div>
              <div className={styles.statHint}>Fair</div>
            </div>
          </div>
        </article>

        <article className={styles.card} aria-label="Tips">
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recommendations</h2>
            <p className={styles.cardKicker}>Based on current conditions</p>
          </header>

          <ul className={styles.tips}>
            <li className={styles.tipItem}>
              <span className={styles.tipDot} aria-hidden="true" />
              Bring sunglasses — UV is moderate.
            </li>
            <li className={styles.tipItem}>
              <span className={styles.tipDot} aria-hidden="true" />
              Light jacket in the evening (low ~18°).
            </li>
            <li className={styles.tipItem}>
              <span className={styles.tipDot} aria-hidden="true" />
              Best outdoor window: 12:00–16:00.
            </li>
          </ul>

          <footer className={styles.cardFooter}>
            <button className={styles.secondaryButton} type="button">
              Save city
            </button>
            <button className={styles.ghostButton} type="button">
              Share
            </button>
          </footer>
        </article>
      </section>
    </div>
  );
}
