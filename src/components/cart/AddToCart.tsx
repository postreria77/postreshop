import { cva, type VariantProps } from "class-variance-authority";
import { type CartItem, addCartItem, cartOpen } from "@/store";

const button = cva("button", {
  variants: {
    intent: {
      primary: [
        "rounded-sm",
        "border",
        "border-light",
        "border-opacity-25",
        "bg-light",
        "bg-opacity-5",
        "transition",
        "duration-75",
        "ease-out",
        "hover:border-brand",
        "hover:border-opacity-50",
        "hover:bg-brand",
        "hover:bg-opacity-15",
        "hover:text-brand-2",
        "focus:outline-brand",
      ],
    },
    buttonSize: {
      small: ["text-[10px]", "px-2"],
      medium: ["text-xs", "py-1", "px-3"],
      large: ["text-base", "py-2", "px-4"],
    },
  },
  defaultVariants: {
    intent: "primary",
    buttonSize: "small",
  },
});

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof button> {
  intent?: "primary";
  buttonSize?: "small" | "medium" | "large";
}

export default function AddToCart({
  id,
  id_pasteleria,
  price,
  name,
  size,
  image,
  quantity,
  category,
  intent,
  buttonSize,
  children,
}: CartItem & ButtonProps) {
  const handleAddToCart = () => {
    cartOpen.set(true);
    document.body.classList.add("overflow-hidden");
    addCartItem({
      id,
      id_pasteleria,
      price,
      name,
      size,
      image,
      quantity,
      category,
    });
  };

  return (
    <div>
      <button
        onClick={handleAddToCart}
        className={button({ intent, buttonSize })}
      >
        {children}
      </button>
    </div>
  );
}
