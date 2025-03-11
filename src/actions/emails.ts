import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";
import { getSecret } from "astro:env/server";
import { Resend } from "resend";

import Receipt from "@/emails/Receipt";
import { getReceiptInformation } from "@/lib/orders";

const resend = new Resend(getSecret("RESEND_SECRET_KEY"));

export const emails = {
  send: defineAction({
    input: z.object({
      id: z.number(),
      email: z.string().email().nonempty(),
    }),
    handler: async ({ id, email }) => {
      const order = await getReceiptInformation(id);

      if (!order) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const { data, error } = await resend.emails.send({
        from: "no-reply@shop.lapostreria77.com",
        to: email,
        subject: `Recibo de Compra #${order.id}`,
        react: Receipt({ order }),
      });

      if (error) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return data;
    },
  }),
};
