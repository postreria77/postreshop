import { cartItems } from "@/store";
import { useStore } from "@nanostores/react";
/* import type { OrderProduct } from "db/config"; */

type OrderProduct = {
  id: number | string;
  priceId: string;
  presentacion: string;
  cantidad: number;
};

export default function CheckoutProductsInput() {
  const $items = useStore(cartItems);

  const orderProducts: OrderProduct[] = Object.values($items).map((item) => ({
    id: item.id,
    priceId: item.price.id,
    presentacion: item.size,
    cantidad: item.quantity,
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
