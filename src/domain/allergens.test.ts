import { describe, it, expect } from "vitest";
import { allergenHits, describeHits, isBlocked, isAllergenId } from "./allergens";
import type { MenuItem } from "./types";

const item = (allergens: MenuItem["allergens"]): MenuItem => ({
  id: "x",
  categoryId: "noodles",
  name: "Test dish",
  description: "",
  priceCents: 1000,
  emoji: "🍜",
  spiceLevel: 0,
  vegetarian: false,
  popular: false,
  available: true,
  allergens,
  sortOrder: 1,
});

describe("allergen blocking", () => {
  it("is safe when the user avoids nothing", () => {
    expect(isBlocked(item(["peanut", "gluten"]), [])).toBe(false);
    expect(allergenHits(item(["peanut"]), [])).toEqual([]);
  });

  it("blocks when an avoided allergen is present", () => {
    expect(isBlocked(item(["peanut", "gluten"]), ["peanut"])).toBe(true);
  });

  it("is safe when avoided allergens don't intersect", () => {
    expect(isBlocked(item(["gluten", "soy"]), ["peanut", "shellfish"])).toBe(false);
  });

  it("returns only the intersecting allergens, in item order", () => {
    expect(allergenHits(item(["gluten", "peanut", "soy"]), ["soy", "peanut"])).toEqual([
      "peanut",
      "soy",
    ]);
  });

  it("describes hits as a lowercase list", () => {
    expect(describeHits(item(["peanut", "shellfish"]), ["shellfish", "peanut"])).toBe(
      "peanut, shellfish",
    );
  });

  it("validates allergen ids", () => {
    expect(isAllergenId("peanut")).toBe(true);
    expect(isAllergenId("kryptonite")).toBe(false);
  });
});
