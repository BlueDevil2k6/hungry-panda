import { currentUser } from "@/lib/current-user";
import { json } from "@/lib/http";

/** Current signed-in user (or null). Used by the client to hydrate auth state. */
export async function GET() {
  const user = await currentUser();
  if (!user) return json({ user: null });
  const { id, name, email, role, allergens, phone } = user;
  return json({ user: { id, name, email, role, allergens, phone } });
}
