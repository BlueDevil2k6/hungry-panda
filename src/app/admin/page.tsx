"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MenuItem, Order } from "@/domain/types";
import { formatCents } from "@/domain/pricing";
import { IconBag, IconClock, IconGrid, IconReceipt } from "@/components/icons";
import { STATUS_CLASS, STATUS_TEXT } from "@/components/admin/status";

interface Stats {
  topSellers: { item: MenuItem; count: number }[];
  kpis: { ordersToday: number; revenueCents: number; liveOrders: number };
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [o, s] = await Promise.all([
        fetch("/api/admin/orders").then((r) => r.json()),
        fetch("/api/admin/stats").then((r) => r.json()),
      ]);
      setOrders(o.orders ?? []);
      setStats(s);
    })();
  }, []);

  const maxSold = stats?.topSellers[0]?.count ?? 1;

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi card">
          <div className="k">
            <IconReceipt /> Orders today
          </div>
          <div className="v tabnum">{stats?.kpis.ordersToday ?? "—"}</div>
          <div className="d up">▲ 12% vs last Wed</div>
        </div>
        <div className="kpi card">
          <div className="k">
            <IconBag /> Revenue today
          </div>
          <div className="v tabnum">
            {stats ? formatCents(stats.kpis.revenueCents) : "—"}
          </div>
          <div className="d up">▲ 8% vs last Wed</div>
        </div>
        <div className="kpi card">
          <div className="k">
            <IconClock /> Avg. pickup
          </div>
          <div className="v tabnum">19 min</div>
          <div className="d up">▼ 3 min faster</div>
        </div>
        <div className="kpi card">
          <div className="k">
            <IconGrid /> Live orders
          </div>
          <div className="v tabnum">{stats?.kpis.liveOrders ?? "—"}</div>
          <div className="d up">in the kitchen now</div>
        </div>
      </div>

      <div className="admin-cols">
        <div className="card">
          <div className="panel-head">
            <h3>Live order queue</h3>
            <Link className="lnk" href="/admin/orders">
              Open queue →
            </Link>
          </div>
          {orders.slice(0, 4).map((o) => (
            <div className="qrow" key={o.code}>
              <span className="qn">{o.code}</span>
              <span className="qi">
                {o.customerName} ·{" "}
                {o.items
                  .map((i) => i.nameSnapshot + (i.quantity > 1 ? ` ×${i.quantity}` : ""))
                  .join(", ")}
              </span>
              <span className={`status ${STATUS_CLASS[o.status]}`}>
                {STATUS_TEXT[o.status]}
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="panel-head">
            <h3>Top sellers today</h3>
          </div>
          <div style={{ padding: "8px 20px 16px" }}>
            {stats?.topSellers.map((t) => (
              <div
                key={t.item.id}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0" }}
              >
                <span style={{ fontSize: 20 }}>{t.item.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{t.item.name}</div>
                  <div
                    style={{
                      height: 6,
                      background: "var(--surface-2)",
                      borderRadius: 99,
                      marginTop: 5,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.round((t.count / maxSold) * 100)}%`,
                        background: "var(--brand)",
                        borderRadius: 99,
                      }}
                    />
                  </div>
                </div>
                <span className="tabnum muted" style={{ fontWeight: 700 }}>
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
