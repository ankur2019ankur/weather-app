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

type UserRoleIncludeItem = {
  type?: string;
  source?: string;
  data?: string;
};

type UserRoleApiResponse = {
  Result?: {
    UserRole?: {
      id?: number;
      name?: string;
      include?: UserRoleIncludeItem[];
    };
  };
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
  const DEFAULT_PAGE_SIZE = 10;
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [roleRows, setRoleRows] = useState<UserRoleIncludeItem[]>([]);
  const [roleModalLoading, setRoleModalLoading] = useState(false);
  const [roleModalError, setRoleModalError] = useState<string | null>(null);
  const [selectedRoleName, setSelectedRoleName] = useState<string>("");

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

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / pageSize));

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResources.slice(start, start + pageSize);
  }, [filteredResources, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    setCurrentPage((prevPage) => Math.min(prevPage, totalPages));
  }, [totalPages]);

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

  const openAssignedRolesModal = async (roleId: string) => {
    setRoleModalLoading(true);
    setRoleModalError(null);
    setRoleRows([]);
    setSelectedRoleName("");
    setIsRolesModalOpen(true);
    setOpenMenuId(null);

    const cookie = "pum_rest_auth=" + (localStorage.getItem("cookie") ?? "");

    try {
      const res = await fetch(`/api/resources/roles/${encodeURIComponent(roleId)}`, {
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

      const data = (await res.json()) as UserRoleApiResponse;
      const includeRows = Array.isArray(data.Result?.UserRole?.include)
        ? data.Result?.UserRole?.include
        : [];

      setRoleRows(includeRows);
      setSelectedRoleName(data.Result?.UserRole?.name ?? `Role ${roleId}`);
    } catch (error: unknown) {
      setRoleModalError(
        error instanceof Error ? error.message : "Unable to fetch assigned roles.",
      );
    } finally {
      setRoleModalLoading(false);
    }
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
            <div className={styles.actionButtons}>
              <label className={styles.limitControl}>
                Limit
                <input
                  type="number"
                  min={1}
                  className={styles.limitInput}
                  value={pageSize}
                  onChange={(event) => {
                    const parsed = Number.parseInt(event.target.value, 10);
                    if (!Number.isNaN(parsed) && parsed > 0) {
                      setPageSize(parsed);
                    }
                  }}
                  aria-label="Rows per page"
                />
              </label>
              <button
                type="button"
                className={styles.exportButton}
                onClick={handleExportCsv}
                disabled={filteredResources.length === 0}
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Profile</th>
                  <th>Discovery</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResources.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.resource_profile_name ?? "-"}</td>
                    <td>{item.enable_discovery === 1 ? "Enabled" : "Disabled"}</td>
                    <td className={styles.actionCell}>
                      <div className={styles.actionDropdown}>
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() =>
                            setOpenMenuId((prev) => (prev === item.id ? null : item.id))
                          }
                          aria-expanded={openMenuId === item.id}
                        >
                          Actions
                        </button>
                        {openMenuId === item.id && (
                          <div className={styles.dropdownMenu}>
                            <button
                              type="button"
                              className={styles.dropdownItem}
                              onClick={() => void openAssignedRolesModal(item.id)}
                            >
                              View Assigned Roles
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {resources.length === 0 && <p className={styles.message}>No resources found.</p>}
            {resources.length > 0 && filteredResources.length === 0 && (
              <p className={styles.message}>No resources match your search.</p>
            )}
          </div>
          {filteredResources.length > 0 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.paginationButton}
                onClick={() => setCurrentPage((prevPage) => Math.max(1, prevPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <p className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </p>
              <button
                type="button"
                className={styles.paginationButton}
                onClick={() =>
                  setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      {isRolesModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Assigned Roles{selectedRoleName ? ` - ${selectedRoleName}` : ""}
              </h2>
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={() => setIsRolesModalOpen(false)}
              >
                Close
              </button>
            </div>

            {roleModalLoading && <p className={styles.message}>Loading assigned roles...</p>}
            {roleModalError && <p className={styles.error}>Error: {roleModalError}</p>}

            {!roleModalLoading && !roleModalError && (
              <div className={styles.modalTableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Source</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleRows.map((includeRow, index) => (
                      <tr key={`${includeRow.type ?? "type"}-${index}`}>
                        <td>{includeRow.type ?? "-"}</td>
                        <td>{includeRow.source ?? "-"}</td>
                        <td>{includeRow.data ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {roleRows.length === 0 && (
                  <p className={styles.message}>No assigned roles found in this role.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
