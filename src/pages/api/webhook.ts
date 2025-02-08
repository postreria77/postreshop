export const prerender = false;

import type { APIRoute } from "astro";
import { stripe } from "@lib/stripe";
import { db, eq, Orders } from "astro:db";
import { getSecret } from "astro:env/server";
import type { OrderProduct, SystemOrder } from "db/config";
import { actions } from "astro:actions";
import { emails } from "@/actions/emails";

const updateOrder = async (
  orderId: number,
  cardBrand: string,
): Promise<{
  data: SystemOrder | null;
  error: Error | null;
  email: string | null;
}> => {
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

    // Check the card brand and assign the corresponding code
    let cardCode = "";
    switch (cardBrand) {
      case "visa":
        cardCode = "0";
        break;
      case "mastercard":
        cardCode = "1";
        break;
      case "amex":
        cardCode = "2";
        break;
    }

    let sentProducts;
    if (order[0].sucursal === "520" || order[0].sucursal === "536") {
      sentProducts = productos.map((producto) => {
        let presentacion;
        let precioPresentacion;

        // Using switch for better readability
        switch (producto.presentacion) {
          case "tradicional":
            presentacion = "198";
            precioPresentacion = 1250;
            break;
          case "anytime":
            presentacion = "199";
            precioPresentacion = 590;
            break;
          case "gift":
            presentacion = "359";
            precioPresentacion = 330;
            break;
          default:
            presentacion = "198"; // Fallback for any other case
            precioPresentacion = 1250; // Fallback price
            break;
        }

        return {
          producto: producto.id_pasteleria,
          cantidad: producto.cantidad,
          presentacion: presentacion,
          precioProducto: 0,
          precioPresentacion: precioPresentacion,
          comentarios: "",
        };
      });
    } else {
      sentProducts = productos.map((producto) => {
        let presentacion;
        let precioPresentacion;

        // Using switch for better readability
        switch (producto.presentacion) {
          case "tradicional":
            presentacion = "68";
            precioPresentacion = 1250;
            break;
          case "anytime":
            presentacion = "1069";
            precioPresentacion = 590;
            break;
          case "gift":
            presentacion = "1284";
            precioPresentacion = 330;
            break;
          default:
            presentacion = "198"; // Fallback for any other case
            precioPresentacion = 1250; // Fallback price
            break;
        }

        return {
          producto: producto.id,
          cantidad: producto.cantidad,
          presentacion: presentacion,
          precioProducto: 0,
          precioPresentacion: precioPresentacion,
          comentarios: "",
        };
      });
    }

    const systemOrder: SystemOrder = {
      productos: sentProducts,
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
      forma_pago_id: cardCode,
    };
    return { data: systemOrder, error: null, email: order[0].email };
  }
  return { data: null, error: Error("Order not found"), email: null };
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

  async function getCardBrand(paymentMethodId: string): Promise<string | null> {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    const cardBrand = paymentMethod.card?.brand;
    if (!cardBrand) {
      return null;
    }
    return cardBrand;
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
          break;
        }
        console.log("Sending email...");
        break;
      }

      if (email) {
        const { data, error } = await callAction(emails.send, {
          id: numberOrderId,
          email,
        });

        if (error) {
          console.error(error.message);
          break;
        }

        console.log("Email sent to: " + email + " with data: " + data);
      }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(`Webhook received: ${event.type}`, {
    status: 200,
  });
};
