"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBook,
  IconBowl,
  IconDot,
  IconGoogle,
  IconGrid,
  IconReceipt,
  IconSettings,
  IconStore,
} from "@/components/icons";

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/menu": "Menu & pricing",
  "/admin/orders": "Order queue",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [state, setState] = useState<"loading" | "in" | "out">("loading");
  const [busy, setBusy] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const check = useCallback(async () => {
    const r = await fetch("/api/session");
    const data = await r.json();
    if (data.user && (data.user.role === "admin" || data.user.role === "staff")) {
      setUser(data.user);
      setState("in");
    } else {
      setState("out");
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  async function signIn() {
    setBusy(true);
    const r = await fetch("/api/auth/google/admin", { method: "POST" });
    setBusy(false);
    if (r.ok) await check();
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    setState("out");
    router.push("/");
  }

  if (state === "loading") {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (state === "out") {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 20 }}>
        <div className="modal" style={{ maxWidth: 420 }}>
          <div className="signin-hero">
            <div className="mark">
              <IconSettings />
            </div>
            <h3>Staff sign-in</h3>
            <p>Restricted to authorised staff. Access is granted by the owner.</p>
          </div>
          <div className="mbody">
            <button
              className="btn btn-google btn-block"
              style={{ height: 50 }}
              onClick={signIn}
              disabled={busy}
            >
              <IconGoogle /> {busy ? "Signing in…" : "Continue with Google"}
            </button>
            <p
              className="muted"
              style={{ fontSize: ".76rem", textAlign: "center", margin: "16px 0 4px" }}
            >
              <Link className="lnk" href="/">
                ← Back to storefront
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const navLink = (href: string, icon: React.ReactNode, label: string) => (
    <Link href={href} className={pathname === href ? "active" : ""}>
      {icon}
      {label}
    </Link>
  );

  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="brand">
          <span className="mark">
            <IconBowl />
          </span>
          Hungry Panda
        </div>
        <div className="lbl">Manage</div>
        {navLink("/admin", <IconGrid />, "Dashboard")}
        {navLink("/admin/menu", <IconBook />, "Menu & pricing")}
        {navLink("/admin/orders", <IconReceipt />, "Order queue")}
        <a style={{ color: "var(--ink-faint)" }}>
          <IconSettings />
          Settings
        </a>
        <div className="spacer" />
        <Link href="/">
          <IconStore />
          View storefront
        </Link>
        <div
          className="who"
          style={{
            display: "flex",
            gap: 11,
            alignItems: "center",
            padding: "12px 10px",
            borderTop: "1px solid var(--line)",
            marginTop: 6,
          }}
        >
          <span className="avatar" style={{ background: "var(--brand)", color: "var(--on-brand)" }}>
            {(user?.name ?? "?").split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: ".9rem" }}>{user?.name}</div>
            <div style={{ fontSize: ".76rem", color: "var(--ink-soft)", textTransform: "capitalize" }}>
              {user?.role}
            </div>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-top">
          <h1>{TITLES[pathname] ?? "Admin"}</h1>
          <div className="right">
            <span
              className="chip"
              style={{
                background: "var(--brand-tint)",
                color: "var(--brand-ink)",
                borderColor: "var(--brand-tint2)",
                height: 30,
              }}
            >
              <IconDot /> Kitchen open
            </span>
            <button className="btn btn-ghost btn-sm" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
        <div className="admin-body">{children}</div>
      </div>
    </div>
  );
}
