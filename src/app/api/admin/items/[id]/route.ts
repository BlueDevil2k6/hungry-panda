import { z } from "zod";
import { getStore } from "@/data/store";
import { requireRole } from "@/lib/current-user";
import { isAllergenId } from "@/domain/allergens";
import type { MenuItem } from "@/domain/types";
import { json, forbidden, badRequest } from "@/lib/http";

const patchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  categoryId: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(), // dollars
  allergens: z.array(z.string()).optional(),
  available: z.boolean().optional(),
  spiceLevel: z.number().int().min(0).max(3).optional(),
  vegetarian: z.boolean().optional(),
  popular: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireRole(["staff", "admin"]))) return forbidden();
  const { id } = await params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid update");

  const patch: Partial<MenuItem> = {};
  const d = parsed.data;
  if (d.name !== undefined) patch.name = d.name;
  if (d.description !== undefined) patch.description = d.description;
  if (d.categoryId !== undefined) patch.categoryId = d.categoryId;
  if (d.price !== undefined) patch.priceCents = Math.round(d.price * 100);
  if (d.allergens !== undefined) patch.allergens = d.allergens.filter(isAllergenId);
  if (d.available !== undefined) patch.available = d.available;
  if (d.spiceLevel !== undefined) patch.spiceLevel = d.spiceLevel;
  if (d.vegetarian !== undefined) patch.vegetarian = d.vegetarian;
  if (d.popular !== undefined) patch.popular = d.popular;

  const item = await getStore().updateMenuItem(id, patch);
  if (!item) return badRequest("Item not found", 404);
  return json({ item });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireRole(["staff", "admin"]))) return forbidden();
  const { id } = await params;
  const removed = await getStore().deleteMenuItem(id);
  if (!removed) return badRequest("Item not found", 404);
  return json({ ok: true });
}
