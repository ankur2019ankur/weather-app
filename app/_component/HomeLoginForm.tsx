"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import styles from "../login/login.module.css";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
  };
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

export default function HomeLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<LoginResponse | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().includes("@") && password.length >= 1 && !isSubmitting;
  }, [email, isSubmitting, password.length]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:3005/api/users/login", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!res.ok) {
        setError(await readErrorMessage(res));
        return;
      }

      const data = (await res.json()) as LoginResponse;

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email.trim());
      localStorage.setItem("password", password);

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
    <div className={styles.card}>
      <h2 className={styles.title}>Login</h2>
      <p className={styles.subtitle}>Sign in to continue.</p>

      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Username</span>
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
              autoComplete="email"
              inputMode="email"
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
            Logged in successfully. Token saved to localStorage.
          </div>
        ) : null}

        <div className={styles.actions}>
          <button className={styles.primary} type="submit" disabled={!canSubmit}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}

