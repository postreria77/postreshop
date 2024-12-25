import { type CartItem, removeCartItem } from "@/store";

export default function CartItem({ item }: { item: CartItem }) {
  const handleRemoveItem = () => {
    removeCartItem(item.id);
  };

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
        <h3 className="text-lg font-medium leading-none tracking-tighter">
          {item.name}
        </h3>
        <p className="mb-1 text-xs capitalize opacity-60">{item.size}</p>
        <p className="">
          {item.quantity} x{" "}
          {`${new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
          }).format(item.price.amount / 100)}`}
        </p>
      </div>
      <button
        onClick={handleRemoveItem}
        className="absolute right-0 top-[40%] text-transparent opacity-50 hover:opacity-100 group-hover:text-red-500"
      >
        Eliminar
      </button>
    </li>
  );
}
