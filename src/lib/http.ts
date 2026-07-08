import { NextResponse } from "next/server";

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export function unauthorized(error = "Sign in required") {
  return NextResponse.json({ error }, { status: 401 });
}

export function forbidden(error = "Not authorised") {
  return NextResponse.json({ error }, { status: 403 });
}
