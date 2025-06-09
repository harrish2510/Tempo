"use client";

import { useRouter } from "next/navigation";
import AssignmentForm from "./AssignmentForm";

export default function AssignmentFormWrapper({
  students,
}: {
  students: string[];
}) {
  const router = useRouter();

  async function handleCreate(data: {
    name: string;
    description: string;
    criteria: string[];
    dueDate: string;
    emails: string[];
  }) {
    const res = await fetch("/api/assignments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create assignment");
    alert("Assignment Created!");
    // Optionally redirect staff to a “view all” page:
    // router.replace("/staff/assignments");
  }

  return <AssignmentForm students={students} onSubmit={handleCreate} />;
}
