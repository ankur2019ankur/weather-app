"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AUTH_CHANGED_EVENT, clearClientSession } from "@/lib/clientAuth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const links = useMemo(() => {
    if (isLoggedIn) {
      return [
        { href: "/dashboard", label: "Dashboard" },
      ];
    }
    return [
      { href: "/", label: "Login" },
    ];
  }, [isLoggedIn]);

  useEffect(() => {
    const readAuth = () => {
      try {
        const cookie = localStorage.getItem("cookie");
        setIsLoggedIn(Boolean(cookie && cookie.trim()));
      } catch {
        setIsLoggedIn(false);
      }
    };

    readAuth();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "cookie") readAuth();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_CHANGED_EVENT, readAuth as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_CHANGED_EVENT, readAuth as EventListener);
    };
  }, []);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.brand}>
          Privileged Access Manager
        </Link>

        <div className={styles.spacer} />

        <ul className={styles.links}>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={styles.link}>
                {l.label}
              </Link>
            </li>
          ))}

          {isLoggedIn ? (
            <li>
              <button type="button" className={`${styles.link} ${styles.linkButton}`} onClick={clearClientSession}>
                Logout
              </button>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}