// src/app/student/assignments/[id]/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./assignment.module.css";

interface Assignment {
  id: string;
  name: string;
  description: string;
  dueDate: string;
}

interface SubmissionResult {
  score: number;
  feedback: string;
  improvement?: string;
}

export default function AssignmentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  // 1) Fetch assignment metadata
  useEffect(() => {
    fetch(`/api/assignments/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json() as Promise<Assignment>;
      })
      .then(setAssignment)
      .catch(() => {
        // assignment not found or not allowed → back to dashboard
        router.replace("/student/dashboard");
      });
  }, [id, router]);

  if (!assignment) {
    return <p className={styles.loading}>Loading assignment…</p>;
  }

  // 2) File selection handler
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setResult(null);
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  }

  // 3) Submit handler
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/assignments/${id}/submit`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Submission failed");
      }
      const submission = (await res.json()) as SubmissionResult;
      setResult(submission);
    } catch (err: any) {
      setError(err.message || "Upload error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
      <h2>{assignment.name}</h2>
      <p>{assignment.description}</p>
      <p className={styles.deadline}>
        Due: {new Date(assignment.dueDate).toLocaleDateString()}
      </p>

      {result ? (
        <section className={styles.result}>
          <h3>Your Grade: {result.score}%</h3>
          <p><strong>Feedback:</strong> {result.feedback}</p>
          {result.improvement && (
            <p><strong>Room to improve:</strong> {result.improvement}</p>
          )}
        </section>
      ) : (
        <form onSubmit={onSubmit} className={styles.uploadForm}>
          {error && <p className={styles.error}>{error}</p>}
          <label className={styles.fileLabel}>
            Select PDF:
            <input
              type="file"
              accept="application/pdf"
              onChange={onFileChange}
              disabled={submitting}
              className={styles.fileInput}
              required
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className={styles.submitBtn}
          >
            {submitting ? "Submitting…" : "Upload & Grade"}
          </button>
        </form>
      )}
    </div>
  );
}
