import { getStore } from "@/data/store";
import { requireRole } from "@/lib/current-user";
import { json, forbidden, badRequest } from "@/lib/http";

/** Advance an order along New → Preparing → Ready → Picked up. */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireRole(["staff", "admin"]))) return forbidden();
  const { id } = await params;
  const order = await getStore().advanceOrderStatus(id);
  if (!order) return badRequest("Order not found", 404);
  // In production, advancing to "ready" would trigger the customer notification.
  return json({ order });
}
