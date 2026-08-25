import { type CartItem, removeCartItem, selectedDeliveryDate } from "@/store";
import { useStore } from "@nanostores/react";

const ABUELO_DATE = "2026-08-28";
const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

export default function CartItem({
  item,
  getTotal,
  getDiscountedTotal,
}: {
  item: CartItem;
  getTotal: (item: CartItem) => number;
  getDiscountedTotal: (item: CartItem) => number;
}) {
  const handleRemoveItem = () => {
    removeCartItem(item.price);
  };

  const $deliveryDate = useStore(selectedDeliveryDate);
  const isAbueloDay = $deliveryDate === ABUELO_DATE;
  const hasDiscount =
    item.price.discount > 0 || (isAbueloDay && !!item.discountedAmount);

  return (
    <li
      key={item.id}
      className="group relative flex gap-4 border-b border-dashed border-light border-opacity-15 py-3 first:pt-0 last:border-0"
    >
      <img
        src={item.image}
        alt={item.name}
        width={80}
        height={80}
        className="aspect-square overflow-clip rounded-md border border-light border-opacity-10 object-cover"
      />
      <div className="py-2">
        <h3 className="~text-md/lg font-medium leading-none tracking-tighter">
          {item.name}
        </h3>
        <p className="mb-1 text-xs capitalize opacity-60">{item.size}</p>
        <p className="">
          {item.quantity} x{" "}
          {!hasDiscount ? (
            <span>{fmt(getDiscountedTotal(item) / 100)}</span>
          ) : (
            <>
              <span className="relative ml-auto mr-2 text-xs font-normal text-light/50">
                {fmt(getTotal(item) / 100)}
                <span
                  aria-hidden="true"
                  className="absolute -inset-x-1 top-1/2 h-[1px] bg-red-500"
                ></span>
              </span>
              {fmt(getDiscountedTotal(item) / 100)}
            </>
          )}
        </p>
      </div>
      <button
        onClick={handleRemoveItem}
        className="absolute bottom-3 right-0 text-[10px] text-red-500 after:absolute after:-left-2 after:bottom-0 after:right-0 after:h-[125%] after:w-[120%] hover:opacity-100 sm:opacity-50"
      >
        Eliminar
      </button>
    </li>
  );
}
