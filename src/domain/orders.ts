import type { OrderItem } from "./types";
import type { ResolvedLine } from "./pricing";

/** Freeze name/price/allergens onto the order so later menu edits don't rewrite history. */
export function buildOrderItems(lines: ResolvedLine[]): OrderItem[] {
  return lines.map((l) => ({
    itemId: l.item.id,
    nameSnapshot: l.item.name,
    unitPriceCents: l.item.priceCents,
    quantity: l.quantity,
    allergensSnapshot: [...l.item.allergens],
  }));
}

export function formatOrderCode(seq: number): string {
  return `HP-${seq}`;
}

export const STATUS_FLOW = ["new", "preparing", "ready", "pickedup"] as const;
export type StatusFlow = (typeof STATUS_FLOW)[number];

export const STATUS_LABEL: Record<StatusFlow, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  pickedup: "Picked up",
};

/** Advance a status one step along the kitchen flow (terminal at pickedup). */
export function nextStatus(current: StatusFlow): StatusFlow {
  const i = STATUS_FLOW.indexOf(current);
  return STATUS_FLOW[Math.min(i + 1, STATUS_FLOW.length - 1)];
}
