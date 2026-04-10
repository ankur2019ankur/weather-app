import CurrentCondition from "./_component/frontpage/currentcondition";
import Forecast from "./_component/frontpage/forecast";
import HighlightOfDay from "./_component/frontpage/HighlightOfDay";
import Recommentation from "./_component/frontpage/recommentation";
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
        <CurrentCondition />

        <Forecast />

        <HighlightOfDay />

        <Recommentation />
      </section>
    </div>
  );
}
