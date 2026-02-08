import { cartItems } from "@/store";
import { useStore } from "@nanostores/react";
import type { OrderProduct } from "db/config";
import { useEffect } from "react";

// Fechas bloqueadas
const DISABLED_DATES = ["2025-12-25", "2026-01-01"];

// ID de pastelería del Pistache
const PISTACHE_ID = "101";

export default function CheckoutProductsInput({
  selectedDate,
  onPistacheBlocked,
}: {
  selectedDate: any;
  onPistacheBlocked?: () => void;
}) {
  const $items = useStore(cartItems);

  const DISCOUNT_DATE = "2026-02-14";

  const selectedDateStr = selectedDate
    ? selectedDate instanceof Date
      ? selectedDate.toISOString().split("T")[0]
      : `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`
    : null;

  const isBlockedDate =
    selectedDateStr && DISABLED_DATES.includes(selectedDateStr);

  const isDiscountDate = selectedDateStr === DISCOUNT_DATE;

  const orderProducts: OrderProduct[] = Object.values($items).map((item) => ({
    id: item.id,
    id_pasteleria: item.id_pasteleria,
    cantidad: item.quantity,
    precio: isDiscountDate
      ? (item.price.amount - item.price.discount) / 100
      : item.price.amount / 100,
    stripePriceId: item.price.id,
    discountedStripePriceId: item.discountedPrice,
    presentacion: item.size,
    categoria: item.category,
  }));

  // Si es fecha bloqueada intenta eliminar el Pistache
  const filteredProducts = isBlockedDate
    ? orderProducts.filter((p) => p.id_pasteleria !== PISTACHE_ID)
    : orderProducts;

  // Detecta si quitamos el Pistache → dispara el mensaje
  useEffect(() => {
    if (isBlockedDate) {
      const hadPistache = orderProducts.some(
        (p) => p.id_pasteleria === PISTACHE_ID,
      );
      if (hadPistache && onPistacheBlocked) {
        onPistacheBlocked();
      }
    }
  }, [selectedDateStr]);

  return (
    <input
      type="hidden"
      hidden
      name="productos"
      value={JSON.stringify(filteredProducts)}
    />
  );
}
