import Stripe from "stripe";
import { config } from "@/auth/config";
import { getStore } from "@/data/store";
import { json, badRequest } from "@/lib/http";

/**
 * Stripe webhook — finalises orders after payment in live mode.
 *
 * Verifies the signature, and on `payment_intent.succeeded` marks the matching
 * order paid (the order code is carried in the intent metadata). Set
 * STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to enable. In demo mode payment
 * is settled inline at order creation, so this endpoint is a no-op.
 */
export async function POST(req: Request) {
  if (!config.stripeConfigured) return json({ ok: true, mode: "demo" });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const signature = req.headers.get("stripe-signature");
  if (!webhookSecret || !signature) return badRequest("Missing webhook secret/signature");

  const stripe = new Stripe(config.stripeSecretKey);
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return badRequest("Invalid signature");
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const code = intent.metadata?.orderCode;
    if (code) {
      const store = getStore();
      const order = await store.getOrderByCode(code);
      if (order) await store.setOrderPayment(order.id, "paid", intent.id);
    }
  }

  return json({ received: true });
}
