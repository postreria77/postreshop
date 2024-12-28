import { cartItems } from "@/store";
import { useStore } from "@nanostores/react";
import type { OrderProduct } from "db/config";

export default function CheckoutProductsInput() {
  const $items = useStore(cartItems);

  const orderProducts: OrderProduct[] = Object.values($items).map((item) => ({
    id: item.id,
    cantidad: item.quantity,
    stripePriceId: item.price.id,
    presentacion: item.size,
  }));

  return (
    <input
      type="hidden"
      hidden
      name="productos"
      value={JSON.stringify(orderProducts)}
    />
  );
}
