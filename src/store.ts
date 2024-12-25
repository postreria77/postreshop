import { atom, map } from "nanostores";

export const cartOpen = atom(false);

export type CartItem = {
  id: string;
  price: {
    id: string;
    amount: number;
  };
  name: string;
  size: string;
  image: string;
  quantity: number;
};

export const cartItems = map<Record<string, CartItem>>({});

export function addCartItem({
  id,
  price,
  name,
  size,
  image,
  quantity,
}: CartItem) {
  const existingEntry = cartItems.get()[id];
  if (existingEntry) {
    cartItems.setKey(id, {
      ...existingEntry,
      quantity: existingEntry.quantity + quantity,
    });
  } else {
    cartItems.setKey(id, { id, name, image, quantity, price, size });
  }
}

export function removeCartItem(id: string) {
  const existingEntry = cartItems.get()[id];
  if (!existingEntry) return;
  if (existingEntry.quantity === 1) {
    // Remove the entire entry
    const itemsWithoutEntry = Object.entries(cartItems.get()).filter(
      ([key]) => key !== id,
    );
    cartItems.set(Object.fromEntries(itemsWithoutEntry));
  } else {
    cartItems.setKey(id, {
      ...existingEntry,
      quantity: existingEntry.quantity - 1,
    });
  }
}
