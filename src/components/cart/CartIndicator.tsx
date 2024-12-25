import { useStore } from "@nanostores/react";
import { cartItems } from "@/store";

export default function CartIndicator() {
  const $items = useStore(cartItems);
  return (
    <>
      {$items && Object.values($items).length > 0 && (
        <p className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-red-500 text-xs">
          {Object.values($items).length}
        </p>
      )}
    </>
  );
}
