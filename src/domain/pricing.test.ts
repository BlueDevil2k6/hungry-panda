import { describe, it, expect } from "vitest";
import { computeTotals, formatCents, TAX_RATE } from "./pricing";
import type { MenuItem } from "./types";

const item = (id: string, priceCents: number): MenuItem => ({
  id,
  categoryId: "c",
  name: id,
  description: "",
  priceCents,
  emoji: "🍜",
  spiceLevel: 0,
  vegetarian: false,
  popular: false,
  available: true,
  allergens: [],
  sortOrder: 1,
});

describe("pricing", () => {
  it("totals an empty cart to zero", () => {
    expect(computeTotals([])).toEqual({ subtotalCents: 0, taxCents: 0, totalCents: 0 });
  });

  it("sums line quantities and applies tax", () => {
    const t = computeTotals([
      { item: item("a", 850), quantity: 2 }, // 1700
      { item: item("b", 1350), quantity: 1 }, // 1350
    ]);
    expect(t.subtotalCents).toBe(3050);
    expect(t.taxCents).toBe(Math.round(3050 * TAX_RATE)); // 259
    expect(t.totalCents).toBe(3050 + t.taxCents);
  });

  it("rounds tax to whole cents", () => {
    const t = computeTotals([{ item: item("a", 999), quantity: 1 }]);
    expect(Number.isInteger(t.taxCents)).toBe(true);
    expect(t.taxCents).toBe(Math.round(999 * TAX_RATE));
  });

  it("formats cents as USD", () => {
    expect(formatCents(1350)).toBe("$13.50");
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(500)).toBe("$5.00");
  });
});
