import { clearSession } from "@/auth/session";
import { json } from "@/lib/http";

export async function POST() {
  await clearSession();
  return json({ ok: true });
}
