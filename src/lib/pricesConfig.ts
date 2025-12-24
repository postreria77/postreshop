import type { Product } from "./stripe";

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

// export function getPresentacionPrice(presentacion: any): number {
//   if (isPresentacionValid(presentacion)) {
//     return PRESENTACIONES_PRICE[presentacion];
//   }
//   return PRESENTACIONES_PRICE.tradicional; // Fallback price
// }

// Nuevas configuraciones para tabla de productos

export type ProductCategoryTypes = "pasteles" | "roscas";

export type PresentacionesType = "tradicional" | "anytime" | "gift";
export type PresentacionesRoscasType = "grande" | "chica";

export type ProductPresentacionesType<T extends ProductCategoryTypes> =
  T extends "pasteles"
    ? PresentacionesType
    : T extends "roscas"
      ? PresentacionesRoscasType
      : never;

export function isCategory<T extends ProductCategoryTypes>(
  categoria: ProductCategoryTypes,
  expected: T,
): categoria is ProductCategoryTypes {
  return categoria === expected;
}

export function getPresentacionIds(
  categoria: ProductCategoryTypes,
  presentacion: string,
) {
  let presentacionType;
  switch (categoria) {
    case "pasteles":
      presentacionType = presentacion as ProductPresentacionesType<"pasteles">;
      return PRODUCT_PRESENTACIONES_ID.pasteles[presentacionType];
    case "roscas":
      presentacionType = presentacion as ProductPresentacionesType<"roscas">;
      return PRODUCT_PRESENTACIONES_ID.roscas[presentacionType];
    default:
      throw new Error(`Invalid category: ${categoria}`);
  }
}

export type ProductsPricesType = {
  pasteles: Record<PresentacionesType, number>;
  roscas: Record<PresentacionesRoscasType, number>;
};

export function getPresentacionPrice(
  categoria: ProductCategoryTypes,
  presentacion: string,
): number {
  let presentacionType;
  switch (categoria) {
    case "pasteles":
      presentacionType = presentacion as ProductPresentacionesType<"pasteles">;
      return PRODUCTOS_PRESENTACIONES_PRICES.pasteles[presentacionType];
    case "roscas":
      presentacionType = presentacion as ProductPresentacionesType<"roscas">;
      return PRODUCTOS_PRESENTACIONES_PRICES.roscas[presentacionType];
    default:
      return 0;
  }
}

export const PRODUCTOS_PRESENTACIONES_PRICES: ProductsPricesType = {
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

export type ProductPresentacionesIds = {
  pasteles: Record<
    ProductPresentacionesType<"pasteles">,
    { postreria: string; pasteleria: string }
  >;
  roscas: Record<
    ProductPresentacionesType<"roscas">,
    { postreria: string; pasteleria: string }
  >;
};

export const PRODUCT_PRESENTACIONES_ID: ProductPresentacionesIds = {
  pasteles: {
    tradicional: { postreria: "68", pasteleria: "198" },
    anytime: { postreria: "1069", pasteleria: "199" },
    gift: { postreria: "1284", pasteleria: "359" },
  },
  roscas: {
    grande: { postreria: "28", pasteleria: "354" },
    chica: { postreria: "29", pasteleria: "400" },
  },
};
