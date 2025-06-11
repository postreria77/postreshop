import { db, eq, DisabledDateTimes } from "astro:db";
import type { OrderProduct } from "db/config";

export function checkSaltilloTime(date: string, sucursalId: string): boolean {
  const blockedSucursales = [{ id: "109" }, { id: "520" }, { id: "50" }];

  const isBlockedSucursal = blockedSucursales.some(
    (sucursal) => sucursal.id === sucursalId,
  );

  if (isBlockedSucursal) {
    // Parse date parts directly to avoid timezone conversion issues
    const dateParts = date.split("-");
    if (dateParts.length !== 3) {
      throw new Error("Invalid date format");
    }

    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(dateParts[2]);

    // Create date object with local date parts (no timezone confusion)
    const localDate = new Date(year, month, day);
    const dayOfWeek = localDate.getDay();

    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    if (dayOfWeek === 0) {
      return false;
    }

    return true;
  }

  return true;
}

// Function to check if any products are blocked on the selected date
export async function checkBlockedProducts(productos: OrderProduct[], fecha: string): Promise<string[]> {
  const blockedProducts: string[] = [];
  
  // Get disabled date entry for the selected date
  const disabledDateEntry = await db
    .select()
    .from(DisabledDateTimes)
    .where(eq(DisabledDateTimes.date, fecha))
    .limit(1);

  if (disabledDateEntry.length === 0) {
    return blockedProducts; // No restrictions for this date
  }

  const disabledDate = disabledDateEntry[0];
  
  // If the entire day is disabled, all products are blocked
  if (disabledDate.dayDisabled) {
    return productos.map(p => p.stripePriceId);
  }

  // Check if specific products are blocked
  if (disabledDate.productos) {
    let blockedProductIds: string[] = [];
    
    if (Array.isArray(disabledDate.productos)) {
      blockedProductIds = disabledDate.productos as string[];
    } else if (typeof disabledDate.productos === "string") {
      try {
        blockedProductIds = JSON.parse(disabledDate.productos);
      } catch {
        blockedProductIds = [];
      }
    }

    // Check each product in the order against the blocked list
    productos.forEach(producto => {
      if (blockedProductIds.includes(producto.stripePriceId)) {
        blockedProducts.push(producto.stripePriceId);
      }
    });
  }

  return blockedProducts;
}
