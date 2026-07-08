import { describe, it, expect } from "vitest";
import { validateCart } from "./cart";
import type { MenuItem } from "./types";

const base = {
  categoryId: "c",
  description: "",
  emoji: "🍜",
  spiceLevel: 0,
  vegetarian: false,
  popular: false,
  sortOrder: 1,
};
const items: MenuItem[] = [
  { ...base, id: "safe", name: "Safe", priceCents: 800, available: true, allergens: ["soy"] },
  { ...base, id: "peanutty", name: "Peanutty", priceCents: 1350, available: true, allergens: ["peanut"] },
  { ...base, id: "gone", name: "Sold out", priceCents: 450, available: false, allergens: [] },
];

describe("validateCart (server-side safety gate)", () => {
  it("keeps orderable items", () => {
    const { ok, removed } = validateCart([{ itemId: "safe", quantity: 2 }], items, []);
    expect(removed).toEqual([]);
    expect(ok).toHaveLength(1);
    expect(ok[0].quantity).toBe(2);
  });

  it("drops items blocked by an avoided allergen", () => {
    const { ok, removed } = validateCart(
      [{ itemId: "peanutty", quantity: 1 }],
      items,
      ["peanut"],
    );
    expect(ok).toHaveLength(0);
    expect(removed[0]).toMatchObject({ itemId: "peanutty", reason: "blocked", allergens: ["peanut"] });
  });

  it("drops unavailable items", () => {
    const { ok, removed } = validateCart([{ itemId: "gone", quantity: 1 }], items, []);
    expect(ok).toHaveLength(0);
    expect(removed[0]).toMatchObject({ itemId: "gone", reason: "unavailable" });
  });

  it("drops unknown items", () => {
    const { removed } = validateCart([{ itemId: "ghost", quantity: 1 }], items, []);
    expect(removed[0]).toMatchObject({ itemId: "ghost", reason: "unknown" });
  });

  it("merges duplicate lines and ignores non-positive quantities", () => {
    const { ok } = validateCart(
      [
        { itemId: "safe", quantity: 1 },
        { itemId: "safe", quantity: 2 },
        { itemId: "safe", quantity: 0 },
        { itemId: "safe", quantity: -3 },
      ],
      items,
      [],
    );
    expect(ok).toHaveLength(1);
    expect(ok[0].quantity).toBe(3);
  });
});
