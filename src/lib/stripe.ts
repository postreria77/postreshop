import { getSecret } from "astro:env/server";
import Stripe from "stripe";

export const stripe = new Stripe(getSecret("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
});

export type Product = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  default_price: string | Stripe.Price | null | undefined;
  active: boolean;
  metadata: Stripe.Metadata;
};

export async function getProducts() {
  try {
    const res = await stripe.products.list({
      expand: ["data.default_price"],
    });
    return res.data;
  } catch (error) {
    return [];
  }
}

export async function createStripeCheckout(
  connectedStripeAccount: string,
  order_id: number,
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[],
): Promise<Stripe.Checkout.Session> {
  let payment_intent_data: Stripe.Checkout.SessionCreateParams.PaymentIntentData;
  if (connectedStripeAccount === "acct_1Qg3Dy2N0hejjjHD") {
    payment_intent_data = {
      metadata: {
        order_id: order_id,
      },
    };
  } else {
    payment_intent_data = {
      transfer_data: {
        destination: connectedStripeAccount,
      },
      metadata: {
        order_id: order_id,
      },
    };
  }
  return stripe.checkout.sessions.create({
    success_url: "https://shop.lapostreria77.com/order-success/",
    line_items,
    mode: "payment",
    payment_intent_data: payment_intent_data,
  });
}
