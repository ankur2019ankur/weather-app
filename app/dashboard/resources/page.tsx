"use client";

import { useEffect, useMemo, useState } from "react";
import { handleUnauthorizedResponse } from "@/lib/clientAuth";
import type { ResourceItem } from "@/lib/resourcesSlice";
import styles from "./page.module.css";

type ResourcesApiResponse = {
  Vault?: ResourceItem[];
  message?: string;
  error?: string;
  errors?: string[];
};

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as ResourcesApiResponse;
    if (typeof data.message === "string" && data.message.trim()) return data.message;
    if (typeof data.error === "string" && data.error.trim()) return data.error;
    if (Array.isArray(data.errors) && data.errors.length) return String(data.errors[0]);
  } catch {
    // Ignore response parsing failures and fallback to status-based message.
  }
  return `Request failed (${res.status})`;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchResourceList() {
      setLoading(true);
      setFetchError(null);

      const cookie = "pum_rest_auth=" + (localStorage.getItem("cookie") ?? "");

      try {
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cookie }),
        });

        if (!res.ok) {
          handleUnauthorizedResponse(res);
          throw new Error(await readErrorMessage(res));
        }

        const data = (await res.json()) as ResourcesApiResponse;
        const items = Array.isArray(data.Vault) ? data.Vault : [];

        if (isMounted) {
          setResources(items);
        }
      } catch (error: unknown) {
        if (isMounted) {
          setFetchError(
            error instanceof Error ? error.message : "Unable to fetch resources.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchResourceList();

    return () => {
      isMounted = false;
    };
  }, []);

  const escapeCsvValue = (value: string | number) => {
    const stringValue = String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const normalizeText = (value: string | undefined) => value?.toLowerCase().trim() ?? "";

  const filteredResources = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (!normalizedSearch) return resources;

    return resources.filter((item) => {
      const searchableValues = [
        normalizeText(item.name),
        normalizeText(item.type),
        normalizeText(item.resource_profile_name),
      ];

      return searchableValues.some((value) => value.includes(normalizedSearch));
    });
  }, [resources, searchTerm]);

  const handleExportCsv = () => {
    if (filteredResources.length === 0) return;

    const headers = ["Name", "Type", "Profile", "Discovery"];
    const rows = filteredResources.map((item) => [
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
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name, type, or profile"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search resources"
            />
            <button
              type="button"
              className={styles.exportButton}
              onClick={handleExportCsv}
              disabled={filteredResources.length === 0}
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
                {filteredResources.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.resource_profile_name ?? "-"}</td>
                    <td>{item.enable_discovery === 1 ? "Enabled" : "Disabled"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {resources.length === 0 && <p className={styles.message}>No resources found.</p>}
            {resources.length > 0 && filteredResources.length === 0 && (
              <p className={styles.message}>No resources match your search.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
