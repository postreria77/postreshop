import type { OrderProduct } from "db/config";

export function checkRoscaAvailability(
  products: OrderProduct[],
  date: string,
): Boolean {
  const isRosca = products.some((product) => product.categoria === "roscas");
  console.log("isRosca:", isRosca);
  if (!isRosca) return true;
  const availableDates = ["2026-01-05", "2026-01-06"];
  return availableDates.includes(date);
}
