import { useStore } from "@nanostores/react";
import { cartItems } from "@/store";

export default function CartIndicator() {
  const $items = useStore(cartItems);
  return (
    <>
      {$items && Object.values($items).length > 0 && (
        <p className="rounded-sm bg-danger px-2 py-[0.125rem] text-xs leading-none text-light">
          {Object.values($items).length}
        </p>
      )}
    </>
  );
}
