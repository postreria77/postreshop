import { useStore } from "@nanostores/react";
import { cartItems, removeCartItem } from "@/store";
import CartItem from "./CartItem";

export default function CartList() {
  const $items = useStore(cartItems);

  const handleRemoveItem = (itemId: string) => {
    removeCartItem(itemId);
  };

  return (
    <div>
      {Object.keys($items).length === 0 ? (
        <p className="mb-4">No hay artículos en el carrito</p>
      ) : (
        <>
          {/* Display item list */}
          <ul className="mb-4 border-b border-light border-opacity-25">
            {Object.values($items).map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </ul>
          {/* Display Cart Total */}
          <p className="flex items-center justify-between font-medium">
            <span className="text-lg tracking-tighter">Total</span>
            <span className="text-xl">
              {`${new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(
                Object.values($items).reduce(
                  (acc, item) => acc + item.price.amount * item.quantity,
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
