import { describe, it, expect } from "vitest";
import { buildOrderItems, formatOrderCode, nextStatus } from "./orders";
import type { MenuItem } from "./types";

const item: MenuItem = {
  id: "m1",
  categoryId: "dumplings",
  name: "Pork & Chive Dumplings",
  description: "…",
  priceCents: 850,
  emoji: "🥟",
  spiceLevel: 0,
  vegetarian: false,
  popular: true,
  available: true,
  allergens: ["gluten", "soy"],
  sortOrder: 1,
};

describe("orders", () => {
  it("snapshots name, price and allergens onto order items", () => {
    const [line] = buildOrderItems([{ item, quantity: 3 }]);
    expect(line).toEqual({
      itemId: "m1",
      nameSnapshot: "Pork & Chive Dumplings",
      unitPriceCents: 850,
      quantity: 3,
      allergensSnapshot: ["gluten", "soy"],
    });
  });

  it("copies the allergen array (no shared reference)", () => {
    const [line] = buildOrderItems([{ item, quantity: 1 }]);
    expect(line.allergensSnapshot).not.toBe(item.allergens);
  });

  it("formats order codes", () => {
    expect(formatOrderCode(2048)).toBe("HP-2048");
  });

  it("advances status along the flow and stops at pickedup", () => {
    expect(nextStatus("new")).toBe("preparing");
    expect(nextStatus("preparing")).toBe("ready");
    expect(nextStatus("ready")).toBe("pickedup");
    expect(nextStatus("pickedup")).toBe("pickedup");
  });
});
