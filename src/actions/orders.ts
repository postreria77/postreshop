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
      tel: z
        .string()
        .min(10, { message: "El teléfono debe tener 10 dígitos." })
        .max(10, { message: "El teléfono debe tener 10 dígitos." })
        .nonempty({ message: "Ingresa un teléfono." })
        .nullable()
        .refine((tel) => tel !== null, {
          message: "Ingresa un teléfono.",
        }),
      nombre: z
        .string()
        .max(48, { message: "El nombre debe tener menos de 48 letras." })
        .min(3, { message: "El nombre debe tener al menos 3 letras." })
        .nonempty({ message: "Ingresa un nombre." })
        .nullable()
        .refine((name) => name !== null, {
          message: "Ingresa un nombre.",
        }),
      sucursal: z
        .string()
        .min(1, { message: "Selecciona una sucursal." })
        .nullable()
        .refine((sucursal) => sucursal !== null, {
          message: "Selecciona una sucursal.",
        }),
      fecha: z
        .string()
        .min(1, { message: "Selecciona una fecha." })
        .nullable()
        .refine((fecha) => fecha !== null, {
          message: "Selecciona una fecha.",
        }),
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
