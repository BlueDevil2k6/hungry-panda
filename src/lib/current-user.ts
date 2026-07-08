import "server-only";
import type { Role, UserProfile } from "@/domain/types";
import { getSession } from "@/auth/session";
import { getStore } from "@/data/store";

/** Full profile for the signed-in user, or null for guests. */
export async function currentUser(): Promise<UserProfile | null> {
  const session = await getSession();
  if (!session) return null;
  return getStore().getUser(session.userId);
}

/** Returns the user if they hold one of the roles, else null. */
export async function requireRole(roles: Role[]): Promise<UserProfile | null> {
  const user = await currentUser();
  if (!user || !roles.includes(user.role)) return null;
  return user;
}
