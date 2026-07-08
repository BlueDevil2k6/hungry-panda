import { currentUser } from "@/lib/current-user";
import { getStore } from "@/data/store";
import { json, unauthorized } from "@/lib/http";

/** Order history for the signed-in customer. */
export async function GET() {
  const user = await currentUser();
  if (!user) return unauthorized();
  const orders = await getStore().listOrdersByUser(user.id);
  return json({ orders });
}
