import { atom, map } from "nanostores";
import type {
  ProductCategoryTypes,
  ProductPresentacionesType,
} from "./lib/pricesConfig";

export const cartOpen = atom(false);

export type CartItem = {
  id: string;
  id_pasteleria: string;
  price: {
    id: string;
    amount: number;
    discount: number;
  };
  discountedPrice?: string;
  name: string;
  size:
    | ProductPresentacionesType<"pasteles">
    | ProductPresentacionesType<"roscas">;
  category: ProductCategoryTypes;
  image: string;
  quantity: number;
};

function getInitialItems() {
  const cartLastUpdate = JSON.parse(
    localStorage.getItem("cartLastUpdate") || "{}",
  );
  const ONE_HOUR = 60 * 60 * 1000 * 2; // 2 hourspt-section-lg in milliseconds
  const isExpired = Date.now() - cartLastUpdate > ONE_HOUR;
  console.log("isExpired", isExpired);

  if (isExpired) {
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cartLastUpdate");
    return {};
  }

  return JSON.parse(localStorage.getItem("cartItems") || "{}");
}

const initialCartItems = typeof window !== "undefined" ? getInitialItems() : {};

export const cartItems = map<Record<string, CartItem>>({
  ...initialCartItems,
});

function updateCartItems() {
  localStorage.setItem("cartItems", JSON.stringify(cartItems.get()));
}

function updateCartUpdateTime() {
  localStorage.setItem("cartLastUpdate", JSON.stringify(Date.now()));
}

export function addCartItem({
  id,
  id_pasteleria,
  price,
  discountedPrice,
  name,
  size,
  image,
  category,
  quantity,
}: CartItem) {
  console.log("[Cart] Adding item:", { name, price, discountedPrice });
  const existingEntry = cartItems.get()[price.id];
  if (existingEntry) {
    cartItems.setKey(price.id, {
      ...existingEntry,
      price,
      discountedPrice,
      quantity: existingEntry.quantity + quantity,
    });
    updateCartItems();
    updateCartUpdateTime();
  } else {
    cartItems.setKey(price.id, {
      id,
      id_pasteleria,
      name,
      image,
      category,
      quantity,
      price,
      discountedPrice,
      size,
    });
    updateCartItems();
    updateCartUpdateTime();
  }
}

export function removeCartItem(price: { id: string }) {
  const existingEntry = cartItems.get()[price.id];
  if (!existingEntry) return;
  if (existingEntry.quantity === 1) {
    // Remove the entire entry
    const itemsWithoutEntry = Object.entries(cartItems.get()).filter(
      ([key]) => key !== price.id,
    );
    cartItems.set(Object.fromEntries(itemsWithoutEntry));
    updateCartItems();
    updateCartUpdateTime();
  } else {
    cartItems.setKey(price.id, {
      ...existingEntry,
      quantity: existingEntry.quantity - 1,
    });
    updateCartItems();
    updateCartUpdateTime();
  }
}

export function clearCart() {
  cartItems.set({});
  localStorage.removeItem("cartItems");
}
