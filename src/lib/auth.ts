// src/lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

export interface TokenPayload {
  id: string;
  role: Role;
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d" });
}

export function verifyToken(token: string): TokenPayload {
  // Force the JWT library to emit our TokenPayload
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

export async function getUserFromCookie(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
