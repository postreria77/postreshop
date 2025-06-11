import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, Orders, Sucursales } from "astro:db";
import { createStripeCheckout } from "@/lib/stripe";

import type { OrderProduct } from "db/config";
import { checkSaltilloTime, checkBlockedProductsForSucursal } from "@/lib/orderConditions";
import { blockOrderDate, blockSucursalesForDate, blockProductsForDate, blockProductsForSucursalesAndDate } from "@/lib/orders";

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

      // Parse items for Stripe session
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

      // Check if any products are blocked for the selected date and sucursal
      const parsedProducts = JSON.parse(productos) as OrderProduct[];
      const blockingResult = await checkBlockedProductsForSucursal(parsedProducts, fecha, sucursal);
      
      if (blockingResult.blockedProducts.length > 0) {
        const message = blockingResult.messages.length > 0 
          ? blockingResult.messages.join(". ") 
          : "Algunos productos no están disponibles para la fecha y sucursal seleccionadas. Por favor selecciona otra fecha u otra sucursal.";
        
        throw new ActionError({
          code: "BAD_REQUEST",
          message: message,
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
  lockSucursalesForDate: defineAction({
    input: z.object({
      fecha: z
        .string()
        .min(1, { message: "Selecciona una fecha." })
        .nullable()
        .refine((fecha) => fecha !== null, {
          message: "Selecciona una fecha.",
        }),
      sucursalIds: z
        .string()
        .min(1, { message: "Selecciona al menos una sucursal." })
        .nullable()
        .refine((sucursalIds) => sucursalIds !== null, {
          message: "Selecciona al menos una sucursal.",
        }),
    }),
    accept: "form",
    handler: async ({ fecha, sucursalIds }) => {
      if (typeof fecha !== "string" || typeof sucursalIds !== "string") {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error al bloquear las sucursales. Intente nuevamente.",
        });
      }

      let parsedSucursalIds: string[];
      try {
        parsedSucursalIds = JSON.parse(sucursalIds);
      } catch {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error al procesar las sucursales. Intente nuevamente.",
        });
      }

      const { message } = await blockSucursalesForDate(fecha, parsedSucursalIds);

      return {
        message: message,
      };
    },
  }),
  lockProductsForDate: defineAction({
    input: z.object({
      fecha: z
        .string()
        .min(1, { message: "Selecciona una fecha." })
        .nullable()
        .refine((fecha) => fecha !== null, {
          message: "Selecciona una fecha.",
        }),
      productIds: z
        .string()
        .min(1, { message: "Selecciona al menos un producto." })
        .nullable()
        .refine((productIds) => productIds !== null, {
          message: "Selecciona al menos un producto.",
        }),
    }),
    accept: "form",
    handler: async ({ fecha, productIds }) => {
      if (typeof fecha !== "string" || typeof productIds !== "string") {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error al bloquear los productos. Intente nuevamente.",
        });
      }

      let parsedProductIds: string[];
      try {
        parsedProductIds = JSON.parse(productIds);
      } catch {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error al procesar los productos. Intente nuevamente.",
        });
      }

      const { message } = await blockProductsForDate(fecha, parsedProductIds);

      return {
        message: message,
      };
    },
  }),
  lockProductsForSucursalesAndDate: defineAction({
    input: z.object({
      fecha: z
        .string()
        .min(1, { message: "Selecciona una fecha." })
        .nullable()
        .refine((fecha) => fecha !== null, {
          message: "Selecciona una fecha.",
        }),
      sucursalIds: z
        .string()
        .min(1, { message: "Selecciona al menos una sucursal." })
        .nullable()
        .refine((sucursalIds) => sucursalIds !== null, {
          message: "Selecciona al menos una sucursal.",
        }),
      productIds: z
        .string()
        .min(1, { message: "Selecciona al menos un producto." })
        .nullable()
        .refine((productIds) => productIds !== null, {
          message: "Selecciona al menos un producto.",
        }),
    }),
    accept: "form",
    handler: async ({ fecha, sucursalIds, productIds }) => {
      if (typeof fecha !== "string" || typeof sucursalIds !== "string" || typeof productIds !== "string") {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error al bloquear los productos para las sucursales. Intente nuevamente.",
        });
      }

      let parsedSucursalIds: string[];
      let parsedProductIds: string[];
      
      try {
        parsedSucursalIds = JSON.parse(sucursalIds);
        parsedProductIds = JSON.parse(productIds);
      } catch {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error al procesar los datos. Intente nuevamente.",
        });
      }

      const { message } = await blockProductsForSucursalesAndDate(fecha, parsedSucursalIds, parsedProductIds);

      return {
        message: message,
      };
    },
  }),
  blockDate: defineAction({
    input: z.object({
      fecha: z
        .string()
        .min(1, { message: "Selecciona una fecha." })
        .nullable()
        .refine((fecha) => fecha !== null, {
          message: "Selecciona una fecha.",
        }),
      blockType: z.enum(["day", "sucursales", "productos", "sucursales-productos"], {
        message: "Selecciona un tipo de bloqueo válido.",
      }),
      sucursalIds: z.string().optional(),
      productIds: z.string().optional(),
    }),
    accept: "form",
    handler: async ({ fecha, blockType, sucursalIds, productIds }) => {
      if (typeof fecha !== "string") {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error al procesar la fecha. Intente nuevamente.",
        });
      }

      try {
        let result;

        switch (blockType) {
          case "day":
            result = await blockOrderDate(fecha);
            break;
          
          case "sucursales":
            if (!sucursalIds) {
              throw new ActionError({
                code: "BAD_REQUEST",
                message: "Debe seleccionar al menos una sucursal.",
              });
            }
            const parsedSucursalIds = JSON.parse(sucursalIds);
            result = await blockSucursalesForDate(fecha, parsedSucursalIds);
            break;
          
          case "productos":
            if (!productIds) {
              throw new ActionError({
                code: "BAD_REQUEST",
                message: "Debe seleccionar al menos un producto.",
              });
            }
            const parsedProductIds = JSON.parse(productIds);
            result = await blockProductsForDate(fecha, parsedProductIds);
            break;
          
          case "sucursales-productos":
            if (!sucursalIds || !productIds) {
              throw new ActionError({
                code: "BAD_REQUEST",
                message: "Debe seleccionar al menos una sucursal y un producto.",
              });
            }
            const parsedSucursalIdsCombo = JSON.parse(sucursalIds);
            const parsedProductIdsCombo = JSON.parse(productIds);
            result = await blockProductsForSucursalesAndDate(fecha, parsedSucursalIdsCombo, parsedProductIdsCombo);
            break;
          
          default:
            throw new ActionError({
              code: "BAD_REQUEST",
              message: "Tipo de bloqueo no válido.",
            });
        }

        return {
          message: result.message,
        };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }
        
        // Handle JSON parsing errors
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error al procesar los datos. Verifique las selecciones e intente nuevamente.",
        });
      }
    },
  }),
};
