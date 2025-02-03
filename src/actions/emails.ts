import { ActionError, defineAction } from "astro:actions";
import { getSecret } from "astro:env/server";
import { Resend } from "resend";

const resend = new Resend(getSecret("RESEND_SECRET_KEY"));

export const emails = {
  send: defineAction({
    handler: async () => {
      console.log("Sending email");
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'ecom@lapostreria77.com',
        subject: 'Hello World',
        html: '<h1>Hello World. This is a custom email, I think?</h1>',
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
