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
