import { z } from "zod";
import { getStore, type NewMenuItem } from "@/data/store";
import { requireRole } from "@/lib/current-user";
import { isAllergenId } from "@/domain/allergens";
import { json, forbidden, badRequest } from "@/lib/http";

export async function GET() {
  if (!(await requireRole(["staff", "admin"]))) return forbidden();
  const items = await getStore().listMenuItems();
  return json({ items });
}

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().default(""),
  categoryId: z.string().min(1),
  price: z.number().nonnegative(), // dollars
  allergens: z.array(z.string()).default([]),
  available: z.boolean().default(true),
  spiceLevel: z.number().int().min(0).max(3).default(0),
  vegetarian: z.boolean().default(false),
  popular: z.boolean().default(false),
});

export async function POST(req: Request) {
  if (!(await requireRole(["staff", "admin"]))) return forbidden();

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid item");
  }
  const store = getStore();
  const categories = await store.listCategories();
  const category = categories.find((c) => c.id === parsed.data.categoryId);
  if (!category) return badRequest("Unknown category");

  const input: NewMenuItem = {
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    description: parsed.data.description,
    priceCents: Math.round(parsed.data.price * 100),
    emoji: category.emoji,
    spiceLevel: parsed.data.spiceLevel,
    vegetarian: parsed.data.vegetarian,
    popular: parsed.data.popular,
    available: parsed.data.available,
    allergens: parsed.data.allergens.filter(isAllergenId),
  };
  const item = await store.createMenuItem(input);
  return json({ item }, { status: 201 });
}
