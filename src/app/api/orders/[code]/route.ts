import { getStore } from "@/data/store";
import { json, badRequest } from "@/lib/http";

/** Public order lookup by code — used by the confirmation page. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const order = await getStore().getOrderByCode(code);
  if (!order) return badRequest("Order not found", 404);
  return json({ order });
}
