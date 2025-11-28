export type PresentacionesType = "tradicional" | "anytime" | "gift";

export interface PresentacionesPrice {
  tradicional: number;
  anytime: number;
  gift: number;
}

export const PRESENTACIONES_PRICE: PresentacionesPrice = {
  tradicional: 1340,
  anytime: 650,
  gift: 369,
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
