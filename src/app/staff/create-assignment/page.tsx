// src/app/staff/create-assignment/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AssignmentFormWrapper from "@/components/AssignmentFormWrapper";
import { Role } from "@prisma/client";

export default async function StaffCreatePage() {
  // Simple auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  // Fetch all student emails on the server
  const students = await prisma.user.findMany({
    where: { role: Role.STUDENT },
    select: { email: true },
  });

  // Explicitly type `s` here so TS knows its shape
  const emails: string[] = students.map((s: { email: string }) => s.email);

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h1 style={{ textAlign: "center" }}>New Assignment</h1>
      <AssignmentFormWrapper students={emails} />
    </div>
  );
}
