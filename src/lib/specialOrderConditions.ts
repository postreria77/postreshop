import type { OrderProduct } from "db/config";

export function checkRoscaAvailability(
  products: OrderProduct[],
  date: string,
): Boolean {
  const availableDates = ["2026-01-05", "2026-01-06"];
  return availableDates.includes(date);
}
