// export const prerender = false;

// import { updateOrder } from "@/lib/systemOrders";
// import { uploadOrderToSystem } from "@/pages/api/webhook";
// import type { APIRoute } from "astro";

// export const POST: APIRoute = async ({ request }) => {
//   const { id, brand } = await request.json();
//   console.log("id", id);
//   console.log("brand", brand);
//   const { data, error } = await updateOrder(parseInt(id), brand);
//   if (data) {
//     const systemUpload = await uploadOrderToSystem(data);

//     console.log("System upload status:", systemUpload);
//   }
//   return new Response(
//     JSON.stringify({
//       data: data,
//       error: error,
//     }),
//     {
//       status: 200,
//     },
//   );
// };

// export const GET: APIRoute = async () => {
//   return new Response(
//     JSON.stringify({ message: "Order retrieved successfully" }),
//     {
//       status: 200,
//     },
//   );
// };
