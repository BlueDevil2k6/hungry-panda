import "server-only";
import Stripe from "stripe";
import { config } from "@/auth/config";

export interface PaymentResult {
  status: "paid" | "requires_action";
  ref: string;
  /** Present with real Stripe: the client confirms with Stripe Elements. */
  clientSecret?: string;
}

/**
 * Charge an order.
 *
 * - **Demo mode** (no STRIPE_SECRET_KEY): approves immediately so the checkout
 *   flow works end-to-end locally and in CI.
 * - **Live mode**: creates a PaymentIntent and returns its client secret; the
 *   browser confirms it with Stripe Elements and a webhook finalises the order
 *   (see src/app/api/webhooks/stripe/route.ts and spec §8).
 */
export async function chargeOrder(
  amountCents: number,
  orderCode: string,
): Promise<PaymentResult> {
  if (!config.stripeConfigured) {
    return { status: "paid", ref: `demo_${orderCode}` };
  }

  const stripe = new Stripe(config.stripeSecretKey);
  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    metadata: { orderCode },
    automatic_payment_methods: { enabled: true },
  });

  return {
    status: intent.status === "succeeded" ? "paid" : "requires_action",
    ref: intent.id,
    clientSecret: intent.client_secret ?? undefined,
  };
}
