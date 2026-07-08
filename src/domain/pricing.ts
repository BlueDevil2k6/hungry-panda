import type { MenuItem } from "./types";

/** Sample flat tax. Real tax rules are a configuration concern (see spec §2). */
export const TAX_RATE = 0.085;

export interface ResolvedLine {
  item: MenuItem;
  quantity: number;
}

export interface Totals {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

export function computeTotals(lines: ResolvedLine[]): Totals {
  const subtotalCents = lines.reduce(
    (sum, l) => sum + l.item.priceCents * l.quantity,
    0,
  );
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

/** Format integer cents as USD, e.g. 1350 -> "$13.50". */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
