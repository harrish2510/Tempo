// components/AssignmentForm.tsx
"use client";
import { useState, FormEvent } from "react";
import styles from "./AssignmentForm.module.css";

interface Props {
  students: string[]; // list of student emails
  onSubmit: (data: {
    name: string;
    description: string;
    criteria: string[];
    dueDate: string;
    emails: string[];
  }) => Promise<void>;
}

export default function AssignmentForm({ students, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [criteria, setCriteria] = useState<string[]>([""]);
  const [dueDate, setDueDate] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function addCriterion() {
    setCriteria([...criteria, ""]);
  }
  function updateCriterion(i: number, v: string) {
    const arr = [...criteria];
    arr[i] = v;
    setCriteria(arr);
  }
  function toggleEmail(email: string) {
    setSelected(
      selected.includes(email)
        ? selected.filter((e) => e !== email)
        : [...selected, email]
    );
  }

  async function handle(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        name,
        description: desc,
        criteria: criteria.filter((c) => c.trim()),
        dueDate,
        emails: selected,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create");
    }
  }

  return (
    <form className={styles.form} onSubmit={handle}>
      {error && <div className={styles.error}>{error}</div>}
      <label>
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          required
        />
      </label>
      <label>
        Description
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className={styles.input}
          required
        />
      </label>
      <fieldset className={styles.fieldset}>
        <legend>Criteria</legend>
        {criteria.map((c, i) => (
          <input
            key={i}
            value={c}
            onChange={(e) => updateCriterion(i, e.target.value)}
            className={styles.input}
            placeholder={`Criterion #${i + 1}`}
            required
          />
        ))}
        <button type="button" onClick={addCriterion}>
          + Add Criterion
        </button>
      </fieldset>
      <label>
        Due Date
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={styles.input}
          required
        />
      </label>
      <fieldset className={styles.fieldset}>
        <legend>Assign to Students</legend>
        {students.map((email) => (
          <label key={email} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={selected.includes(email)}
              onChange={() => toggleEmail(email)}
            />
            {email}
          </label>
        ))}
      </fieldset>
      <button type="submit" className={styles.button}>
        Create Assignment
      </button>
    </form>
  );
}
