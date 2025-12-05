export const prerender = false;

import type { APIRoute } from "astro";
import { stripe } from "../../lib/stripe";
import { db, eq, inArray, Orders, Pasteles } from "astro:db";
import { getSecret } from "astro:env/server";
import type {
  OrderProduct,
  SpecialOrderDate,
  SystemOrder,
  SystemOrderProduct,
  PastelIdsEspeciales,
} from "db/config";
import { emails } from "@/actions/emails";
import { PRESENTACIONES_ID } from "@/lib/pricesConfig";
import { updateOrder } from "@/lib/systemOrders";

import type { CardBrandType } from "@/lib/systemOrders";

type Brands = "postreria" | "pasteleria";

export function checkBrand(sucursalId: string): Brands {
  switch (sucursalId) {
    case "520":
    case "536":
      return "pasteleria";
    default:
      return "postreria";
  }
}

/**
 * Generate the system product array from the products in the order.
 * @param sucursal - The ID of the branch where the order was placed.
 * @param productos - The array of products in the order.
 * @returns The array of products ready to be sent to the system.
 */
export function getSentProducts(
  sucursal: string,
  productos: OrderProduct[],
): SystemOrderProduct[] {
  const brand = checkBrand(sucursal);
  if (brand === "pasteleria") {
    return productos.map((producto) => {
      return {
        producto: producto.id_pasteleria,
        cantidad: producto.cantidad,
        presentacion: PRESENTACIONES_ID[producto.presentacion].pasteleria,
        precioProducto: 0,
        precioPresentacion: producto.precio,
        comentarios: "",
      };
    });
  } else {
    return productos.map((producto) => {
      return {
        producto: producto.id,
        cantidad: producto.cantidad,
        presentacion: PRESENTACIONES_ID[producto.presentacion].postreria,
        precioProducto: 0,
        precioPresentacion: producto.precio,
        comentarios: "",
      };
    });
  }
}

export async function getSpecialIdProducts(
  systemProducts: SystemOrderProduct[],
  productos: OrderProduct[],
  brand: Brands,
  type: SpecialOrderDate["type"],
): Promise<SystemOrderProduct[]> {
  const pasteles = await db
    .select()
    .from(Pasteles)
    .where(
      inArray(
        Pasteles.id,
        productos.map((p) => p.id),
      ),
    );

  return systemProducts.map((product) => {
    const productId = pasteles.find((p) => p.id === product.producto)
      ?.id_especiales as PastelIdsEspeciales;
    const idEspecial = productId[brand][type];
    return {
      ...product,
      producto: idEspecial ?? product.producto,
    };
  });
}

export const uploadOrderToSystem = async (
  order: SystemOrder,
): Promise<{ data: string | null; error: Error | null }> => {
  try {
    const response = await fetch("https://app.rmstech.mx/api/guardar_pedido", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return { data: "No HTTP error", error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

const endpointSecret = getSecret("STRIPE_WEBHOOK_SECRET");

if (!endpointSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
}

export const POST: APIRoute = async ({ request, callAction }) => {
  const requestBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  if (sig === null) {
    return new Response(`Couldn't verify webhook signature`, {
      status: 400,
    });
  }

  try {
    event = stripe.webhooks.constructEvent(requestBody, sig, endpointSecret);
  } catch (err) {
    console.error(err);
    return new Response(`Webhook Error: ${err}`, {
      status: 400,
    });
  }

  async function getCardBrand(
    paymentMethodId: string,
  ): Promise<CardBrandType | null> {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    const cardBrand = paymentMethod.card?.brand;
    if (!cardBrand) {
      return null;
    }
    return cardBrand as CardBrandType;
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntentSucceeded = event.data.object;
      const orderId = paymentIntentSucceeded.metadata.order_id;
      if (!orderId) {
        console.log("Order ID not found in payment intent metadata");
        return new Response(`Order ID not found in payment intent metadata`, {
          status: 400,
        });
      }
      const paymentMethodId = paymentIntentSucceeded.payment_method;
      if (!paymentMethodId) {
        console.log("Payment method ID not found in payment intent");
        return new Response(`Payment method ID not found in payment intent`, {
          status: 400,
        });
      }

      const cardBrand = await getCardBrand(paymentMethodId.toString());
      if (!cardBrand) {
        console.log("Card brand not found in payment method");
        return new Response(`Card brand not found in payment method`, {
          status: 400,
        });
      }

      const numberOrderId = parseInt(orderId);
      if (isNaN(numberOrderId)) {
        console.log("Order ID is not a number");
        return new Response(`Order ID is not a number`, {
          status: 400,
        });
      }

      console.log(`Order ID: ${numberOrderId}`);
      console.log("Updating order...");
      let { data, error, email } = await updateOrder(numberOrderId, cardBrand);

      if (error) {
        console.error(error.message);
        break;
      } else if (data) {
        console.log(JSON.stringify(data, null, 2)); // log the data);
        console.log("Uploading order to system...");
        const { data: orderData, error: orderError } =
          await uploadOrderToSystem(data);
        console.log("Order upload returned:");
        if (orderError) {
          console.error(orderError.message);
          break;
        } else if (orderData) {
          console.log(JSON.stringify(orderData, null, 2)); // log the data);
          if (email) {
            console.log("Sending email...");
            const { data, error } = await callAction(emails.send, {
              id: numberOrderId,
              email,
            });

            if (error) {
              console.error(error.message);
              break;
            }

            console.log(
              "Email sent to: " + email + " with Order ID: " + data?.id,
            );
            break;
          }
          console.log("No email provided");
          break;
        }
      }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(`Webhook received: ${event.type}`, {
    status: 200,
  });
};
