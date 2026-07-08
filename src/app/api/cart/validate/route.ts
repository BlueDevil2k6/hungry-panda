import { z } from "zod";
import { getStore } from "@/data/store";
import { currentUser } from "@/lib/current-user";
import { validateCart } from "@/domain/cart";
import { computeTotals } from "@/domain/pricing";
import { isAllergenId } from "@/domain/allergens";
import { json, badRequest } from "@/lib/http";

const schema = z.object({
  lines: z.array(z.object({ itemId: z.string(), quantity: z.number().int() })),
  avoided: z.array(z.string()).optional(),
});

/** Server-side cart check: prices, availability and allergen safety. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid cart payload");

  // Signed-in users are protected by their saved allergens (authoritative);
  // guests are protected by what the client sends.
  const user = await currentUser();
  const avoided = (user?.allergens ?? parsed.data.avoided ?? []).filter(isAllergenId);

  const items = await getStore().listMenuItems();
  const { ok, removed } = validateCart(parsed.data.lines, items, avoided);
  const totals = computeTotals(ok);

  return json({
    lines: ok.map((l) => ({
      itemId: l.item.id,
      name: l.item.name,
      quantity: l.quantity,
      unitPriceCents: l.item.priceCents,
      lineCents: l.item.priceCents * l.quantity,
    })),
    removed,
    totals,
  });
}
