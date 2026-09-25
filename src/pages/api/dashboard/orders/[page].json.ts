import { db, Orders, Pasteles, count, like, eq, asc, desc, or, and, inArray } from "astro:db";
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
  const sort = url.searchParams.get("sort") === "asc" ? "asc" : "desc";
  const buscar = url.searchParams.get("buscar")?.trim() || "";
  const fechaEntrega = url.searchParams.get("fechaEntrega")?.trim() || "";
  const fechaPedido = url.searchParams.get("fechaPedido")?.trim() || "";

  const orderBy = sort === "asc" ? asc(Orders.fecha) : desc(Orders.fecha);

  const isId = buscar && /^\d+$/.test(buscar);
  const searchFilter = buscar
    ? isId
      ? eq(Orders.id, parseInt(buscar))
      : or(like(Orders.nombre, `%${buscar}%`), like(Orders.email, `%${buscar}%`))
    : undefined;
  const fechaEntregaFilter = fechaEntrega ? like(Orders.fecha, `${fechaEntrega}%`) : undefined;
  const fechaPedidoFilter = fechaPedido ? like(Orders.creado, `${fechaPedido}%`) : undefined;

  const filters = [searchFilter, fechaEntregaFilter, fechaPedidoFilter].filter(Boolean);
  const whereClause = filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : and(...(filters as any[]));

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
