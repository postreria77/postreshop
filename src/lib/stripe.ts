import { getSecret } from "astro:env/server";
import Stripe from "stripe";

export const stripe = new Stripe(getSecret("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-01-27.acacia",
});

import type { PresentacionesType } from "./pricesConfig";
import type { OrderProduct } from "db/config";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  default_price: string | Stripe.Price | null | undefined;
  active: boolean;
  metadata: Stripe.Metadata;
};

export type Discount = {
  coupon: string;
};

export const DISCOUNT_IDS: Record<PresentacionesType, string> = {
  tradicional: "asH52yZJ",
  anytime: "kI1H78wp",
  gift: "yBqsRBbc",
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
  discounts: Discount[],
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
    success_url: `${getSecret("STRIPE_SUCCESS_URL")}/${order_id}`,
    line_items,
    discounts,
    mode: "payment",
    payment_intent_data: payment_intent_data,
    expires_at: Math.floor(Date.now() / 1000) + 1800,
  });
}

export async function generateDiscountArray(
  products: OrderProduct[],
): Promise<Discount[]> {
  const discounts: Discount[] = [];
  for (const [key, value] of Object.entries(DISCOUNT_IDS)) {
    const pushValue = products.some(({ presentacion }) => presentacion === key);
    if (pushValue && value) {
      discounts.push({ coupon: value });
    }
  }
  return discounts;
}
