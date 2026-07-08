import { getStore } from "@/data/store";
import { requireRole } from "@/lib/current-user";
import { json, forbidden } from "@/lib/http";

export async function GET() {
  if (!(await requireRole(["staff", "admin"]))) return forbidden();
  const orders = await getStore().listQueue();
  return json({ orders });
}
