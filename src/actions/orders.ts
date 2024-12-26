import { defineAction } from "astro:actions";
import { z } from "astro:schema";
/* import { db, Orders } from "astro:db"; */
import { stripe } from "@/lib/stripe";
import { generateRandomInteger } from "oslo/crypto";

/* import type { OrderProduct } from "db/config"; */

export const orders = {
  create: defineAction({
    accept: "form",
    input: z.object({
      productos: z.string(),
      tel: z.string(),
      nombre: z.string(),
      calle: z.string(),
      ext: z.number(),
      int: z.number(),
      sucursal: z.number(),
    }),
    handler: async (input) => {
      const { productos, tel, nombre, calle, ext, int, sucursal } = input;

      const id = generateRandomInteger(32);

      const line_items = JSON.parse(productos).map(
        (producto: any /* : OrderProduct */) => ({
          price: producto.priceId,
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

      console.log(session);

      /*       const order = await db
        .insert(Orders)
        .values({
          id,
          productos,
          tel,
          nombre,
          calle,
          ext,
          int,
          sucursal,
          estado: "Pendiente",
          creado: new Date(),
        })
        .returning(); */

      /*       console.log(order); */

      return {
        message: "Checkout session created for order: " + id,
        url: session.url,
      };
    },
  }),
};
