import { emails } from "@/actions/emails";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const email = "emireles.rosas@gmail.com";
  console.log("Sending email...");
  const { data, error } = await context.callAction(emails.send, {
    id: 1110,
    email,
  });
  if (error) {
    console.error("Error sending email:", error);
    return new Response("Error sending email", { status: 500 });
  } else {
    console.log("Email sent to: " + email + " with Order ID: " + data?.id);
    return new Response("Email sent successfully", { status: 200 });
  }
};
