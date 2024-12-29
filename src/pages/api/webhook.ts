export const prerender = false;

import type { APIRoute } from "astro";
import { stripe } from "@lib/stripe";
import { db, eq, Orders } from "astro:db";
import { getSecret } from "astro:env/server";
import type { SystemOrder } from "db/config";
import { string } from "astro:schema";

const updateOrder = async (orderId: number): Promise<boolean> => {
  const order = await db
    .update(Orders)
    .set({
      estado: "Pagado",
    })
    .where(eq(Orders.id, orderId))
    .returning();

  if (order.length > 0) {
    return true;
  }
  return false;
};

const uploadOrder = async (order: SystemOrder) => {
  try {
    await fetch("https://app.rmstech.mx/api/guardar_pedido", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
  } catch (error) {
    console.error(error);
  }
};

const endpointSecret = getSecret("STRIPE_WEBHOOK_SECRET");

if (!endpointSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
}

export const POST: APIRoute = async ({ request }) => {
  console.log({
    Endpoint: "/api/webhook",
    Method: request.method,
  });

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

      const updated = await updateOrder(numberOrderId);
      if (updated === false) {
        console.log("Order not found");
        break;
      }

      let orderIdNumber: number;

      if (typeof orderId === "string") {
        orderIdNumber = parseInt(orderId);
      } else {
        orderIdNumber = orderId;
      }

      const order = await db
        .select()
        .from(Orders)
        .where(eq(Orders.id, orderIdNumber))
        .limit(1);

      if (order.length === 0) {
        console.log("Order not found");
        break;
      }

      const orderData = order[0];

      const systemOrder: SystemOrder = {
        productos: JSON.parse(orderData.productos as string),
        telefono: orderData.tel,
        nombre: orderData.nombre,
        sucursalId: orderData.sucursal,
        fechaPedido: orderData.fecha,
        direccion: "",
        calle: "",
        numeroExterior: "",
        numeroInterior: "",
        colonia: "",
        municipio: "",
        referencia: "",
      };

      uploadOrder(systemOrder);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(`Webhook received: ${event.type}`, {
    status: 200,
  });
};
