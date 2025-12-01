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

const initialCartItems =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("cartItems") || "{}")
    : {};

export const cartItems = map<Record<string, CartItem>>({
  ...initialCartItems,
});

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
    localStorage.setItem("cartItems", JSON.stringify(cartItems.get()));
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
    localStorage.setItem("cartItems", JSON.stringify(cartItems.get()));
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
    localStorage.setItem("cartItems", JSON.stringify(cartItems.get()));
  } else {
    cartItems.setKey(price.id, {
      ...existingEntry,
      quantity: existingEntry.quantity - 1,
    });
    localStorage.setItem("cartItems", JSON.stringify(cartItems.get()));
  }
}

export function clearCart() {
  cartItems.set({});
  localStorage.removeItem("cartItems");
}
