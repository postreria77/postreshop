export const prerender = false;

import type { APIRoute } from "astro";
import { getCardBrand, stripe } from "../../lib/stripe";
import { db, inArray, Pasteles } from "astro:db";
import { getSecret } from "astro:env/server";
import type {
  OrderProduct,
  SpecialOrderDate,
  SystemOrder,
  SystemOrderProduct,
  PastelIdsEspeciales,
} from "db/config";
import { PRESENTACIONES_ID } from "@/lib/pricesConfig";
import {
  handleProcessError,
  sendEmailReceipt,
  updateOrder,
  uploadOrderToSystem,
} from "@/lib/systemOrders";

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
    const productIdEspecial = pasteles.find((p) =>
      brand === "pasteleria"
        ? p.id_pasteleria === product.producto
        : p.id === product.producto,
    )?.id_especiales as PastelIdsEspeciales;
    const idEspecial = productIdEspecial[brand][type];
    return {
      ...product,
      producto: idEspecial ?? product.producto,
    };
  });
}

const endpointSecret = getSecret("STRIPE_WEBHOOK_SECRET");

if (!endpointSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
}

export const POST: APIRoute = async ({ request, callAction }) => {
  // Get the body and signature for the request
  const requestBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (sig === null) {
    return handleProcessError("Couldn't verify webhook signature", 400);
  }

  // Make the stripe event and handle errors
  let event;
  try {
    event = stripe.webhooks.constructEvent(requestBody, sig, endpointSecret);
  } catch (err) {
    return handleProcessError(`Webhook Error: ${err}`, 400);
  }

  // Handle the event per type and return on the default
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;

      // Handle missing orderId on stripe event
      const orderId = paymentIntent.metadata.order_id;
      if (!orderId) {
        console.log("Order ID not found in payment intent metadata");
        return handleProcessError(
          "Order ID not found in payment intent metadata",
          400,
        );
      }

      const numberOrderId = parseInt(orderId);
      if (isNaN(numberOrderId)) {
        return handleProcessError("Order ID is not a number", 400);
      }

      // Handle missing paymentMethodId on stripe event
      const paymentMethodId = paymentIntent.payment_method;
      if (!paymentMethodId) {
        console.log("Payment method ID not found in payment intent");
        return handleProcessError(
          "Payment method ID not found in payment intent",
          400,
        );
      }

      // Handle missing cardBrand on stripe event
      const cardBrand = await getCardBrand(paymentMethodId.toString());
      if (!cardBrand) {
        return handleProcessError(
          "Card brand not found in payment method",
          400,
        );
      }

      // Update incoming order by ID
      console.log("Updating order with ID:", numberOrderId);
      let { data, error, email } = await updateOrder(numberOrderId, cardBrand);

      if (error) {
        console.error(error.message);
        break;
      } else if (data) {
        console.log(JSON.stringify(data, null, 2)); // log the data);
        console.log("Uploading order to system...");
        const { data: orderData, error: orderError } =
          await uploadOrderToSystem(data, numberOrderId);
        console.log("Order upload returned:");
        if (orderError) {
          console.error(orderError.message);
          break;
        } else if (orderData) {
          console.log(JSON.stringify(orderData, null, 2)); // log the data);
          if (!email) {
            handleProcessError("No email provided", 400);
            break;
          }
          await sendEmailReceipt(numberOrderId, email, callAction);
          break;
        }
      }

    default:
      handleProcessError(`Unhandled event type ${event.type}`, 400);
      break;
  }

  return new Response(`Webhook received: ${event.type}`, {
    status: 200,
  });
};
