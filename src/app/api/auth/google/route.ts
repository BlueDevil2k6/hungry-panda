import { createSession } from "@/auth/session";
import { config } from "@/auth/config";
import { getStore } from "@/data/store";
import { DEMO_CUSTOMER } from "@/data/seed";
import { json, badRequest } from "@/lib/http";

/**
 * Customer "Continue with Google".
 *
 * Demo mode (no GOOGLE_CLIENT_ID): signs in the seeded demo customer so the
 * signed-in experience (saved allergens, history, reorder) is fully usable.
 * In production this endpoint is replaced by the Google OIDC callback, which
 * upserts the user from the verified Google profile and then calls
 * createSession() exactly as below.
 */
export async function POST() {
  if (config.googleConfigured) {
    // Real OIDC is handled by the provider callback; this stub guards misuse.
    return badRequest("Use the Google OAuth redirect flow in production.", 501);
  }
  const store = getStore();
  const user = (await store.getUser(DEMO_CUSTOMER.id)) ?? DEMO_CUSTOMER;
  await createSession(user.id, user.role);
  const { id, name, email, role, allergens, phone } = user;
  return json({ user: { id, name, email, role, allergens, phone } });
}
