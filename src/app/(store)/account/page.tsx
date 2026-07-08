"use client";

import { useEffect, useState } from "react";
import { useApp, type SessionUser } from "@/components/app-provider";
import { ALLERGENS } from "@/domain/allergens";
import { formatCents } from "@/domain/pricing";
import type { AllergenId, Order } from "@/domain/types";
import {
  IconCheck,
  IconReceipt,
  IconReorder,
  IconShield,
  IconStore,
  IconUser,
} from "@/components/icons";

type Tab = "orders" | "allergens" | "details";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function OrdersPanel({
  orders,
  reorder,
}: {
  orders: Order[];
  reorder: (code: string) => void;
}) {
  return (
    <div className="panel card">
      <h2>Order history</h2>
      <p className="sub">
        Reorder a past pickup in one tap. We&apos;ll skip anything that clashes
        with your allergens.
      </p>
      <div className="order-hist">
        {orders.length === 0 && <p className="muted">No orders yet.</p>}
        {orders.map((o) => {
          const names = o.items
            .map((i) => i.nameSnapshot + (i.quantity > 1 ? ` ×${i.quantity}` : ""))
            .join(" · ");
          return (
            <div className="order-row" key={o.code}>
              <div className="oi">🍱</div>
              <div className="od">
                <div className="top">
                  <span className="num">{o.code}</span>
                  <span className="dt">{o.pickupAt ?? ""}</span>
                  <span className="badge badge-ok badge-dot">
                    {o.status === "pickedup" ? "Picked up" : "In progress"}
                  </span>
                </div>
                <div className="li">{names}</div>
              </div>
              <div
                style={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  alignItems: "flex-end",
                }}
              >
                <span className="price">{formatCents(o.totalCents)}</span>
                <button className="btn btn-soft btn-sm" onClick={() => reorder(o.code)}>
                  <IconReorder /> Reorder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AllergensPanel({
  avoided,
  toggle,
}: {
  avoided: AllergenId[];
  toggle: (id: AllergenId) => void;
}) {
  return (
    <div className="panel card">
      <h2>Allergens &amp; dietary needs</h2>
      <p className="sub">
        Saved to your profile and applied every time you order — on any device.
      </p>
      <div className="allergen-grid">
        {ALLERGENS.map((a) => {
          const on = avoided.includes(a.id);
          return (
            <button
              key={a.id}
              className="allergen-toggle"
              aria-pressed={on}
              onClick={() => toggle(a.id)}
            >
              <span className="box">
                <IconCheck />
              </span>
              <span className="lbl">
                {a.label}
                <span className="ex">{a.example}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="allergy-banner" style={{ margin: "22px 0 0" }}>
        <div className="ic">
          <IconShield />
        </div>
        <div className="t">
          <strong>How blocking works</strong>
          <p>
            Any dish containing a selected allergen is flagged in red and
            can&apos;t be added to your cart. This is a safety aid, not a
            guarantee — always tell staff about severe allergies.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({ user }: { user: SessionUser }) {
  return (
    <div className="panel card">
      <h2>Profile</h2>
      <p className="sub">Signed in with Google</p>
      <div className="grid2">
        <div className="field">
          <label>Full name</label>
          <input className="input" defaultValue={user.name} />
        </div>
        <div className="field">
          <label>Email</label>
          <input className="input" defaultValue={user.email} disabled />
        </div>
      </div>
      <div className="grid2">
        <div className="field">
          <label>Mobile</label>
          <input className="input" defaultValue={user.phone ?? ""} />
        </div>
        <div className="field">
          <label>Marketing</label>
          <input className="input" defaultValue="Offers & new dishes — on" />
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 6 }}>
        Save profile
      </button>
    </div>
  );
}

export default function AccountPage() {
  const { user, avoided, toggleAllergen, openSignin, signOut, reorder } = useApp();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const r = await fetch("/api/me/orders");
      if (r.ok) {
        const data = await r.json();
        setOrders(data.orders);
      }
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="wrap">
        <div style={{ maxWidth: 520, margin: "60px auto" }}>
          <div className="panel card" style={{ textAlign: "center" }}>
            <h2>Your account</h2>
            <p className="sub">
              Sign in with Google to see your orders, reorder favourites and
              manage saved allergens.
            </p>
            <button className="btn btn-primary" onClick={() => openSignin("customer")}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItem = (key: Tab, icon: React.ReactNode, label: string) => (
    <a
      className={tab === key ? "active" : ""}
      style={{ cursor: "pointer" }}
      role="button"
      onClick={() => setTab(key)}
    >
      {icon}
      {label}
    </a>
  );

  return (
    <div className="wrap">
      <div className="acct-layout">
        <aside className="acct-nav">
          <div className="who">
            <span className="avatar">{initials(user.name)}</span>
            <div>
              <div className="nm">{user.name}</div>
              <div className="em">{user.email}</div>
            </div>
          </div>
          {navItem("orders", <IconReceipt />, "Order history")}
          {navItem("allergens", <IconShield />, "Allergens & diet")}
          {navItem("details", <IconUser />, "Profile")}
          <a style={{ cursor: "pointer" }} role="button" onClick={signOut}>
            <IconStore />
            Sign out
          </a>
        </aside>
        <div>
          {tab === "orders" && <OrdersPanel orders={orders} reorder={reorder} />}
          {tab === "allergens" && (
            <AllergensPanel avoided={avoided} toggle={toggleAllergen} />
          )}
          {tab === "details" && <ProfilePanel user={user} />}
        </div>
      </div>
    </div>
  );
}
