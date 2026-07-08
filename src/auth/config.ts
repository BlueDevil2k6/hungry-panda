// Runtime configuration derived from environment variables. Every integration
// has a safe local/demo fallback so the app runs with zero secrets in dev & CI.

function list(v: string | undefined): string[] {
  return (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const config = {
  sessionSecret:
    process.env.SESSION_SECRET ??
    "dev-insecure-session-secret-change-me-in-production",

  /** Staff/admin emails (or use a Workspace domain check). */
  adminAllowlist: list(process.env.ADMIN_ALLOWLIST).length
    ? list(process.env.ADMIN_ALLOWLIST)
    : ["marco@hungrypanda.example"],

  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  /** With no Google client configured we use a demo "Continue with Google". */
  get googleConfigured() {
    return this.googleClientId.length > 0;
  },

  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  get stripeConfigured() {
    return this.stripeSecretKey.length > 0;
  },

  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  get supabaseConfigured() {
    return this.supabaseUrl.length > 0 && this.supabaseServiceKey.length > 0;
  },
};

export function isAllowedAdmin(email: string): boolean {
  return config.adminAllowlist.includes(email.toLowerCase());
}
