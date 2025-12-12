import { atom, map } from "nanostores";
import type { PresentacionesType } from "./lib/pricesConfig";

export const cartOpen = atom(false);

export type CartItem = {
  id: string;
  id_pasteleria: string;
  price: {
    id: string;
    amount: number;
    discount: number;
  };
  name: string;
  size: PresentacionesType;
  image: string;
  quantity: number;
};

function getInitialItems() {
  const cartLastUpdate = JSON.parse(
    localStorage.getItem("cartLastUpdate") || "{}",
  );
  const ONE_HOUR = 60 * 60 * 1000 * 2; // 2 hours in milliseconds
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
  name,
  size,
  image,
  quantity,
}: CartItem) {
  const existingEntry = cartItems.get()[price.id];
  if (existingEntry) {
    cartItems.setKey(price.id, {
      ...existingEntry,
      price,
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
      quantity,
      price,
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
