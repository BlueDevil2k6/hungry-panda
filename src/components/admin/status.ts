import type { OrderStatus } from "@/domain/types";

/** Maps domain statuses to the prototype's status-pill CSS classes. */
export const STATUS_CLASS: Record<OrderStatus, string> = {
  new: "new",
  preparing: "prep",
  ready: "ready",
  pickedup: "done",
};

export const STATUS_TEXT: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  pickedup: "Picked up",
};
