// after
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // await the async params object
  const { id } = await params;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      criteria: true,
      dueDate: true,
    },
  });

  if (!assignment) {
    return new NextResponse("Assignment not found", { status: 404 });
  }

  return NextResponse.json(assignment);
}
