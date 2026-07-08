import type { Allergen, AllergenId, MenuItem } from "./types";

export const ALLERGENS: Allergen[] = [
  { id: "gluten", label: "Gluten", example: "wheat noodles, buns" },
  { id: "peanut", label: "Peanut", example: "sauces, garnish" },
  { id: "treenut", label: "Tree nut", example: "cashew, almond" },
  { id: "soy", label: "Soy", example: "soy & tamari" },
  { id: "sesame", label: "Sesame", example: "oil & seeds" },
  { id: "shellfish", label: "Shellfish", example: "prawn, crab" },
  { id: "fish", label: "Fish", example: "fish sauce" },
  { id: "egg", label: "Egg", example: "batter, noodles" },
  { id: "dairy", label: "Dairy", example: "milk, butter" },
];

export const ALLERGEN_IDS: AllergenId[] = ALLERGENS.map((a) => a.id);

export const ALLERGEN_LABEL: Record<AllergenId, string> = Object.fromEntries(
  ALLERGENS.map((a) => [a.id, a.label]),
) as Record<AllergenId, string>;

export function isAllergenId(value: string): value is AllergenId {
  return (ALLERGEN_IDS as string[]).includes(value);
}

/** Allergens on `item` that the user avoids. Empty = safe. */
export function allergenHits(item: MenuItem, avoided: AllergenId[]): AllergenId[] {
  if (avoided.length === 0) return [];
  const set = new Set(avoided);
  return item.allergens.filter((a) => set.has(a));
}

/** True when the item contains at least one avoided allergen. */
export function isBlocked(item: MenuItem, avoided: AllergenId[]): boolean {
  return allergenHits(item, avoided).length > 0;
}

/** Human sentence used in blocked banners, e.g. "peanut, shellfish". */
export function describeHits(item: MenuItem, avoided: AllergenId[]): string {
  return allergenHits(item, avoided)
    .map((a) => ALLERGEN_LABEL[a].toLowerCase())
    .join(", ");
}
