import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, Orders } from "astro:db";
import { stripe } from "@/lib/stripe";
import { generateRandomInteger, generateRandomString } from "oslo/crypto";

import type { OrderProduct } from "db/config";

export const orders = {
  create: defineAction({
    accept: "form",
    input: z.object({
      productos: z.string(),
      tel: z.string(),
      nombre: z.string(),
      sucursal: z.number(),
      fecha: z.string(),
    }),
    handler: async (input) => {
      const { productos, tel, nombre, sucursal, fecha } = input;

      const id = generateRandomInteger(32);

      const line_items = JSON.parse(productos).map(
        (producto: OrderProduct) => ({
          price: producto.stripePriceId,
          quantity: producto.cantidad,
        }),
      );

      const session = await stripe.checkout.sessions.create({
        success_url: "http://localhost:4321/order-success/" + id,
        line_items,
        mode: "payment",
        expand: ["payment_intent"],
        payment_intent_data: {
          metadata: {
            order_id: id,
          },
        },
      });

      if (!session) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear la sesión de pago. Intente nuevamente.",
        });
      }

      const order = await db
        .insert(Orders)
        .values({
          id,
          productos,
          tel,
          nombre,
          sucursal,
          fecha,
          estado: "Pendiente",
          creado: new Date().toISOString(),
          modificado: new Date().toISOString(),
        })
        .returning();

      if (!order) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear la orden. Intente nuevamente.",
        });
      }

      return {
        message: "Checkout session created for order: " + id,
        url: session.url,
      };
    },
  }),
};
