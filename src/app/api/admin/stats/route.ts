import { getStore } from "@/data/store";
import { requireRole } from "@/lib/current-user";
import { json, forbidden } from "@/lib/http";

export async function GET() {
  if (!(await requireRole(["staff", "admin"]))) return forbidden();
  const store = getStore();
  const [topSellers, orders] = await Promise.all([
    store.topSellers(),
    store.listQueue(),
  ]);
  const paid = orders.filter((o) => o.paymentStatus === "paid");
  const revenueCents = paid.reduce((sum, o) => sum + o.totalCents, 0);
  const live = orders.filter((o) => o.status !== "pickedup").length;
  return json({
    topSellers,
    kpis: {
      ordersToday: orders.length,
      revenueCents,
      liveOrders: live,
    },
  });
}
