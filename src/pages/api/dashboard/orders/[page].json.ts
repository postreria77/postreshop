import { db, Orders, Pasteles, count, like, asc, desc, or, and, inArray } from "astro:db";
import type { Params } from "astro";
import type { Order, OrderProduct } from "db/config";

export const prerender = false;

export type OrderProductDetalle = {
  nombre: string;
  cantidad: number;
  presentacion: string;
};

export type OrderAPIResponse = {
  orders: (Order & { productosDetalle: OrderProductDetalle[] })[];
  totalPages: number;
  currentPage: number;
};

export async function GET({ params, request }: { params: Params; request: Request }) {
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 15;
  const offset = (page - 1) * limit;

  const url = new URL(request.url);
  const fecha = url.searchParams.get("fecha");
  const sort = url.searchParams.get("sort") === "asc" ? "asc" : "desc";
  const buscar = url.searchParams.get("buscar")?.trim() || "";

  const orderBy = sort === "asc" ? asc(Orders.fecha) : desc(Orders.fecha);

  const searchFilter = buscar
    ? or(like(Orders.nombre, `%${buscar}%`), like(Orders.email, `%${buscar}%`))
    : undefined;

  const fechaFilter = fecha ? like(Orders.fecha, `${fecha}%`) : undefined;

  const whereClause =
    searchFilter && fechaFilter
      ? and(fechaFilter, searchFilter)
      : searchFilter ?? fechaFilter;

  const orders = await db
    .select()
    .from(Orders)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const totalNumbers = await db
    .select({ value: count(Orders.id) })
    .from(Orders)
    .where(whereClause);

  // Collect unique pastel IDs from all orders to fetch names
  const allProductos = orders.flatMap((order) => {
    try {
      return JSON.parse(order.productos as string) as OrderProduct[];
    } catch {
      return [];
    }
  });
  const uniqueIds = [...new Set(allProductos.map((p) => p.id))];

  let pastelMap: Record<string, string> = {};
  if (uniqueIds.length > 0) {
    const pasteles = await db
      .select({ id: Pasteles.id, nombre: Pasteles.nombre })
      .from(Pasteles)
      .where(inArray(Pasteles.id, uniqueIds));
    pastelMap = Object.fromEntries(pasteles.map((p) => [p.id, p.nombre]));
  }

  const enrichedOrders = orders.map((order) => {
    let productosDetalle: OrderProductDetalle[] = [];
    try {
      const productos = JSON.parse(order.productos as string) as OrderProduct[];
      productosDetalle = productos.map((p) => ({
        nombre: pastelMap[p.id] ?? p.id,
        cantidad: p.cantidad,
        presentacion: p.presentacion,
      }));
    } catch {}
    return { ...order, productosDetalle };
  });

  const response: OrderAPIResponse = {
    orders: enrichedOrders,
    totalPages: Math.ceil(totalNumbers[0].value / limit),
    currentPage: page,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
