import type {
  SpecialOrderDate,
  SystemOrder,
  SystemOrderProduct,
  OrderProduct,
} from "db/config";
import { db, eq, inArray, Orders, Pasteles } from "astro:db";
import {
  checkBrand,
  getSentProducts,
  getSpecialIdProducts,
} from "@/pages/api/webhook";

/**
 * Get the type of the special date to check for special IDs
 * @param dateTime - The date and time to check.
 * @returns The type of special order date if found, otherwise null.
 */
export async function checkSpecialDate(
  dateTime: string,
): Promise<SpecialOrderDate["type"] | null> {
  const date = dateTime.split("T")[0];

  const specialDates: SpecialOrderDate[] = [
    { id: "1", date: "2025-12-23", type: "1" },
    { id: "2", date: "2025-12-24", type: "2" },
  ];

  const specialDate = specialDates.find((d) => d.date === date);

  if (!specialDate) {
    return null;
  }

  return specialDate.type;
}

export type CardBrandType = "visa" | "mastercard" | "amex";

/**
 * Get the card code based on the card brand.
 * @param cardBrand - The brand of the card used for payment.
 * @returns The card code corresponding to the card brand.
 */
export function getCardCode(cardBrand: CardBrandType) {
  switch (cardBrand) {
    case "visa":
      return "0";
    case "mastercard":
      return "1";
    case "amex":
      return "2";
    default:
      return "0";
  }
}

/**
 * Update an order's status to "Pagado" and assign the corresponding card code.
 * @param orderId - The ID of the order to update.
 * @param cardBrand - The brand of the card used for payment.
 * @returns An object containing the updated order data, any error that occurred, and the email associated with the order.
 */
export const updateOrder = async (
  orderId: number,
  cardBrand: CardBrandType,
): Promise<{
  data: SystemOrder | null;
  error: Error | null;
  email: string | null;
}> => {
  const order = await db
    .update(Orders)
    .set({
      estado: "Pagado",
    })
    .where(eq(Orders.id, orderId))
    .returning();

  if (order.length <= 0) {
    return { data: null, error: Error("Order not found"), email: null };
  }

  // Check the card brand and assign the corresponding code
  const cardCode = getCardCode(cardBrand);

  const productos = JSON.parse(order[0].productos as string) as OrderProduct[];
  const systemProducts = getSentProducts(order[0].sucursal, productos);

  const isSpecialDate = await checkSpecialDate(order[0].fecha);

  let sentProducts: SystemOrderProduct[];

  if (isSpecialDate === "1" || isSpecialDate === "2") {
    const brand = checkBrand(order[0].sucursal);
    sentProducts = await getSpecialIdProducts(
      systemProducts,
      productos,
      brand,
      isSpecialDate,
    );
  } else {
    sentProducts = systemProducts;
  }

  const systemOrder: SystemOrder = {
    productos: sentProducts,
    telefono: order[0].tel,
    nombre: order[0].nombre,
    sucursalId: order[0].sucursal,
    fechaPedido: order[0].fecha,
    direccion: "",
    calle: "",
    numeroExterior: "",
    numeroInterior: "",
    colonia: "",
    municipio: "",
    referencia: "",
    forma_pago_id: cardCode,
  };

  return { data: systemOrder, error: null, email: order[0].email };
};
