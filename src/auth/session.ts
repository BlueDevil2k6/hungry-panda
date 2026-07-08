import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/domain/types";
import { config } from "./config";

const COOKIE = "hp_session";
const secret = new TextEncoder().encode(config.sessionSecret);

export interface Session {
  userId: string;
  role: Role;
}

/** Issue a signed, HttpOnly session cookie. Call from route handlers only. */
export async function createSession(userId: string, role: Role): Promise<void> {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/** Read the current session (safe to call from server components). */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return { userId: payload.sub, role: (payload.role as Role) ?? "customer" };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
