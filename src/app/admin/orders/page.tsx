"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order } from "@/domain/types";
import { formatCents } from "@/domain/pricing";
import { STATUS_CLASS, STATUS_TEXT } from "@/components/admin/status";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const refresh = useCallback(async () => {
    const r = await fetch("/api/admin/orders");
    if (r.ok) setOrders((await r.json()).orders);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function advance(order: Order) {
    await fetch(`/api/admin/orders/${order.id}/status`, { method: "PATCH" });
    refresh();
  }

  return (
    <div className="card">
      <div className="panel-head">
        <h3>Order queue</h3>
        <div className="muted" style={{ fontSize: ".84rem" }}>
          Tap a status to advance it
        </div>
      </div>
      <div className="tbl-scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Pickup</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="qn tabnum">{o.code}</td>
                <td>{o.customerName}</td>
                <td>
                  <span className="muted" style={{ fontSize: ".86rem" }}>
                    {o.items
                      .map((i) => i.nameSnapshot + (i.quantity > 1 ? ` ×${i.quantity}` : ""))
                      .join(", ")}
                  </span>
                </td>
                <td className="price tabnum">{formatCents(o.totalCents)}</td>
                <td className="tabnum">{o.pickupAt ?? "ASAP"}</td>
                <td>
                  <button
                    className={`status ${STATUS_CLASS[o.status]}`}
                    onClick={() => advance(o)}
                    title="Advance status"
                  >
                    {STATUS_TEXT[o.status]}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
