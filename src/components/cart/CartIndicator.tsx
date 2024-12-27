import { useStore } from "@nanostores/react";
import { cartItems } from "@/store";

export default function CartIndicator() {
  const $items = useStore(cartItems);
  return (
    <>
      {$items && Object.values($items).length > 0 && (
        <p className="absolute -right-2 -top-2 grid place-items-center rounded-full bg-red-500 ~text-[.6rem]/xs ~size-5/6">
          {Object.values($items).length}
        </p>
      )}
    </>
  );
}
