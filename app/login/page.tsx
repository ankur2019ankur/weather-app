"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import styles from "./login.module.css";

type SpfLoginOk = {
  name: string;
  identityContent: string;
  message: string;
};

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
    if (typeof data?.error === "string" && data.error.trim()) return data.error;
    if (Array.isArray(data?.errors) && data.errors.length) return String(data.errors[0]);
  } catch {
    // ignore JSON parse errors
  }
  return `Login failed (${res.status})`;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SpfLoginOk | null>(null);

  const canSubmit = useMemo(() => {
    return username.trim().length >= 1 && password.length >= 1 && !isSubmitting;
  }, [username, isSubmitting, password.length]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/spf/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username.trim(),
          password,
        }),
      });

      if (!res.ok) {
        setError(await readErrorMessage(res));
        return;
      }

      const data = (await res.json()) as SpfLoginOk;

      localStorage.setItem("name", data.name);
      localStorage.setItem("cookie", data.identityContent);

      setSuccess(data);
      window.dispatchEvent(new Event("auth-changed"));
      router.push("/state");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.subtitle}>Sign in to continue.</p>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span className={styles.label}>Username</span>
              <input
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Password</span>
              <input
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password890"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          {error ? (
            <div className={styles.alertError} role="alert">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className={styles.alertSuccess} role="status">
              Logged in successfully. Session saved to localStorage.
            </div>
          ) : null}

          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
            <Link className={styles.secondary} href="/registration">
              Create account
            </Link>
            <Link className={styles.tertiary} href="/">
              Back to dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

