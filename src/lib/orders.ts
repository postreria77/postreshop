import {
  db,
  eq,
  inArray,
  Orders,
  Pasteles,
  Sucursales,
  DisabledDateTimes,
  Productos,
} from "astro:db";
import type {
  Order,
  OrderProduct,
  Sucursal,
  DisabledDateTime,
  ProductosIdsSistema,
} from "db/config";
import { getPresentacionPrice } from "./pricesConfig";

/*
 * DisabledDateTimes ID Naming Strategy:
 *
 * - "YYYY-MM-DD" = Block entire day (dayDisabled: true)
 * - "YYYY-MM-DD-sucursales" = Block specific sucursales for the date
 * - "YYYY-MM-DD-productos" = Block specific products globally for the date
 * - "YYYY-MM-DD-sucursales-productos" = Block specific products for specific sucursales
 *
 * Examples:
 * - "2025-06-20" → Block June 20th completely
 * - "2025-06-21-sucursales" → Block sucursales ["44", "109"] on June 21st
 * - "2025-06-22-productos" → Block products ["price_123", "price_456"] globally on June 22nd
 * - "2025-06-23-sucursales-productos" → Block products ["price_123"] for sucursales ["44"] on June 23rd
 */

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
  const productos = JSON.parse(order[0].productos as string) as OrderProduct[];

  // Get the pasteles by their IDs
  const pasteles = await db
    .select()
    .from(Pasteles)
    .where(
      inArray(
        Pasteles.id,
        productos.map((p) => p.id),
      ),
    );

  const roscas = await db
    .select()
    .from(Productos)
    .where(eq(Productos.categoria, "roscas"));

  // Cast the pasteles to the correct types
  const pastelesOrden = productos.map((p) => {
    let importe = getPresentacionPrice(p.categoria, p.presentacion);

    const pastel = pasteles.find((pastel) => pastel.id === p.id);
    return {
      ...p,
      nombre: pastel?.nombre || "",
      precio: pastel?.precio || 0,
      imagen: pastel?.imagen || "",
      importe: p.precio ?? importe,
    } as ReceiptDetailsProduct;
  });

  const productosOrden = productos.map((p) => {
    let importe = getPresentacionPrice(p.categoria, p.presentacion);

    const producto = roscas.find((producto) => {
      const parsedIds = producto.ids_sistema as ProductosIdsSistema;
      return parsedIds.postreria === p.id;
    });
    return {
      ...p,
      nombre: producto?.nombre || "",
      precio: producto?.precioStripe || 0,
      imagen: producto?.imagen || "",
      importe: p.precio ?? importe,
    } as ReceiptDetailsProduct;
  });

  const sentProducts = [...pastelesOrden, ...productosOrden];

  // Get the total for the order
  const total = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(
    pastelesOrden.reduce((acc, item) => acc + item.importe * item.cantidad, 0) +
      productosOrden.reduce(
        (acc, item) => acc + item.importe * item.cantidad,
        0,
      ),
  );

  // Get the sucursal by it's ID
  const sucursal = await db
    .select()
    .from(Sucursales)
    .where(eq(Sucursales.id, order[0].sucursal));

  // Cast all the information to the correct types
  return {
    ...order[0],
    productos: sentProducts,
    total,
    sucursal: sucursal[0],
  };
}

interface BlockedDateResponse {
  disabledDate: DisabledDateTime;
  message: string;
}

export async function blockOrderDate(
  date: string,
): Promise<BlockedDateResponse> {
  const existingEntry = await db
    .select()
    .from(DisabledDateTimes)
    .where(eq(DisabledDateTimes.date, date))
    .limit(1);

  if (existingEntry[0] && existingEntry[0].dayDisabled) {
    return {
      disabledDate: existingEntry[0],
      message: `La fecha ${date} ya ha sido bloqueada.`,
    };
  }

  const disabledDate = await db
    .insert(DisabledDateTimes)
    .values({
      id: date,
      date,
      dayDisabled: true,
    })
    .returning();

  return {
    disabledDate: disabledDate[0],
    message: `La fecha ${date} fue bloqueada correctamente.`,
  };
}

// Block sucursales for a specific date
export async function blockSucursalesForDate(
  date: string,
  sucursalIds: string[],
): Promise<BlockedDateResponse> {
  const existingEntry = await db
    .select()
    .from(DisabledDateTimes)
    .where(eq(DisabledDateTimes.id, `${date}-sucursales`))
    .limit(1);

  if (existingEntry[0]) {
    return {
      disabledDate: existingEntry[0],
      message: `Ya existe un bloqueo de sucursales para la fecha ${date}.`,
    };
  }

  const disabledDate = await db
    .insert(DisabledDateTimes)
    .values({
      id: `${date}-sucursales`,
      date,
      dayDisabled: false,
      sucursales: sucursalIds,
    })
    .returning();

  return {
    disabledDate: disabledDate[0],
    message: `Las sucursales fueron bloqueadas correctamente para la fecha ${date}.`,
  };
}

// Block products globally for a specific date
export async function blockProductsForDate(
  date: string,
  productIds: string[],
): Promise<BlockedDateResponse> {
  const existingEntry = await db
    .select()
    .from(DisabledDateTimes)
    .where(eq(DisabledDateTimes.id, `${date}-productos`))
    .limit(1);

  if (existingEntry[0]) {
    return {
      disabledDate: existingEntry[0],
      message: `Ya existe un bloqueo de productos para la fecha ${date}.`,
    };
  }

  const disabledDate = await db
    .insert(DisabledDateTimes)
    .values({
      id: `${date}-productos`,
      date,
      dayDisabled: false,
      productos: productIds,
    })
    .returning();

  return {
    disabledDate: disabledDate[0],
    message: `Los productos fueron bloqueados correctamente para la fecha ${date}.`,
  };
}

// Block specific products for specific sucursales on a specific date
export async function blockProductsForSucursalesAndDate(
  date: string,
  sucursalIds: string[],
  productIds: string[],
): Promise<BlockedDateResponse> {
  const existingEntry = await db
    .select()
    .from(DisabledDateTimes)
    .where(eq(DisabledDateTimes.id, `${date}-sucursales-productos`))
    .limit(1);

  if (existingEntry[0]) {
    return {
      disabledDate: existingEntry[0],
      message: `Ya existe un bloqueo de productos para sucursales específicas en la fecha ${date}.`,
    };
  }

  const disabledDate = await db
    .insert(DisabledDateTimes)
    .values({
      id: `${date}-sucursales-productos`,
      date,
      dayDisabled: false,
      sucursales: sucursalIds,
      productos: productIds,
    })
    .returning();

  return {
    disabledDate: disabledDate[0],
    message: `Los productos fueron bloqueados correctamente para las sucursales especificadas en la fecha ${date}.`,
  };
}
