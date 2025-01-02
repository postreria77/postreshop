import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, Orders } from "astro:db";
import { stripe } from "@/lib/stripe";

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

      const line_items = JSON.parse(productos).map(
        (producto: OrderProduct) => ({
          price: producto.stripePriceId,
          quantity: producto.cantidad,
        }),
      );

      try {
        JSON.parse(productos) as OrderProduct[];
      } catch (error) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error en los productos. Intente nuevamente.",
        });
      }

      const order = await db
        .insert(Orders)
        .values({
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

      const id = order[0].id;

      const session = await stripe.checkout.sessions.create({
        success_url: "https://postreshop.vercel.app/order-success/" + id,
        line_items,
        mode: "payment",
        payment_intent_data: {
          metadata: {
            order_id: id,
          },
        },
      });

      if (!session) {
        await db
          .update(Orders)
          .set({ estado: "Error en Stripe" })
          .where(eq(Orders.id, id));
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear la sesión de pago. Intente nuevamente.",
        });
      }

      return {
        message: "Checkout session created for order: " + id,
        url: session.url,
      };
    },
  }),
};
