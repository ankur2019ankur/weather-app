"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import styles from "./registration.module.css";

type RegisterResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    address: string;
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
  return `Request failed (${res.status})`;
}

export default function RegistrationPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<RegisterResponse["user"] | null>(null);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      email.trim().includes("@") &&
      password.length >= 6 &&
      address.trim().length >= 3 &&
      !isSubmitting
    );
  }, [address, email, isSubmitting, name, password]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:3005/api/users/register", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          address: address.trim(),
        }),
      });

      if (!res.ok) {
        setError(await readErrorMessage(res));
        return;
      }

      const data = (await res.json()) as RegisterResponse;
      setSuccess(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Registration</h1>
        <p className={styles.subtitle}>Create an account to start using the app.</p>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span className={styles.label}>Name</span>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alice"
                autoComplete="name"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@example.com"
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
                placeholder="secret123"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
              />
              <span className={styles.hint}>Minimum 6 characters.</span>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Address</span>
              <input
                className={styles.input}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="42 Galaxy Way"
                autoComplete="street-address"
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
              <div className={styles.successTitle}>Registered successfully</div>
              <div className={styles.successBody}>
                <div>
                  <span className={styles.k}>ID</span>
                  <span className={styles.v}>{success.id}</span>
                </div>
                <div>
                  <span className={styles.k}>Name</span>
                  <span className={styles.v}>{success.name}</span>
                </div>
                <div>
                  <span className={styles.k}>Email</span>
                  <span className={styles.v}>{success.email}</span>
                </div>
                <div>
                  <span className={styles.k}>Address</span>
                  <span className={styles.v}>{success.address}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
            <Link className={styles.secondary} href="/login">
              I already have an account
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

