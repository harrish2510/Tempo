// src/components/LoginForm.tsx
"use client";

import { useState, FormEvent } from "react";
import styles from "./LoginForm.module.css";

export default function LoginForm({
  onSubmit,
  initialEmail = "",
  submitLabel = "Login",
}: {
  onSubmit: (email: string, password: string) => Promise<void>;
  initialEmail?: string;
  submitLabel?: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handle(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(email, password);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  }

  return (
    <form className={styles.form} onSubmit={handle}>
      {error && <div className={styles.error}>{error}</div>}

      <label className={styles.label}>
        Email
        <input
          type="email"
          value={email}
          className={styles.input}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className={styles.label}>
        Password
        <input
          type="password"
          value={password}
          className={styles.input}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <button type="submit" className={styles.button}>
        {submitLabel}
      </button>
    </form>
  );
}
