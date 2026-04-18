"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AUTH_CHANGED_EVENT, isClientLoggedIn } from "@/lib/clientAuth";
import StoreProvider from "./StoreProvider";
import styles from "./dashboard.module.css";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);

  useEffect(() => {
    function syncSession() {
      const ok = isClientLoggedIn();
      if (!ok) {
        router.replace("/");
        setSessionOk(false);
        return;
      }
      setSessionOk(true);
    }

    syncSession();

    window.addEventListener(AUTH_CHANGED_EVENT, syncSession);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cookie" || e.key === "name" || e.key === null) syncSession();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncSession);
      window.removeEventListener("storage", onStorage);
    };
  }, [router]);

  if (sessionOk !== true) {
    return (
      <div
        className={styles.shell}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
        aria-busy="true"
        aria-label="Checking session"
      >
        <span style={{ color: "var(--text2)" }}>Loading…</span>
      </div>
    );
  }

  return <StoreProvider>{children}</StoreProvider>;
}
