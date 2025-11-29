import { useStore } from "@nanostores/react";
import { cartItems } from "@/store";
import CartItem from "./CartItem";
import type { CartItem as CartItemType } from "@/store";
import { PRESENTACIONES_DISCOUNT } from "@/lib/pricesConfig";

export default function CartList() {
  const $items = useStore(cartItems);

  function getTotal(item: CartItemType) {
    return item.price.amount * item.quantity;
  }

  function getDiscountedTotal(item: CartItemType) {
    switch (item.size) {
      case "tradicional":
        return (
          (item.price.amount - PRESENTACIONES_DISCOUNT.tradicional * 100) *
          item.quantity
        );
      case "anytime":
        return (
          (item.price.amount - PRESENTACIONES_DISCOUNT.anytime * 100) *
          item.quantity
        );
      case "gift":
        return (
          (item.price.amount - PRESENTACIONES_DISCOUNT.gift * 100) *
          item.quantity
        );
      default:
        return (
          (item.price.amount - PRESENTACIONES_DISCOUNT.tradicional * 100) *
          item.quantity
        );
    }
  }

  return (
    <div>
      {Object.keys($items).length === 0 ? (
        <p className="mb-4">No hay artículos en el carrito</p>
      ) : (
        <>
          {/* Display item list */}
          <ul className="mb-4 border-b border-light border-opacity-25">
            {Object.values($items).map((item) => (
              <CartItem
                key={item.price.id}
                item={item}
                getTotal={getTotal}
                getDiscountedTotal={getDiscountedTotal}
              />
            ))}
          </ul>
          {/* Display Cart Total */}
          <p className="flex items-center font-medium">
            <span className="text-lg tracking-tighter">Total</span>
            <span className="relative ml-auto mr-2 text-sm font-normal text-light/50">
              {`${new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(
                Object.values($items).reduce(
                  (acc, item) => acc + getTotal(item),
                  0,
                ) / 100,
              )}`}
              <div
                aria-hidden="true"
                className="absolute -inset-x-1 top-1/2 h-[1px] bg-red-500"
              ></div>
            </span>
            <span className="text-xl">
              {`${new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(
                Object.values($items).reduce(
                  (acc, item) => acc + getDiscountedTotal(item),
                  0,
                ) / 100,
              )}`}
            </span>
          </p>
        </>
      )}
    </div>
  );
}
