import { db, eq, inArray, Orders, Pasteles, Sucursales } from "astro:db";
import type { Order, OrderProduct, Sucursal } from "db/config";

export type ReceiptInformation = Omit<Order, "sucursal" | "productos"> & {
  productos: ReceiptDetailsProduct[];
  sucursal: Sucursal;
  total: string;
};

type ReceiptDetailsProduct = OrderProduct & {
  nombre: string;
  precio: number;
  imagen: string;
  importe: number;
};

export async function getReceiptInformation(
  orderId: number,
): Promise<ReceiptInformation> {
  const order = await db.select().from(Orders).where(eq(Orders.id, orderId));

  if (order.length < 1) {
    throw new Error("Order not found");
  }

  // Correctly cast as OrderProduct from the stringified JSON
  const productosOrden = JSON.parse(
    order[0].productos as string,
  ) as OrderProduct[];

  // Get the pasteles by their IDs
  const pasteles = await db
    .select()
    .from(Pasteles)
    .where(
      inArray(
        Pasteles.id,
        productosOrden.map((p) => p.id),
      ),
    );

  // Cast the pasteles to the correct types
  const productos = productosOrden.map((p) => {
    let importe: number;

    switch (p.presentacion) {
      case "tradicional":
        importe = 1250;
        break;
      case "anytime":
        importe = 590;
        break;
      case "gift":
        importe = 330;
        break;
      default:
        importe = 1250; // Fallback price
        break;
    }

    const pastel = pasteles.find((pastel) => pastel.id === p.id);
    return {
      ...p,
      nombre: pastel?.nombre || "",
      precio: pastel?.precio || 0,
      imagen: pastel?.imagen || "",
      importe: importe,
    } as ReceiptDetailsProduct;
  });

  // Get the total for the order
  const total = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(
    productos.reduce((acc, item) => acc + item.importe * item.cantidad, 0),
  );

  // Get the sucursal by it's ID
  const sucursal = await db
    .select()
    .from(Sucursales)
    .where(eq(Sucursales.id, order[0].sucursal));

  // Cast all the information to the correct types
  return {
    ...order[0],
    productos,
    total,
    sucursal: sucursal[0],
  };
}
