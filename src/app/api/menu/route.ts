import { getStore } from "@/data/store";
import { json } from "@/lib/http";

/** Public menu: categories + all items (with an `available` flag). */
export async function GET() {
  const store = getStore();
  const [categories, items] = await Promise.all([
    store.listCategories(),
    store.listMenuItems(),
  ]);
  return json({ categories, items });
}
