"use client";

import styles from "../page.module.css";

type UserRoleIncludeItem = {
  type?: string;
  source?: string;
  data?: string;
};

type UserRoleListProps = {
  isOpen: boolean;
  selectedRoleName: string;
  isLoading: boolean;
  error: string | null;
  roleRows: UserRoleIncludeItem[];
  onClose: () => void;
};

export default function UserRoleList({
  isOpen,
  selectedRoleName,
  isLoading,
  error,
  roleRows,
  onClose,
}: UserRoleListProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Assigned Roles{selectedRoleName ? ` - ${selectedRoleName}` : ""}
          </h2>
          <button type="button" className={styles.modalCloseButton} onClick={onClose}>
            Close
          </button>
        </div>

        {isLoading && <p className={styles.message}>Loading assigned roles...</p>}
        {error && <p className={styles.error}>Error: {error}</p>}

        {!isLoading && !error && (
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
  );
}