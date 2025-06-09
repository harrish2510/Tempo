import { getUserFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const assignmentId = params.id;

  const user = await getUserFromCookie();
  if (!user || user.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    include: { student: true },
  });

  return NextResponse.json(submissions);
}
