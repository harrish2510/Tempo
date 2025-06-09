import { getUserFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getUserFromCookie();
  if (!user || user.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, description, criteria, dueDate, emails } = await req.json();
  const assignment = await prisma.assignment.create({
    data: {
      name,
      description,
      criteria,
      dueDate: new Date(dueDate),
      students: {
        connect: emails.map((email: string) => ({ email })),
      },
    },
  });

  return NextResponse.json(assignment);
}
