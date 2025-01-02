export const prerender = false;

import type { APIRoute } from "astro";
import { stripe } from "@lib/stripe";
import { db, eq, Orders } from "astro:db";
import { getSecret } from "astro:env/server";
import type { OrderProduct, SystemOrder, SystemOrderProduct } from "db/config";

const updateOrder = async (
  orderId: number,
): Promise<{ data: SystemOrder | null; error: Error | null }> => {
  const order = await db
    .update(Orders)
    .set({
      estado: "Pagado",
    })
    .where(eq(Orders.id, orderId))
    .returning();

  if (order.length > 0) {
    const productos = JSON.parse(
      order[0].productos as string,
    ) as OrderProduct[];
    const systemOrder: SystemOrder = {
      productos: productos.map((producto) => ({
        producto: producto.id,
        cantidad: producto.cantidad,
        presentacion: producto.presentacion === "tradicional" ? "68" : "1069",
        precioProducto: 0,
        precioPresentacion:
          producto.presentacion === "tradicional" ? 1250 : 590,
        comentarios: "",
      })),
      telefono: order[0].tel,
      nombre: order[0].nombre,
      sucursalId: order[0].sucursal,
      fechaPedido: order[0].fecha,
      direccion: "",
      calle: "",
      numeroExterior: "",
      numeroInterior: "",
      colonia: "",
      municipio: "",
      referencia: "",
    };
    return { data: systemOrder, error: null };
  }
  return { data: null, error: Error("Order not found") };
};

const uploadOrderToSystem = async (
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
      return {
        data: null,
        error: new Error(`HTTP error! Status: ${response.status}`),
      };
    }

    // Parse the JSON response
    const responseData = await response.json();
    return { data: responseData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

const endpointSecret = getSecret("STRIPE_WEBHOOK_SECRET");

if (!endpointSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
}

export const POST: APIRoute = async ({ request }) => {
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
      const numberOrderId = parseInt(orderId);
      if (isNaN(numberOrderId)) {
        console.log("Order ID is not a number");
        return new Response(`Order ID is not a number`, {
          status: 400,
        });
      }

      console.log(`Order ID: ${numberOrderId}`);
      console.log("Updating order...");
      const { data, error } = await updateOrder(numberOrderId);

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
          break;
        }
        break;
      }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(`Webhook received: ${event.type}`, {
    status: 200,
  });
};
