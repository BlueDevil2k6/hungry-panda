import { currentUser } from "@/lib/current-user";
import { getStore } from "@/data/store";
import { validateCart } from "@/domain/cart";
import { json, unauthorized, badRequest } from "@/lib/http";

/**
 * Build a cart from a past order, re-checked against the live menu and the
 * user's current allergens. Blocked/unavailable items are reported as skipped.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const user = await currentUser();
  if (!user) return unauthorized();

  const { code } = await params;
  const store = getStore();
  const order = await store.getOrderByCode(code);
  if (!order || order.userId !== user.id) return badRequest("Order not found", 404);

  const items = await store.listMenuItems();
  const lines = order.items.map((i) => ({ itemId: i.itemId, quantity: i.quantity }));
  const { ok, removed } = validateCart(lines, items, user.allergens);

  return json({
    add: ok.map((l) => ({ itemId: l.item.id, quantity: l.quantity })),
    skipped: removed,
  });
}
