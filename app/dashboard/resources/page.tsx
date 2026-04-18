"use client";

import { useEffect } from "react";
import { fetchResources } from "@/lib/resourcesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import styles from "./page.module.css";

export default function ResourcesPage() {
  const dispatch = useAppDispatch();
  const { items: resources, status, error } = useAppSelector((s) => s.resources);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchResources());
    }
  }, [dispatch, status]);

  const loading = status === "loading" || status === "idle";
  const fetchError = status === "failed" ? error : null;

  const escapeCsvValue = (value: string | number) => {
    const stringValue = String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const handleExportCsv = () => {
    if (resources.length === 0) return;

    const headers = ["Name", "Type", "Profile", "Discovery"];
    const rows = resources.map((item) => [
      item.name ?? "",
      item.type ?? "",
      item.resource_profile_name ?? "-",
      item.enable_discovery === 1 ? "Enabled" : "Disabled",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateLabel = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `resources-${dateLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Resources</h1>

      {loading && <p className={styles.message}>Loading resources...</p>}
      {fetchError && <p className={styles.error}>Error: {fetchError}</p>}

      {!loading && !fetchError && (
        <>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.exportButton}
              onClick={handleExportCsv}
              disabled={resources.length === 0}
            >
              Export CSV
            </button>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Profile</th>
                  <th>Discovery</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.resource_profile_name ?? "-"}</td>
                    <td>{item.enable_discovery === 1 ? "Enabled" : "Disabled"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {resources.length === 0 && (
              <p className={styles.message}>No resources found.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
