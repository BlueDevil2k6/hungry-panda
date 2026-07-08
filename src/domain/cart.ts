import type { AllergenId, CartLineInput, MenuItem } from "./types";
import { allergenHits, isBlocked } from "./allergens";
import type { ResolvedLine } from "./pricing";

export type RemovalReason = "unknown" | "unavailable" | "blocked";

export interface RemovedLine {
  itemId: string;
  name?: string;
  reason: RemovalReason;
  allergens?: AllergenId[];
}

export interface CartValidation {
  ok: ResolvedLine[];
  removed: RemovedLine[];
}

/**
 * Resolve raw cart lines against the live menu and the user's avoided
 * allergens. Unknown, unavailable and allergen-blocked items are dropped with
 * a reason. This is the single source of truth for "can this be ordered" — the
 * client UI is only a convenience and is always re-checked here on the server.
 */
export function validateCart(
  lines: CartLineInput[],
  items: MenuItem[],
  avoided: AllergenId[],
): CartValidation {
  const byId = new Map(items.map((i) => [i.id, i]));
  const ok: ResolvedLine[] = [];
  const removed: RemovedLine[] = [];

  for (const line of lines) {
    const qty = Math.max(0, Math.floor(line.quantity));
    if (qty === 0) continue;

    const item = byId.get(line.itemId);
    if (!item) {
      removed.push({ itemId: line.itemId, reason: "unknown" });
      continue;
    }
    if (!item.available) {
      removed.push({ itemId: item.id, name: item.name, reason: "unavailable" });
      continue;
    }
    if (isBlocked(item, avoided)) {
      removed.push({
        itemId: item.id,
        name: item.name,
        reason: "blocked",
        allergens: allergenHits(item, avoided),
      });
      continue;
    }

    const existing = ok.find((l) => l.item.id === item.id);
    if (existing) existing.quantity += qty;
    else ok.push({ item, quantity: qty });
  }

  return { ok, removed };
}
