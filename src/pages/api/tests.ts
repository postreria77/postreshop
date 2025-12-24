export const prerender = false;

import { updateOrder, uploadOrderToSystem } from "@/lib/systemOrders";
import { sendEmailReceipt } from "@/lib/systemOrders";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, callAction }) => {
  const { id, brand, email } = await request.json();
  console.log("id", id);
  console.log("brand", brand);
  console.log("email", email);
  const numberId = parseInt(id);
  const { data, error } = await updateOrder(numberId, brand);
  if (data) {
    const systemUpload = await uploadOrderToSystem(data, numberId);

    console.log("System upload status:", systemUpload);
  }
  sendEmailReceipt(numberId, email, callAction);
  return new Response(
    JSON.stringify({
      data: data,
      error: error,
    }),
    {
      status: 200,
    },
  );
};

// export const GET: APIRoute = async () => {
//   return new Response(
//     JSON.stringify({ message: "Order retrieved successfully" }),
//     {
//       status: 200,
//     },
//   );
// };

// export const POST: APIRoute = async ({ request, callAction }) => {
//   const { id, email } = await request.json();
//   console.log("id", id);
//   console.log("email", email);
//   const numberId = parseInt(id);
//   sendEmailReceipt(numberId, email, callAction);
//   return new Response("Received", {
//     status: 200,
//   });
// };
