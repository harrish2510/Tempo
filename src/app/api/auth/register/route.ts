import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: "STUDENT"  // everyone who registers via this form is a STUDENT
    },
  });

  return NextResponse.json({ success: true });
}
