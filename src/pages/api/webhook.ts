export const prerender = false;

import type { APIRoute } from "astro";
import { stripe } from "@lib/stripe";
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

type CardBrandType = "visa" | "mastercard" | "amex";

/**
 * Get the card code based on the card brand.
 * @param cardBrand - The brand of the card used for payment.
 * @returns The card code corresponding to the card brand.
 */
function getCardCode(cardBrand: CardBrandType) {
  switch (cardBrand) {
    case "visa":
      return "0";
    case "mastercard":
      return "1";
    case "amex":
      return "2";
    default:
      return "0";
  }
}

async function checkSpecialDate(
  dateTime: string,
): Promise<SpecialOrderDate["type"] | null> {
  const date = dateTime.split("T")[0];

  const specialDates: SpecialOrderDate[] = [
    { id: "1", date: "2025-12-23", type: "1" },
    { id: "2", date: "2025-12-24", type: "2" },
  ];

  const specialDate = specialDates.find((d) => d.date === date);

  if (!specialDate) {
    return null;
  }

  return specialDate.type;
}

type Brands = "postreria" | "pasteleria";

function checkBrand(sucursalId: string): Brands {
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
function getSentProducts(
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

async function getSpecialIdProducts(
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

/**
 * Update an order's status to "Pagado" and assign the corresponding card code.
 * @param orderId - The ID of the order to update.
 * @param cardBrand - The brand of the card used for payment.
 * @returns An object containing the updated order data, any error that occurred, and the email associated with the order.
 */
const updateOrder = async (
  orderId: number,
  cardBrand: CardBrandType,
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

  if (order.length <= 0) {
    return { data: null, error: Error("Order not found"), email: null };
  }

  // Check the card brand and assign the corresponding code
  const cardCode = getCardCode(cardBrand);

  const productos = JSON.parse(order[0].productos as string) as OrderProduct[];
  const systemProducts = getSentProducts(order[0].sucursal, productos);

  const isSpecialDate = await checkSpecialDate(order[0].fecha);

  let sentProducts: SystemOrderProduct[];

  if (isSpecialDate !== null) {
    const brand = checkBrand(order[0].sucursal);
    sentProducts = await getSpecialIdProducts(
      systemProducts,
      productos,
      brand,
      isSpecialDate,
    );
  } else {
    sentProducts = systemProducts;
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
