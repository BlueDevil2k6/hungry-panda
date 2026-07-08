import { createSession } from "@/auth/session";
import { config, isAllowedAdmin } from "@/auth/config";
import { getStore } from "@/data/store";
import { DEMO_ADMIN } from "@/data/seed";
import { json, badRequest, forbidden } from "@/lib/http";

/**
 * Staff "Continue with Google" — restricted to allow-listed emails.
 *
 * Demo mode signs in the seeded owner. In production the Google OIDC callback
 * checks the verified email against the allow-list (config.adminAllowlist) and
 * refuses anyone else before creating a staff session.
 */
export async function POST() {
  if (config.googleConfigured) {
    return badRequest("Use the Google OAuth redirect flow in production.", 501);
  }
  const store = getStore();
  const user = (await store.getUser(DEMO_ADMIN.id)) ?? DEMO_ADMIN;
  if (!isAllowedAdmin(user.email)) {
    return forbidden("This account is not authorised for staff access.");
  }
  await createSession(user.id, user.role);
  const { id, name, email, role } = user;
  return json({ user: { id, name, email, role } });
}
