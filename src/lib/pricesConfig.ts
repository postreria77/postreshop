export type PresentacionesType = "tradicional" | "anytime" | "gift";

export interface PresentacionesPrice {
  tradicional: number;
  anytime: number;
  gift: number;
}

export const PRESENTACIONES_PRICE: PresentacionesPrice = {
  tradicional: 1290,
  anytime: 620,
  gift: 350,
};
