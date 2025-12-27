import type { OrderProduct } from "db/config";

export function checkRoscaAvailability(
  products: OrderProduct[],
  date: string,
  time: string,
): { available: boolean; message: string } {
  const isRosca = products.some((product) => product.categoria === "roscas");
  console.log("isRosca:", isRosca);
  if (!isRosca) return { available: true, message: "" };

  const availableDates = ["2026-01-05", "2026-01-06"];
  if (!availableDates.includes(date))
    return {
      available: false,
      message:
        "Solo se pueden realizar pedidos de Rosca para los días 5 y 6 de enero.",
    };

  // Parse time string "HH:mm:ss"
  const [hour, minute, second] = time.split(":").map(Number);
  const timeInMinutes = hour * 60 + minute;

  if (date === "2026-01-05") {
    // Orders must be between 15:00 and 20:00
    const startTime = 15 * 60; // 15:00 in minutes
    const endTime = 20 * 60; // 20:00 in minutes
    return {
      available: timeInMinutes >= startTime && timeInMinutes <= endTime,
      message:
        "Solo se pueden realizar pedidos para el 5 entre las 15:00 y 20:00",
    };
  }

  if (date === "2026-01-06") {
    // Orders must be between 12:00 and 20:00
    const startTime = 12 * 60; // 12:00 in minutes
    const endTime = 20 * 60; // 20:00 in minutes
    return {
      available: timeInMinutes >= startTime && timeInMinutes <= endTime,
      message:
        "Solo se pueden realizar pedidos para el 6 entre las 12:00 y 20:00",
    };
  }

  return false;
}
