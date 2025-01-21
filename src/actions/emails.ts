import { ActionError, defineAction } from "astro:actions";
import { Resend } from "resend";

const key = process.env.RESEND_SECRET_KEY;

const resend = new Resend(key);

export const emails = {
  send: defineAction({
    accept: "form",
    handler: async () => {
      const { data, error } = await resend.emails.send({
        from: "Postreshop <onboarding@resend.dev>",
        to: ["emireles.rosas@gmail.com"],
        subject: "Postreshop Confirmation",
        html: "<p>This is a test email :)</p>",
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
