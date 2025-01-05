import { type CartItem, addCartItem, cartOpen } from "@/store";

export default function AddToCart({
  id,
  price,
  name,
  size,
  image,
  quantity,
}: CartItem) {
  const handleAddToCart = () => {
    cartOpen.set(true);
    addCartItem({ id, price, name, size, image, quantity });
  };

  return (
    <div>
      <button
        onClick={handleAddToCart}
        className="rounded-sm border border-light border-opacity-25 bg-light bg-opacity-5 px-2 text-[10px] transition duration-75 ease-out hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand"
      >
        {size === "tradicional" ? "Tradicional +" : "Anytime +"}
      </button>
    </div>
  );
}
