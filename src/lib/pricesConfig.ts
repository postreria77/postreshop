import type { Product } from "./stripe";

export type PresentacionesType = "tradicional" | "anytime" | "gift";

export type PresentacionesPrice = Record<PresentacionesType, number>;

export const PRESENTACIONES_PRICE: PresentacionesPrice = {
  tradicional: 1340,
  anytime: 650,
  gift: 370,
};

export const PRESENTACIONES_DISCOUNT: PresentacionesPrice = {
  tradicional: 350,
  anytime: 100,
  gift: 80,
};

export interface PresentacionesIds {
  tradicional: { postreria: string; pasteleria: string };
  anytime: { postreria: string; pasteleria: string };
  gift: { postreria: string; pasteleria: string };
}

export const PRESENTACIONES_ID: PresentacionesIds = {
  tradicional: { postreria: "68", pasteleria: "198" },
  anytime: { postreria: "1069", pasteleria: "199" },
  gift: { postreria: "1284", pasteleria: "359" },
};

function isPresentacionValid(
  presentacion: any,
): presentacion is PresentacionesType {
  return (
    presentacion &&
    Object.prototype.hasOwnProperty.call(PRESENTACIONES_PRICE, presentacion)
  );
}

export function getPresentacionPrice(presentacion: any): number {
  if (isPresentacionValid(presentacion)) {
    return PRESENTACIONES_PRICE[presentacion];
  }
  return PRESENTACIONES_PRICE.tradicional; // Fallback price
}

// Nuevas configuraciones para tabla de productos

export type ProductCategoryTypes = "pasteles" | "roscas";

export type PresentacionesRoscasType = "grande" | "chica";

export type ProductPresentacionesType<T extends ProductCategoryTypes> =
  T extends "pasteles"
    ? PresentacionesType
    : T extends "roscas"
      ? PresentacionesRoscasType
      : never;

export type ProductsPricesType = {
  pasteles: Record<PresentacionesType, number>;
  roscas: Record<PresentacionesRoscasType, number>;
};

export const PRESENTACIONES_PRODUCTOS_PRICES: ProductsPricesType = {
  pasteles: {
    tradicional: 1340,
    anytime: 650,
    gift: 370,
  },
  roscas: {
    grande: 849,
    chica: 649,
  },
};
