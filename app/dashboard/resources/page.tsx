"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./page.module.css";

type ResourceItem = {
  id: string;
  name: string;
  type: string;
  resource_profile_name?: string;
  credentials?: number;
  enable_discovery?: number;
};

type ResourcesApiResponse = {
  status: number;
  message: string;
  Vault: ResourceItem[];
};

const API_URL = "http://localhost:3000/api/resources";
const API_COOKIE = "pum_rest_auth=" + (localStorage.getItem("cookie") ?? "");
console.log(API_COOKIE);

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);

        const payload = JSON.stringify({
          cookie: API_COOKIE,
        });

        const config = {
          method: "post" as const,
          maxBodyLength: Infinity,
          url: API_URL,
          headers: {
            "Content-Type": "application/json",
          },
          data: payload,
        };

        const response = await axios.request<ResourcesApiResponse>(config);
        const result = response.data;
        setResources(Array.isArray(result.Vault) ? result.Vault : []);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to fetch resources."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Resources</h1>

      {loading && <p className={styles.message}>Loading resources...</p>}
      {error && <p className={styles.error}>Error: {error}</p>}

      {!loading && !error && (
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