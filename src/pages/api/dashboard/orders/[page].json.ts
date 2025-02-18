import { db, Orders, count } from "astro:db";
import type { Params } from "astro";
import type { Order } from "db/config";

export const prerender = false;

export type OrderAPIResponse = {
  orders: Order[];
  totalPages: number;
  currentPage: number;
};

export async function GET({ params }: { params: Params }) {
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 15;
  const offset = (page - 1) * limit;
  const orders = await db.select().from(Orders).limit(limit).offset(offset);
  const totalNumbers = await db
    .select({ value: count(Orders.id) })
    .from(Orders);
  const response: OrderAPIResponse = {
    orders,
    totalPages: Math.ceil(totalNumbers[0].value / limit),
    currentPage: page,
  };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    }
  });
}
