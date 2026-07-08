"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Order, OrderStatus } from "@/domain/types";
import { formatCents } from "@/domain/pricing";
import { IconBag, IconCheck, IconFlame, IconStore } from "@/components/icons";

const STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: "new", label: "Received", icon: <IconCheck /> },
  { key: "preparing", label: "Preparing", icon: <IconFlame /> },
  { key: "ready", label: "Ready", icon: <IconBag /> },
  { key: "pickedup", label: "Picked up", icon: <IconStore /> },
];

function stepClass(stepIndex: number, currentIndex: number): string {
  if (stepIndex < currentIndex) return "st done";
  if (stepIndex === currentIndex) return "st now";
  return "st";
}

export default function ConfirmationPage() {
  const params = useParams<{ code: string }>();
  const code = params?.code;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/orders/${code}`);
      if (r.ok) {
        const data = await r.json();
        setOrder(data.order);
      }
      setLoading(false);
    })();
  }, [code]);

  if (loading) {
    return (
      <div className="wrap">
        <div className="confirm-wrap">
          <p className="muted">Loading your order…</p>
        </div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="wrap">
        <div className="confirm-wrap">
          <h1>Order not found</h1>
          <p className="muted">We couldn&apos;t find order {code}.</p>
          <Link className="btn btn-primary" href="/menu" style={{ marginTop: 16 }}>
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  // A freshly placed order sits at "Preparing" once received.
  const currentIndex = Math.max(1, STEPS.findIndex((s) => s.key === order.status));
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="wrap">
      <div className="confirm-wrap">
        <div className="confirm-check">
          <IconCheck />
        </div>
        <h1>Order confirmed!</h1>
        <p className="muted">
          We&apos;ve texted a receipt.{" "}
          {order.userId ? "Saved to your account." : "Checked out as guest."}
        </p>

        <div className="card" style={{ padding: 22, marginTop: 24, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <span className="eyebrow">Order number</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>
                {order.code}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="eyebrow">Ready for pickup</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>
                {order.pickupAt && order.pickupType === "scheduled"
                  ? order.pickupAt
                  : "in ~20 min"}
              </div>
            </div>
          </div>
          <div className="tracker">
            {STEPS.map((s, i) => (
              <div className={stepClass(i, currentIndex)} key={s.key}>
                <div className="dot">{s.icon}</div>
                <div className="lb">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22, marginTop: 16, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <strong>Order summary</strong>
            <span className="muted">{itemCount} items</span>
          </div>
          {order.items.map((it) => (
            <div className="summary-item" key={it.itemId}>
              <span>
                <span className="q tabnum">{it.quantity}×</span> {it.nameSnapshot}
              </span>
              <span className="price">
                {formatCents(it.unitPriceCents * it.quantity)}
              </span>
            </div>
          ))}
          <div
            className="summary-item"
            style={{
              borderTop: "1px solid var(--line)",
              marginTop: 8,
              paddingTop: 12,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
            }}
          >
            <span>Total paid</span>
            <span className="tabnum">{formatCents(order.totalCents)}</span>
          </div>
        </div>

        <div style={{ marginTop: 22, display: "flex", gap: 10, justifyContent: "center" }}>
          <Link className="btn btn-primary" href="/menu">
            Order something else
          </Link>
          <Link className="btn btn-ghost" href="/account">
            View my orders
          </Link>
        </div>
      </div>
    </div>
  );
}
