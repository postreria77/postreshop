import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, Orders, Sucursales } from "astro:db";
import { createStripeCheckout } from "@/lib/stripe";

import type { OrderProduct } from "db/config";
import { checkSaltilloTime } from "@/lib/orderConditions";
import { blockOrderDate } from "@/lib/orders";

export const orders = {
  create: defineAction({
    accept: "form",
    input: z.object({
      productos: z.string(),
      nombre: z
        .string()
        .max(48, { message: "El nombre debe tener menos de 48 letras." })
        .min(3, { message: "El nombre debe tener al menos 3 letras." })
        .nonempty({ message: "Ingresa un nombre." })
        .nullable()
        .refine((name) => name !== null, {
          message: "Ingresa un nombre.",
        }),
      apellido: z
        .string()
        .max(48, { message: "El apellido debe tener menos de 48 letras." })
        .min(3, { message: "El apellido debe tener al menos 3 letras." })
        .nonempty({ message: "Ingresa un apellido." })
        .nullable()
        .refine((name) => name !== null, {
          message: "Ingresa un apellido.",
        }),
      tel: z
        .string()
        .min(10, { message: "El teléfono debe tener 10 dígitos." })
        .max(10, { message: "El teléfono debe tener 10 dígitos." })
        .nonempty({ message: "Ingresa un teléfono." })
        .nullable()
        .refine((tel) => tel !== null, {
          message: "Ingresa un teléfono.",
        }),
      email: z.string().email().nonempty({ message: "Ingresa un correo." }),
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
      hora: z
        .string()
        .min(1, { message: "Selecciona una hora." })
        .nullable()
        .refine((hora) => hora !== null, {
          message: "Selecciona una hora.",
        }),
    }),
    handler: async (input) => {
      const { productos, tel, email, nombre, apellido, sucursal, fecha, hora } =
        input;

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

      // Check if the sucursal is blocked
      if (checkSaltilloTime(fecha, sucursal) === false) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Esta sucursal no recibe pedidos los domingos.",
        });
      }

      const nombreCompleto = `${nombre} ${apellido}`;
      const fechaCompleta = `${fecha}T${hora}`;

      const order = await db
        .insert(Orders)
        .values({
          productos,
          tel,
          email,
          nombre: nombreCompleto.toLowerCase(),
          sucursal,
          fecha: fechaCompleta,
          estado: "Pendiente",
          creado: new Date().toISOString(),
          modificado: new Date().toISOString(),
        })
        .returning();

      if (order.length === 0) {
        console.log("Error al crear la orden.");
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear la orden. Intente nuevamente.",
        });
      }

      const id = order[0].id;
      const { connectedStripeAccount } = await db
        .select()
        .from(Sucursales)
        .where(eq(Sucursales.id, sucursal))
        .then((sucursales) => sucursales[0]);

      if (!connectedStripeAccount) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear la sesión de pago. Intente nuevamente.",
        });
      }

      const session = await createStripeCheckout(
        connectedStripeAccount,
        id,
        line_items,
      );

      if (!session) {
        console.log("Error al crear la orden.");
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
  lockDate: defineAction({
    input: z.object({
      fecha: z
        .string()
        .min(1, { message: "Selecciona una fecha." })
        .nullable()
        .refine((fecha) => fecha !== null, {
          message: "Selecciona una fecha.",
        }),
    }),
    accept: "form",
    handler: async ({ fecha }) => {
      if (typeof fecha !== "string") {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error al bloquear la fecha. Intente nuevamente.",
        });
      }

      const { message } = await blockOrderDate(fecha);

      return {
        message: message,
      };
    },
  }),
};
