import { z } from "zod";
import { getStore } from "@/data/store";
import { currentUser } from "@/lib/current-user";
import { validateCart } from "@/domain/cart";
import { computeTotals } from "@/domain/pricing";
import { isAllergenId } from "@/domain/allergens";
import { chargeOrder } from "@/payments/stripe";
import { json, badRequest } from "@/lib/http";

const schema = z.object({
  lines: z.array(z.object({ itemId: z.string(), quantity: z.number().int() })),
  avoided: z.array(z.string()).optional(),
  customerName: z.string().trim().min(1, "A name is required"),
  contactPhone: z.string().trim().optional(),
  pickupType: z.enum(["asap", "scheduled"]),
  pickupAt: z.string().nullable().optional(),
  notes: z.string().trim().optional(),
});

/**
 * Create and pay for an order. The cart is fully re-validated here — allergen
 * safety, availability and pricing are recomputed on the server, never trusted
 * from the client. Payment runs through Stripe (or demo mode).
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(parsed.error?.issues[0]?.message ?? "Invalid order payload");
  }
  const body = parsed.data;

  const store = getStore();
  const user = await currentUser();
  const avoided = (user?.allergens ?? body.avoided ?? []).filter(isAllergenId);

  const items = await store.listMenuItems();
  const { ok, removed } = validateCart(body.lines, items, avoided);
  if (ok.length === 0) {
    return badRequest("Your cart has no orderable items.");
  }

  const totals = computeTotals(ok);

  // Create the order first (pending), then charge so payment carries the code.
  const order = await store.createOrder({
    userId: user?.id ?? null,
    customerName: body.customerName,
    contactPhone: body.contactPhone,
    pickupType: body.pickupType,
    pickupAt: body.pickupType === "asap" ? null : body.pickupAt ?? null,
    notes: body.notes,
    lines: ok,
    paymentStatus: "pending",
  });

  const payment = await chargeOrder(totals.totalCents, order.code);
  const finalStatus = payment.status === "paid" ? "paid" : "pending";
  const settled = await store.setOrderPayment(order.id, finalStatus, payment.ref);

  return json(
    {
      order: settled ?? order,
      removed,
      requiresPayment: payment.status !== "paid",
      clientSecret: payment.clientSecret ?? null,
    },
    { status: 201 },
  );
}
