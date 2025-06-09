// app/student/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  // decode the middle JWT segment to get { id, role }
  const { id, role } = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString()
  );
  if (role !== Role.STUDENT) redirect("/login");

  const assignments = await prisma.assignment.findMany({
    where: { students: { some: { id } } },
    select: { id: true, name: true, dueDate: true },
  });

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h1>Your Assignments</h1>
      <ul>
        {assignments.map((a: { id: string; name: string; dueDate: Date }) => (
          <li key={a.id}>
            <a href={`/student/assignments/${a.id}`}>
              {a.name} (due: {new Date(a.dueDate).toLocaleDateString()})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
