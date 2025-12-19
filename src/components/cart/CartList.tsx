import { useStore } from "@nanostores/react";
import { cartItems } from "@/store";
import CartItem from "./CartItem";
import type { CartItem as CartItemType } from "@/store";

export default function CartList() {
  const $items = useStore(cartItems);

  function getTotal(item: CartItemType) {
    return item.price.amount * item.quantity;
  }

  function getDiscountedTotal(item: CartItemType) {
    return (item.price.amount - item.price.discount) * item.quantity;
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
          <Total
            getTotal={getTotal}
            getDiscountedTotal={getDiscountedTotal}
            items={$items}
          />
        </>
      )}
    </div>
  );
}

function Total({
  getTotal,
  getDiscountedTotal,
  items,
}: {
  getTotal: (item: CartItemType) => number;
  getDiscountedTotal: (item: CartItemType) => number;
  items: Record<string, CartItemType>;
}) {
  const total =
    Object.values(items).reduce((acc, item) => acc + getTotal(item), 0) / 100;
  const discountedTotal =
    Object.values(items).reduce(
      (acc, item) => acc + getDiscountedTotal(item),
      0,
    ) / 100;

  return (
    <div className="flex items-center font-medium">
      <span className="mr-auto text-lg tracking-tighter">Total</span>
      {total > discountedTotal && (
        <span className="relative mr-2 text-sm font-normal text-light/50">
          {`${new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
          }).format(total)}`}
          <div
            aria-hidden="true"
            className="absolute -inset-x-1 top-1/2 h-[1px] bg-red-500"
          ></div>
        </span>
      )}
      <span className="text-xl">
        {`${new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(discountedTotal)}`}
      </span>
    </div>
  );
}
