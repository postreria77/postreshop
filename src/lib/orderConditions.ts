import { db, eq, DisabledDateTimes } from "astro:db";
import type { OrderProduct } from "db/config";

// Función 1: Revisa si hay productos o días bloqueados en la base de datos
export const checkBlockedProductsForSucursal = async (
  products: OrderProduct[],
  date: string,
  sucursalId: string
) => {
  const blockedProducts: string[] = [];
  const messages: string[] = [];

  // Obtenemos las reglas de bloqueo para la fecha seleccionada
  const blockedRules = await db
    .select()
    .from(DisabledDateTimes)
    .where(eq(DisabledDateTimes.date, date));

  for (const rule of blockedRules) {
    // Verificar si la regla aplica a esta sucursal
    let appliesToSucursal = false;

    // Si es null o "null", aplica a todas las sucursales
    if (!rule.sucursales || rule.sucursales === "null") {
      appliesToSucursal = true;
    } else {
      // Si tiene una lista específica, revisamos si la sucursal actual está ahí
      try {
        const sucursalesArray = JSON.parse(rule.sucursales as string);
        if (Array.isArray(sucursalesArray) && sucursalesArray.includes(sucursalId)) {
          appliesToSucursal = true;
        }
      } catch (e) {
        console.error("Error al leer sucursales bloqueadas:", e);
      }
    }

    if (appliesToSucursal) {
      // Caso A: El día completo está bloqueado
      if (rule.dayDisabled === 1) {
        messages.push("La sucursal no está disponible en esta fecha.");
        return { blockedProducts, messages };
      }

      // Caso B: Solo ciertos productos están bloqueados
      if (rule.productos) {
        try {
          const ruleProducts = JSON.parse(rule.productos as string);
          for (const product of products) {
            if (ruleProducts.includes(product.stripePriceId)) {
              blockedProducts.push(product.name || "Producto");
              messages.push(
                `El producto "${product.name}" no está disponible para la fecha seleccionada.`
              );
            }
          }
        } catch (e) {
          console.error("Error al leer productos bloqueados:", e);
        }
      }
    }
  }

  return { blockedProducts, messages };
};

// Función 2: Validador de Gift Cake (La dejamos pasando siempre para evitar errores)
export const checkGiftOnPasteleria = async (
  products: OrderProduct[],
  sucursalId: string
) => {
  return true;
};
